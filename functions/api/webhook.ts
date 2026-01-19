import Stripe from 'stripe';

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  const sig = request.headers.get('stripe-signature');

  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return new Response('Missing Stripe configuration', { status: 500 });
  }

  if (!sig) {
    return new Response('No signature', { status: 400 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY as string);
  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    const db = env.DB;

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // ユーザー情報の取得 (顧客作成時に入力されたもの)
        const customerId = session.customer as string;
        const email = session.customer_details?.email;
        const subscriptionId = session.subscription as string | null;
        
        // modeによる判定 (subscription vs payment)
        let type = 'subscription';
        let status = 'active';

        if (session.mode === 'payment') {
          type = 'onetime';
          status = 'lifetime';
        }

        if (customerId && email) {
          const now = Math.floor(Date.now() / 1000);
          
          // UPSERT (存在すれば更新、なければ挿入)
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
        const status = subscription.status; // active, past_due, canceled, etc.
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

  } catch (err: any) {
    console.error('Database Error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
};
