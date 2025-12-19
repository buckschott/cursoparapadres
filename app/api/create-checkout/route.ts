import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { priceId } = await request.json();

    // Determine course type from price ID
    let courseType = 'coparenting';
    if (priceId === process.env.NEXT_PUBLIC_PRICE_PARENTING) {
      courseType = 'parenting';
    } else if (priceId === process.env.NEXT_PUBLIC_PRICE_BUNDLE) {
      courseType = 'bundle';
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/#precios`,
      metadata: {
        course_type: courseType,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}
