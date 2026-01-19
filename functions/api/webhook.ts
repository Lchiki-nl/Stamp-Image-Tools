import Stripe from 'stripe';

interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const sig = request.headers.get('stripe-signature');

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Missing Stripe configuration', { status: 500 });
  }

  if (!sig) {
    return new Response('No signature', { status: 400 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
  }

  try {
    const db = env.DB;

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const customerId = session.customer as string;
        const email = session.customer_details?.email;
        const subscriptionId = session.subscription as string | null;
        
        let type = 'subscription';
        let status = 'active';

        if (session.mode === 'payment') {
          type = 'onetime';
          status = 'lifetime';
        }

        if (customerId && email) {
          const now = Math.floor(Date.now() / 1000);
          
          await db.prepare(`
            INSERT INTO paid_users (id, email, type, status, subscription_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              email = excluded.email,
              type = excluded.type,
              status = excluded.status,
              subscription_id = excluded.subscription_id,
              updated_at = excluded.updated_at
          `).bind(
            customerId,
            email,
            type,
            status,
            subscriptionId || null,
            now,
            now
          ).run();
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const status = subscription.status;
        const now = Math.floor(Date.now() / 1000);

        await db.prepare(`
          UPDATE paid_users 
          SET status = ?, updated_at = ? 
          WHERE id = ?
        `).bind(status, now, customerId).run();
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const now = Math.floor(Date.now() / 1000);

        await db.prepare(`
          UPDATE paid_users 
          SET status = 'canceled', updated_at = ? 
          WHERE id = ?
        `).bind(now, customerId).run();
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    console.error('Database Error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
};
