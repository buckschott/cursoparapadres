import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

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

    const health = {
      supabase: 'down' as 'healthy' | 'degraded' | 'down',
      stripe: 'down' as 'healthy' | 'degraded' | 'down',
      resend: 'down' as 'healthy' | 'degraded' | 'down',
      lastCheck: new Date().toISOString(),
    };

    // Check Supabase
    try {
      const startTime = Date.now();
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const duration = Date.now() - startTime;

      if (error) {
        health.supabase = 'down';
      } else if (duration > 2000) {
        health.supabase = 'degraded';
      } else {
        health.supabase = 'healthy';
      }
    } catch (err) {
      health.supabase = 'down';
    }

    // Check Stripe
    try {
      const startTime = Date.now();
      await stripe.balance.retrieve();
      const duration = Date.now() - startTime;

      if (duration > 2000) {
        health.stripe = 'degraded';
      } else {
        health.stripe = 'healthy';
      }
    } catch (err) {
      health.stripe = 'down';
    }

    // Check Resend
    try {
      const startTime = Date.now();
      await resend.domains.list();
      const duration = Date.now() - startTime;

      if (duration > 2000) {
        health.resend = 'degraded';
      } else {
        health.resend = 'healthy';
      }
    } catch (err) {
      health.resend = 'down';
    }

    return NextResponse.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
  }
}
