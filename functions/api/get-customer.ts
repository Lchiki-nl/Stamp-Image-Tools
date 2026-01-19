/// <reference types="@cloudflare/workers-types" />

import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
}

/**
 * Get Customer ID from Session ID
 * Used after checkout completion to retrieve license key
 * 
 * Query Parameters:
 * - session_id: Stripe Checkout Session ID
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (!env.STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers,
    });
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Missing session_id parameter' }), {
      status: 400,
      headers,
    });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.customer) {
      return new Response(JSON.stringify({ error: 'No customer found for session' }), {
        status: 404,
        headers,
      });
    }

    return new Response(JSON.stringify({ 
      customerId: session.customer as string,
      email: session.customer_details?.email || null,
    }), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Session retrieval error:', error);
    return new Response(JSON.stringify({ error: 'Failed to retrieve session' }), {
      status: 500,
      headers,
    });
  }
};
