import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Admin emails that can access this endpoint
const ADMIN_EMAILS = ['jonescraig@me.com'];

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    // Get admin user from Authorization header (passed from client)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let adminEmail: string | null = null;

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      adminEmail = user?.email || null;
    }

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { query, type } = await request.json();

    if (!query || !type) {
      return NextResponse.json({ error: 'Missing query or type' }, { status: 400 });
    }

    // Initialize response structure
    const customerData = {
      profile: null as any,
      authUser: null as any,
      purchases: [] as any[],
      courseProgress: [] as any[],
      examAttempts: [] as any[],
      certificates: [] as any[],
      orphan: false,
      message: '',
    };

    let userId: string | null = null;
    let email: string | null = null;

    // Step 1: Find the user based on search type
    switch (type) {
      case 'email':
        email = query.toLowerCase().trim();

        // Search in profiles
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', email!)
          .single();

        if (profileByEmail) {
          customerData.profile = profileByEmail;
          userId = profileByEmail.id;
        }

        // Search in auth.users via admin API
        const { data: authUsers } = await supabase.auth.admin.listUsers();
        const authUser = authUsers?.users.find((u) => u.email?.toLowerCase() === email);

        if (authUser) {
          customerData.authUser = {
            id: authUser.id,
            email: authUser.email,
            email_confirmed_at: authUser.email_confirmed_at,
            created_at: authUser.created_at,
            last_sign_in_at: authUser.last_sign_in_at,
          };

          // Check for orphan: auth exists but no profile
          if (!profileByEmail) {
            customerData.orphan = true;
            customerData.message = 'ORPHAN USER: Exists in auth but not in profiles table';
            return NextResponse.json(customerData);
          }

          userId = userId || authUser.id;
        }
        break;

      case 'name':
        const searchName = query.trim();

        // Search by full_name or legal_name
        const { data: profilesByName } = await supabase
          .from('profiles')
          .select('*')
          .or(`full_name.ilike.%${searchName}%,legal_name.ilike.%${searchName}%`)
          .limit(1);

        if (profilesByName && profilesByName.length > 0) {
          customerData.profile = profilesByName[0];
          userId = profilesByName[0].id;
          email = profilesByName[0].email;
        }
        break;

      case 'phone':
        const searchPhone = query.replace(/\D/g, ''); // Remove non-digits

        const { data: profileByPhone } = await supabase
          .from('profiles')
          .select('*')
          .ilike('phone', `%${searchPhone}%`)
          .limit(1)
          .single();

        if (profileByPhone) {
          customerData.profile = profileByPhone;
          userId = profileByPhone.id;
          email = profileByPhone.email;
        }
        break;

      case 'stripe':
        // Search Stripe by payment intent or customer ID
        try {
          let stripeCustomerId: string | null = null;

          if (query.startsWith('pi_')) {
            // It's a payment intent
            const paymentIntent = await stripe.paymentIntents.retrieve(query);
            stripeCustomerId = paymentIntent.customer as string;
          } else if (query.startsWith('cs_')) {
            // It's a checkout session
            const session = await stripe.checkout.sessions.retrieve(query);
            stripeCustomerId = session.customer as string;
            email = session.customer_details?.email || null;
          } else if (query.startsWith('cus_')) {
            // It's a customer ID
            stripeCustomerId = query;
          }

          if (stripeCustomerId) {
            const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
            if (!('deleted' in stripeCustomer)) {
              email = stripeCustomer.email;
            }
          }

          // Now search by email if we found one
          if (email) {
            const { data: profileByStripe } = await supabase
              .from('profiles')
              .select('*')
              .ilike('email', email!)
              .single();

            if (profileByStripe) {
              customerData.profile = profileByStripe;
              userId = profileByStripe.id;
            }
          }
        } catch (stripeErr) {
          // Stripe lookup failed, continue without
          console.error('Stripe lookup failed:', stripeErr);
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }

    // If no user found, return error
    if (!userId && !email) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Step 2: Fetch all related data
    if (userId) {
      // Fetch auth user if not already fetched
      if (!customerData.authUser) {
        const { data: authData } = await supabase.auth.admin.getUserById(userId);
        if (authData?.user) {
          customerData.authUser = {
            id: authData.user.id,
            email: authData.user.email,
            email_confirmed_at: authData.user.email_confirmed_at,
            created_at: authData.user.created_at,
            last_sign_in_at: authData.user.last_sign_in_at,
          };
        }
      }

      // Fetch profile if not already fetched
      if (!customerData.profile) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
        customerData.profile = profile;
      }

      // Fetch purchases
      const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false });
      customerData.purchases = purchases || [];

      // Fetch course progress
      const { data: progress } = await supabase
        .from('course_progress')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });
      customerData.courseProgress = progress || [];

      // Fetch exam attempts
      const { data: exams } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false });
      customerData.examAttempts = exams || [];

      // Fetch certificates
      const { data: certs } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });
      customerData.certificates = certs || [];
    }

    return NextResponse.json(customerData);
  } catch (error) {
    console.error('Customer lookup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
