import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// ============================================
// CONFIGURATION
// ============================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * Valid price IDs mapped to course types.
 * Only these prices can be purchased through our checkout.
 */
const PRICE_CONFIG = {
  [process.env.NEXT_PUBLIC_PRICE_COPARENTING!]: 'coparenting',
  [process.env.NEXT_PUBLIC_PRICE_PARENTING!]: 'parenting',
  [process.env.NEXT_PUBLIC_PRICE_BUNDLE!]: 'bundle',
} as const;

// Filter out undefined keys (prices not yet configured)
const VALID_PRICE_IDS = Object.keys(PRICE_CONFIG).filter(Boolean);

// ============================================
// ROUTE HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json().catch(() => null);
    
    if (!body || typeof body.priceId !== 'string') {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    const { priceId } = body;

    // Validate price ID against known values
    if (!VALID_PRICE_IDS.includes(priceId)) {
      console.warn(`Invalid price ID attempted: ${priceId.slice(0, 20)}...`);
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Get course type from validated price
    const courseType = PRICE_CONFIG[priceId as keyof typeof PRICE_CONFIG] || 'unknown';

    // Get origin for redirect URLs
    const origin = request.headers.get('origin');
    if (!origin) {
      return NextResponse.json(
        { error: 'Origin header required' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      locale: 'es', // Spanish checkout experience
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#precios`,
      metadata: {
        course_type: courseType,
      },
      // Collect billing address for records
      billing_address_collection: 'required',
      // Disable promotion codes - discounts handled via email request
      allow_promotion_codes: false,
    });

    if (!session.url) {
      throw new Error('Stripe session created without URL');
    }

    return NextResponse.json({ url: session.url });

  } catch (error) {
    // Log full error for debugging
    console.error('Stripe checkout error:', error);

    // Check for specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      // Don't expose Stripe error details to client
      return NextResponse.json(
        { error: 'Payment service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}

// ============================================
// HEALTH CHECK (optional - for monitoring)
// ============================================

export async function GET() {
  // Simple health check - doesn't expose any sensitive info
  return NextResponse.json({ 
    status: 'ok',
    configured: VALID_PRICE_IDS.length > 0,
  });
}