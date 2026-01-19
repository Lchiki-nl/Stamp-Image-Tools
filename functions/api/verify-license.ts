interface Env {
  DB: D1Database;
}

interface PaidUser {
  id: string;
  email: string;
  type: string;
  status: string;
  subscription_id: string | null;
  created_at: number;
  updated_at: number;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const db = env.DB;
  const now = Math.floor(Date.now() / 1000);
  const oneMinuteAgo = now - 60;

  try {
    const result = await db.prepare(
      "SELECT count(*) as c FROM access_logs WHERE ip = ? AND created_at > ?"
    ).bind(ip, oneMinuteAgo).first('c') as number;

    if (result > 20) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    await db.prepare("INSERT INTO access_logs (ip, created_at) VALUES (?, ?)").bind(ip, now).run();

    const body = await request.json() as { key: string };
    const licenseKey = body.key;

    if (!licenseKey) {
      return new Response(JSON.stringify({ error: 'License key is required' }), { status: 400 });
    }

    const user = await db.prepare("SELECT * FROM paid_users WHERE id = ?").bind(licenseKey).first<PaidUser>();

    if (!user) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid license key' }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (user.status === 'active' || user.status === 'lifetime') {
      return new Response(JSON.stringify({ valid: true, type: user.type }), { 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ valid: false, error: 'License is inactive or expired' }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
};
