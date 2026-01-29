import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { isAdmin } from '@/lib/admin';

// Types
type ServiceStatus = 'healthy' | 'degraded' | 'down';

interface HealthCheckResult {
  supabase: ServiceStatus;
  stripe: ServiceStatus;
  resend: ServiceStatus;
  lastCheck: string;
}

// Constants
const DEGRADED_THRESHOLD_MS = 2000;

/**
 * GET /api/admin/support/system-health
 * 
 * Checks health status of all external services.
 * Admin-only endpoint.
 */
export async function GET(request: NextRequest) {
  const supabase = createServerClient();

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // 1. Authorization
    // ─────────────────────────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let adminEmail: string | null = null;

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      adminEmail = user?.email || null;
    }

    if (!isAdmin(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Initialize health check result
    // ─────────────────────────────────────────────────────────────────────────
    const health: HealthCheckResult = {
      supabase: 'down',
      stripe: 'down',
      resend: 'down',
      lastCheck: new Date().toISOString(),
    };

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Check Supabase
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const startTime = Date.now();
      const { error } = await supabase.from('profiles').select('id').limit(1);
      const duration = Date.now() - startTime;

      if (error) {
        health.supabase = 'down';
      } else if (duration > DEGRADED_THRESHOLD_MS) {
        health.supabase = 'degraded';
      } else {
        health.supabase = 'healthy';
      }
    } catch {
      health.supabase = 'down';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Check Stripe
    // ─────────────────────────────────────────────────────────────────────────
    if (!process.env.STRIPE_SECRET_KEY) {
      health.stripe = 'down';
    } else {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const startTime = Date.now();
        await stripe.balance.retrieve();
        const duration = Date.now() - startTime;

        if (duration > DEGRADED_THRESHOLD_MS) {
          health.stripe = 'degraded';
        } else {
          health.stripe = 'healthy';
        }
      } catch {
        health.stripe = 'down';
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Check Resend
    // ─────────────────────────────────────────────────────────────────────────
    if (!process.env.RESEND_API_KEY) {
      health.resend = 'down';
    } else {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const startTime = Date.now();
        await resend.domains.list();
        const duration = Date.now() - startTime;

        if (duration > DEGRADED_THRESHOLD_MS) {
          health.resend = 'degraded';
        } else {
          health.resend = 'healthy';
        }
      } catch {
        health.resend = 'down';
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Return health status
    // ─────────────────────────────────────────────────────────────────────────
    return NextResponse.json(health);

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
  }
}
