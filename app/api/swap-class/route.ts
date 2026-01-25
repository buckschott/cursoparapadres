import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * API endpoint to swap a user's class from one type to another.
 * 
 * RULE: Each purchase gets ONE free swap. Ever.
 * 
 * Eligibility:
 * - Must own an individual class (not bundle)
 * - Must have completed fewer than 2 lessons
 * - Must not already own the target class or bundle
 * - Must not have passed exam
 * - Must not have certificate
 * - Must not have already used their swap (has_swapped = false)
 * 
 * What it does:
 * - Updates purchase.course_type
 * - Sets purchase.has_swapped = true
 * - Deletes old course_progress
 * - Creates new course_progress for target class
 * - Deletes any exam attempts for old class
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with cookie-based auth for user verification
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore - headers already sent
            }
          },
        },
      }
    );
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error in swap-class:', authError);
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fromClass, toClass } = body;

    console.log(`Swap request: user=${user.id}, from=${fromClass}, to=${toClass}`);

    // Validate class types
    const validClasses = ['coparenting', 'parenting'];
    if (!validClasses.includes(fromClass) || !validClasses.includes(toClass)) {
      return NextResponse.json(
        { error: 'Tipo de clase inválido' },
        { status: 400 }
      );
    }

    if (fromClass === toClass) {
      return NextResponse.json(
        { error: 'Ya está inscrito en esta clase' },
        { status: 400 }
      );
    }

    // Use admin client for database operations (bypasses RLS)
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if user has the source class
    const { data: sourcePurchase, error: purchaseError } = await adminSupabase
      .from('purchases')
      .select('id, course_type, has_swapped')
      .eq('user_id', user.id)
      .eq('course_type', fromClass)
      .eq('status', 'active')
      .single();

    if (purchaseError || !sourcePurchase) {
      console.log('No source purchase found:', purchaseError);
      return NextResponse.json(
        { error: 'No tiene esta clase' },
        { status: 400 }
      );
    }

    // ============================================
    // CHECK: Has user already used their ONE free swap?
    // ============================================
    if (sourcePurchase.has_swapped === true) {
      console.log(`User ${user.id} already used their swap for purchase ${sourcePurchase.id}`);
      return NextResponse.json(
        { error: 'Ya utilizó su cambio gratuito. Solo se permite un cambio por compra.' },
        // Translation: "You already used your free switch. Only one switch per purchase is allowed."
        { status: 400 }
      );
    }

    // Check if user already owns target class or bundle
    const { data: existingPurchases } = await adminSupabase
      .from('purchases')
      .select('course_type')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const ownedClasses = existingPurchases?.map(p => p.course_type) || [];
    
    if (ownedClasses.includes(toClass)) {
      return NextResponse.json(
        { error: 'Ya tiene acceso a esta clase' },
        { status: 400 }
      );
    }

    if (ownedClasses.includes('bundle')) {
      return NextResponse.json(
        { error: 'Ya tiene el paquete completo' },
        { status: 400 }
      );
    }

    // Check lesson progress (must have < 2 lessons completed)
    const { data: progress } = await adminSupabase
      .from('course_progress')
      .select('lessons_completed')
      .eq('user_id', user.id)
      .eq('course_type', fromClass)
      .single();

    const lessonsCompleted = progress?.lessons_completed?.length || 0;
    
    if (lessonsCompleted >= 2) {
      return NextResponse.json(
        { error: 'Ya ha completado demasiadas lecciones para cambiar de clase' },
        { status: 400 }
      );
    }

    // Check user hasn't passed exam for source class
    const { data: passedExamForClass } = await adminSupabase
      .from('exam_attempts')
      .select('id, purchase_id')
      .eq('user_id', user.id)
      .eq('purchase_id', sourcePurchase.id)
      .eq('passed', true)
      .limit(1);

    if (passedExamForClass && passedExamForClass.length > 0) {
      return NextResponse.json(
        { error: 'Ya aprobó el examen de esta clase' },
        { status: 400 }
      );
    }

    // Check user doesn't have certificate for source class
    const { data: certificate } = await adminSupabase
      .from('certificates')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_type', fromClass)
      .limit(1);

    if (certificate && certificate.length > 0) {
      return NextResponse.json(
        { error: 'Ya tiene un certificado para esta clase' },
        { status: 400 }
      );
    }

    // ============================================
    // PERFORM THE SWAP
    // ============================================

    console.log(`Performing swap for purchase ${sourcePurchase.id}: ${fromClass} → ${toClass}`);

    // 1. Update purchase course_type AND set has_swapped = true
    const { error: updatePurchaseError } = await adminSupabase
      .from('purchases')
      .update({ 
        course_type: toClass,
        has_swapped: true  // Mark as used - no more swaps allowed
      })
      .eq('id', sourcePurchase.id);

    if (updatePurchaseError) {
      console.error('Error updating purchase:', updatePurchaseError);
      return NextResponse.json(
        { error: 'Error al cambiar la clase' },
        { status: 500 }
      );
    }

    // 2. Delete old course_progress (if exists)
    const { error: deleteProgressError } = await adminSupabase
      .from('course_progress')
      .delete()
      .eq('user_id', user.id)
      .eq('course_type', fromClass);

    if (deleteProgressError) {
      console.error('Error deleting old progress:', deleteProgressError);
      // Don't fail - continue anyway
    }

    // 3. Create new course_progress for target class
    const { error: createProgressError } = await adminSupabase
      .from('course_progress')
      .insert({
        user_id: user.id,
        course_type: toClass,
        current_lesson: 1,
        lessons_completed: [],
      });

    if (createProgressError) {
      console.error('Error creating new progress:', createProgressError);
      // Don't fail - user can still access course
    }

    // 4. Delete any exam attempts for the old class
    const { error: deleteExamsError } = await adminSupabase
      .from('exam_attempts')
      .delete()
      .eq('purchase_id', sourcePurchase.id);

    if (deleteExamsError) {
      console.error('Error deleting exam attempts:', deleteExamsError);
      // Don't fail - not critical
    }

    console.log(`✓ Class swapped successfully for user ${user.id}: ${fromClass} → ${toClass} (swap used)`);

    return NextResponse.json({
      success: true,
      message: 'Clase cambiada exitosamente',
      newClassType: toClass,
    });

  } catch (error) {
    console.error('Error in swap-class API:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
