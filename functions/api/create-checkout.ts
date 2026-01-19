import Stripe from 'stripe';

interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_ID_SUBSCRIPTION: string;
  STRIPE_PRICE_ID_ONETIME: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as { type: 'subscription' | 'onetime' };
    
    if (!env.STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: 'Stripe API key is not configured' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const origin = new URL(request.url).origin;

    const MONTHLY_PRICE_ID = env.STRIPE_PRICE_ID_SUBSCRIPTION;
    const ONETIME_PRICE_ID = env.STRIPE_PRICE_ID_ONETIME;

    const priceId = body.type === 'subscription' ? MONTHLY_PRICE_ID : ONETIME_PRICE_ID;

    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Invalid plan type or missing price configuration' }), { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: body.type === 'subscription' ? 'subscription' : 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/app?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app`,
      automatic_tax: { enabled: true },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
