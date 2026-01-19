/// <reference types="@cloudflare/workers-types" />

import Stripe from 'stripe';

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  DB: D1Database;
}

/**
 * Stripe Webhook Handler
 * Receives events from Stripe and syncs user data to D1
 * 
 * Security:
 * - Verifies webhook signature using raw body
 * - Uses UPSERT (ON CONFLICT) for idempotency
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Validate environment
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing Stripe environment variables');
    return new Response('Server configuration error', { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  // Get raw body for signature verification (CRITICAL: do not use request.json())
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const email = session.customer_details?.email || '';

        if (!customerId) {
          console.error('No customer ID in session');
          return new Response('Invalid session data', { status: 400 });
        }

        if (session.mode === 'subscription') {
          // Subscription purchase
          await env.DB.prepare(`
            INSERT INTO paid_users (id, email, type, status, subscription_id, created_at, updated_at)
            VALUES (?, ?, 'subscription', 'active', ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              email = excluded.email,
              type = excluded.type,
              status = 'active',
              subscription_id = excluded.subscription_id,
              updated_at = excluded.updated_at
          `).bind(customerId, email, session.subscription as string, now, now).run();
        } else if (session.mode === 'payment') {
          // One-time purchase (lifetime)
          await env.DB.prepare(`
            INSERT INTO paid_users (id, email, type, status, subscription_id, created_at, updated_at)
            VALUES (?, ?, 'onetime', 'lifetime', NULL, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              email = excluded.email,
              type = excluded.type,
              status = 'lifetime',
              updated_at = excluded.updated_at
          `).bind(customerId, email, now, now).run();
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status === 'active' ? 'active' : 
                       subscription.status === 'past_due' ? 'past_due' : 'canceled';

        await env.DB.prepare(`
          UPDATE paid_users SET status = ?, updated_at = ? WHERE id = ?
        `).bind(status, now, customerId).run();
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        await env.DB.prepare(`
          UPDATE paid_users SET status = 'canceled', updated_at = ? WHERE id = ?
        `).bind(now, customerId).run();
        break;
      }

      default:
        // Unhandled event type - that's OK
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (dbError) {
    console.error('Database error:', dbError);
    return new Response('Database error', { status: 500 });
  }
};
