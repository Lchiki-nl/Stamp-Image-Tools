import Stripe from 'stripe';

interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'Stripe configuration missing' }), { status: 500 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const origin = new URL(request.url).origin;
  
  try {
    const body = await request.json() as { customerId: string };
    const customerId = body.customerId;

    if (!customerId) {
        return new Response(JSON.stringify({ error: 'Customer ID is required' }), { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/app`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
