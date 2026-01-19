/// <reference types="@cloudflare/workers-types" />

import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
  DB: D1Database;
}

/**
 * Create Stripe Customer Portal Session
 * Allows users to manage their subscription/billing
 * 
 * POST Body:
 * - customerId: Stripe Customer ID (license key)
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

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
    const body = await request.json() as { customerId?: string };
    const customerId = body.customerId?.trim();

    if (!customerId) {
      return new Response(JSON.stringify({ error: 'Missing customer ID' }), {
        status: 400,
        headers,
      });
    }

    // Validate customer exists in our database
    if (env.DB) {
      const user = await env.DB.prepare(
        'SELECT id FROM paid_users WHERE id = ?'
      ).bind(customerId).first();

      if (!user) {
        return new Response(JSON.stringify({ error: 'Customer not found' }), {
          status: 404,
          headers,
        });
      }
    }

    // Get origin for return URL
    const url = new URL(request.url);
    const origin = url.origin;

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Portal error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create portal session' }), {
      status: 500,
      headers,
    });
  }
};
