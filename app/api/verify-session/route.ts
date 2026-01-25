import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

// ============================================
// COURSE NAME MAPPING
// ============================================

const COURSE_NAMES: Record<string, string> = {
  coparenting: 'Clase de Coparentalidad',
  parenting: 'Clase de Crianza',
  bundle: 'El Paquete Completo',
};

// ============================================
// MAIN HANDLER
// ============================================

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'Sesión no válida' },
      { status: 400 }
    );
  }

  try {
    // Retrieve Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Validate session is paid
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'El pago no ha sido completado' },
        { status: 400 }
      );
    }

    // Extract details
    const customerEmail = session.customer_email || session.customer_details?.email || '';
    const courseType = session.metadata?.course_type || 'coparenting';
    const amountTotal = session.amount_total || 0;

    // Format amount as currency
    const formattedAmount = new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: session.currency?.toUpperCase() || 'USD',
    }).format(amountTotal / 100);

    return NextResponse.json({
      success: true,
      courseName: COURSE_NAMES[courseType] || courseType,
      amount: formattedAmount,
      email: customerEmail,
    });

  } catch (error) {
    console.error('Session verification error:', error);
    
    // Check if it's a Stripe error (session not found, etc.)
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { success: false, error: 'No pudimos verificar su compra. El enlace puede haber expirado.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Error al verificar la compra' },
      { status: 500 }
    );
  }
}
