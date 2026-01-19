export const onRequestPost: PagesFunction<{ DB: D1Database }> = async (context) => {
  const { request, env } = context;
  
  // Rate Limiting
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const db = env.DB;
  const now = Math.floor(Date.now() / 1000);
  const oneMinuteAgo = now - 60;

  try {
    // Check request count from this IP in the last minute
    const result = await db.prepare(
      "SELECT count(*) as c FROM access_logs WHERE ip = ? AND created_at > ?"
    ).bind(ip, oneMinuteAgo).first('c') as number;

    if (result > 20) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please try again later.' }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Log this request (async - don't await strictly if not needed, but here we await for simplicity/consistency)
    await db.prepare("INSERT INTO access_logs (ip, created_at) VALUES (?, ?)").bind(ip, now).run();

    const body = await request.json() as { key: string };
    const licenseKey = body.key;

    if (!licenseKey) {
      return new Response(JSON.stringify({ error: 'License key is required' }), { status: 400 });
    }

    // Verify key in D1
    const user = await db.prepare("SELECT * FROM paid_users WHERE id = ?").bind(licenseKey).first();

    if (!user) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid license key' }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userData = user as any;
    // Check status
    if (userData.status === 'active' || userData.status === 'lifetime') {
      return new Response(JSON.stringify({ valid: true, type: userData.type }), { 
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ valid: false, error: 'License is inactive or expired' }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
