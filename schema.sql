-- VIPユーザー管理テーブル
CREATE TABLE IF NOT EXISTS paid_users (
  id TEXT PRIMARY KEY,           -- Stripe Customer ID (cus_xxx) = ライセンスキー
  email TEXT NOT NULL,           -- 検索・照合用
  type TEXT NOT NULL,            -- 'subscription' or 'onetime'
  status TEXT NOT NULL,          -- 'active', 'lifetime', 'canceled' 等
  subscription_id TEXT,          -- Subscription ID (サブスクの場合のみ)
  created_at INTEGER,            -- Unix Timestamp
  updated_at INTEGER             -- Unix Timestamp
);

-- emailでの検索を高速化
CREATE INDEX IF NOT EXISTS idx_email ON paid_users(email);

-- レート制限用アクセスログテーブル
CREATE TABLE IF NOT EXISTS access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- IPと時間での検索を高速化 (レート制限チェック用)
CREATE INDEX IF NOT EXISTS idx_access_logs_ip_created ON access_logs(ip, created_at);
