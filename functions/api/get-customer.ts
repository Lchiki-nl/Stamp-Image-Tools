import Stripe from 'stripe';

interface Env {
  DB: D1Database;
  STRIPE_SECRET_KEY: string;
}

interface PaidUser {
  id: string;
  type: string;
  status: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('session_id');

  if (!env.STRIPE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'Stripe configuration missing' }), { status: 500 });
  }

  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'Session ID is required' }), { status: 400 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session.customer) {
        return new Response(JSON.stringify({ error: 'No customer found for this session' }), { status: 404 });
    }
    
    const customerId = session.customer as string;
    
    // DBからプランタイプを取得
    const user = await env.DB.prepare(
      "SELECT type, status FROM paid_users WHERE id = ?"
    ).bind(customerId).first<PaidUser>();
    
    return new Response(JSON.stringify({ 
      customerId,
      planType: user?.type || (session.mode === 'payment' ? 'onetime' : 'subscription')
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 400 });
  }
};
