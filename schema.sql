-- Stripe Paid Users Table
CREATE TABLE IF NOT EXISTS paid_users (
  id TEXT PRIMARY KEY,           -- Stripe Customer ID (cus_xxx) = License Key
  email TEXT NOT NULL,           -- For search/recovery
  type TEXT NOT NULL,            -- 'subscription' or 'onetime'
  status TEXT NOT NULL,          -- 'active', 'lifetime', 'canceled', 'past_due'
  subscription_id TEXT,          -- Stripe Subscription ID (NULL for onetime)
  created_at INTEGER,            -- Unix Timestamp
  updated_at INTEGER             -- Unix Timestamp
);

-- Index for email search (Recovery)
CREATE INDEX IF NOT EXISTS idx_email ON paid_users(email);

-- Access Logs for Rate Limiting (Plan A: D1 Count)
CREATE TABLE IF NOT EXISTS access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_access_ip_time ON access_logs(ip, created_at);
