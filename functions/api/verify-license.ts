/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW_SECONDS = 60; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 20;   // Max requests per window per IP

/**
 * Verify License Key (Customer ID)
 * Checks if the provided key is valid and active
 * 
 * POST Body:
 * - key: License key (Stripe Customer ID)
 * 
 * Security:
 * - Rate limiting via D1 access_logs table
 * - Input format validation
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

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers,
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - RATE_LIMIT_WINDOW_SECONDS;

  // Get client IP for rate limiting
  const ip = request.headers.get('CF-Connecting-IP') || 
             request.headers.get('X-Forwarded-For')?.split(',')[0] || 
             'unknown';

  try {
    // 1. Rate Limiting Check (Plan A: D1 Count)
    const countResult = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM access_logs WHERE ip = ? AND created_at > ?'
    ).bind(ip, windowStart).first<{ count: number }>();

    const requestCount = countResult?.count || 0;

    if (requestCount >= RATE_LIMIT_MAX_REQUESTS) {
      return new Response(JSON.stringify({ 
        valid: false, 
        error: 'Too many requests. Please try again later.' 
      }), {
        status: 429,
        headers,
      });
    }

    // Log this request (non-blocking via waitUntil)
    context.waitUntil(
      env.DB.prepare('INSERT INTO access_logs (ip, created_at) VALUES (?, ?)')
        .bind(ip, now)
        .run()
    );

    // 2. Parse and validate license key
    const body = await request.json() as { key?: string };
    const licenseKey = body.key?.trim();

    if (!licenseKey) {
      return new Response(JSON.stringify({ valid: false, error: 'Missing license key' }), {
        status: 400,
        headers,
      });
    }

    // Format validation: Stripe Customer IDs start with 'cus_'
    if (!licenseKey.startsWith('cus_') || licenseKey.length < 10 || licenseKey.length > 50) {
      return new Response(JSON.stringify({ valid: false, error: 'Invalid key format' }), {
        status: 400,
        headers,
      });
    }

    // 3. Database lookup
    const user = await env.DB.prepare(
      'SELECT type, status FROM paid_users WHERE id = ?'
    ).bind(licenseKey).first<{ type: string; status: string }>();

    if (!user) {
      return new Response(JSON.stringify({ valid: false }), {
        status: 200,
        headers,
      });
    }

    // Valid statuses: 'active' (subscription) or 'lifetime' (one-time)
    const isValid = user.status === 'active' || user.status === 'lifetime';

    return new Response(JSON.stringify({ 
      valid: isValid, 
      type: isValid ? user.type : undefined 
    }), {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(JSON.stringify({ valid: false, error: 'Verification failed' }), {
      status: 500,
      headers,
    });
  }
};
