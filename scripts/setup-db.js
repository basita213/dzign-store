const { sql } = require('@vercel/postgres');

async function setup() {
  console.log('[DB] Setting up tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT DEFAULT '',
      message TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      spam_score INTEGER DEFAULT 0,
      status TEXT DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('[DB] ✓ contacts table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS newsletter (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'pending',
      confirm_token TEXT,
      unsubscribe_token TEXT,
      ip_address TEXT,
      subscribed_at TIMESTAMPTZ DEFAULT NOW(),
      confirmed_at TIMESTAMPTZ,
      unsubscribed_at TIMESTAMPTZ
    )
  `;
  console.log('[DB] ✓ newsletter table ready');

  await sql`
    CREATE TABLE IF NOT EXISTS analytics (
      id SERIAL PRIMARY KEY,
      event_type TEXT NOT NULL,
      page_path TEXT DEFAULT '/',
      referrer TEXT,
      user_agent TEXT,
      ip_address TEXT,
      metadata JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  console.log('[DB] ✓ analytics table ready');

  console.log('[DB] Setup complete!');
  process.exit(0);
}

setup().catch(function (err) {
  console.error('[DB] Setup failed:', err);
  process.exit(1);
});
