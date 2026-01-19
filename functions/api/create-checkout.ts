import Stripe from 'stripe';

export const onRequestPost: PagesFunction<{ DB: D1Database }> = async (context) => {
  try {
    const { request, env } = context;
    const body = await request.json() as { type: 'subscription' | 'onetime' };
    
    if (!env.STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: 'Stripe API key is not configured' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY as string);
    const origin = new URL(request.url).origin;

    // Define Price IDs (These should ideally come from env vars or constants)
    // NOTE: User needs to replace these with actual Price IDs from Stripe Dashboard if not using lookup_key
    // For this implementation, we'll assume the user will set these in .dev.vars or we receive them, 
    // OR we use lookup_keys if set. 
    // Let's use Environment Variables for Price IDs for flexibility.
    const MONTHLY_PRICE_ID = env.STRIPE_MONTHLY_PRICE_ID as string;
    const ONETIME_PRICE_ID = env.STRIPE_ONETIME_PRICE_ID as string;

    if (!MONTHLY_PRICE_ID || !ONETIME_PRICE_ID) {
       // Fallback or Error if not provided? 
       // For now, let's log usage of placeholders if missing, but ideally they must exist.
    }

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
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      automatic_tax: { enabled: true }, // Optional
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
