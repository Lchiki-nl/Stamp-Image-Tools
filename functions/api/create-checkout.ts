/// <reference types="@cloudflare/workers-types" />

import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_ID_SUBSCRIPTION: string;
  STRIPE_PRICE_ID_ONETIME: string;
}

/**
 * Create Stripe Checkout Session
 * Redirects user to Stripe payment page
 * 
 * Query Parameters:
 * - type: 'subscription' or 'onetime'
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (!env.STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers,
    });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  try {
    const body = await request.json() as { type?: string };
    const purchaseType = body.type || 'subscription';

    // Determine price ID based on type
    const priceId = purchaseType === 'onetime' 
      ? env.STRIPE_PRICE_ID_ONETIME 
      : env.STRIPE_PRICE_ID_SUBSCRIPTION;

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Price not configured' }), {
        status: 500,
        headers,
      });
    }

    // Get origin for redirect URLs
    const url = new URL(request.url);
    const origin = url.origin;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: purchaseType === 'onetime' ? 'payment' : 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
      status: 500,
      headers,
    });
  }
};
