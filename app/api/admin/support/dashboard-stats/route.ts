import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// Admin emails that can access this endpoint
const ADMIN_EMAILS = ['jonescraig@me.com'];

export async function GET(request: NextRequest) {
  const supabase = createServerClient();

  try {
    // Get admin user from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let adminEmail: string | null = null;

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      adminEmail = user?.email || null;
    }

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date for 7-day window
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    // ========================================================================
    // FETCH ALL DATA
    // ========================================================================

    // Total customers with active purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('id, user_id, course_type, purchased_at, status')
      .eq('status', 'active');

    if (purchasesError) {
      console.error('Purchases fetch error:', purchasesError);
    }

    // Total certificates
    const { data: certificates, error: certsError } = await supabase
      .from('certificates')
      .select('id, user_id, course_type, issued_at');

    if (certsError) {
      console.error('Certificates fetch error:', certsError);
    }

    // Profiles with attorney info and court state
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, attorney_name, attorney_email, court_state');

    if (profilesError) {
      console.error('Profiles fetch error:', profilesError);
    }

    // ========================================================================
    // CALCULATE METRICS
    // ========================================================================

    // Unique customers with purchases
    const uniqueCustomerIds = new Set(purchases?.map(p => p.user_id) || []);
    const totalCustomers = uniqueCustomerIds.size;

    // Unique graduates (customers with certificates)
    const uniqueGraduateIds = new Set(certificates?.map(c => c.user_id) || []);
    const totalGraduates = uniqueGraduateIds.size;

    // Completion rate
    const completionRate = totalCustomers > 0 
      ? Math.round((totalGraduates / totalCustomers) * 100) 
      : 0;

    // Attorney percentage (of graduates)
    const graduateProfiles = profiles?.filter(p => uniqueGraduateIds.has(p.id)) || [];
    const graduatesWithAttorney = graduateProfiles.filter(
      p => p.attorney_name || p.attorney_email
    ).length;
    const attorneyRate = graduateProfiles.length > 0 
      ? Math.round((graduatesWithAttorney / graduateProfiles.length) * 100) 
      : 0;

    // Average days to complete
    let avgDaysToComplete = 0;
    if (purchases && certificates && purchases.length > 0 && certificates.length > 0) {
      const completionTimes: number[] = [];
      
      for (const cert of certificates) {
        // Find the matching purchase for this user
        const userPurchase = purchases.find(p => p.user_id === cert.user_id);
        if (userPurchase && cert.issued_at && userPurchase.purchased_at) {
          const purchaseDate = new Date(userPurchase.purchased_at);
          const certDate = new Date(cert.issued_at);
          const daysDiff = (certDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysDiff >= 0) {
            completionTimes.push(daysDiff);
          }
        }
      }
      
      if (completionTimes.length > 0) {
        avgDaysToComplete = Math.round(
          (completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length) * 10
        ) / 10;
      }
    }

    // Course breakdown
    const courseBreakdown = {
      coparenting: 0,
      parenting: 0,
      bundle: 0,
    };
    purchases?.forEach(p => {
      if (p.course_type === 'coparenting') courseBreakdown.coparenting++;
      else if (p.course_type === 'parenting') courseBreakdown.parenting++;
      else if (p.course_type === 'bundle') courseBreakdown.bundle++;
    });

    // State breakdown (from graduates only - they have court_state filled)
    const stateCount: Record<string, number> = {};
    graduateProfiles.forEach(p => {
      if (p.court_state) {
        const state = p.court_state.trim();
        stateCount[state] = (stateCount[state] || 0) + 1;
      }
    });
    
    // Sort by count descending
    const topStates = Object.entries(stateCount)
      .sort((a, b) => b[1] - a[1])
      .map(([state, count]) => ({ state, count }));

    // Last 7 days activity
    const recentPurchases = purchases?.filter(
      p => p.purchased_at && new Date(p.purchased_at) >= sevenDaysAgo
    ).length || 0;
    
    const recentGraduates = certificates?.filter(
      c => c.issued_at && new Date(c.issued_at) >= sevenDaysAgo
    ).length || 0;

    // Exam pass rate
    const { data: examAttempts } = await supabase
      .from('exam_attempts')
      .select('id, passed, user_id');
    
    const totalAttempts = examAttempts?.length || 0;
    const passedAttempts = examAttempts?.filter(e => e.passed).length || 0;
    const examPassRate = totalAttempts > 0 
      ? Math.round((passedAttempts / totalAttempts) * 100) 
      : 0;

    // First-attempt pass rate
    const userFirstAttempts = new Map<string, boolean>();
    examAttempts?.forEach(attempt => {
      if (!userFirstAttempts.has(attempt.user_id)) {
        userFirstAttempts.set(attempt.user_id, attempt.passed);
      }
    });
    const firstAttemptPasses = Array.from(userFirstAttempts.values()).filter(passed => passed).length;
    const firstAttemptPassRate = userFirstAttempts.size > 0
      ? Math.round((firstAttemptPasses / userFirstAttempts.size) * 100)
      : 0;

    // Stuck students (purchased 30+ days ago, no certificate)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const stuckStudents = purchases?.filter(p => {
      if (!p.purchased_at) return false;
      const purchaseDate = new Date(p.purchased_at);
      const isOld = purchaseDate < thirtyDaysAgo;
      const hasNoCert = !uniqueGraduateIds.has(p.user_id);
      return isOld && hasNoCert;
    }).length || 0;

    // ========================================================================
    // RETURN STATS
    // ========================================================================

    return NextResponse.json({
      totalCustomers,
      totalGraduates,
      completionRate,
      attorneyRate,
      avgDaysToComplete,
      courseBreakdown,
      topStates,
      recentActivity: {
        purchases: recentPurchases,
        graduates: recentGraduates,
      },
      examStats: {
        passRate: examPassRate,
        firstAttemptPassRate,
        totalAttempts,
      },
      stuckStudents,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
