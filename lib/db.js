const { sql } = require('@vercel/postgres');
const { v4: uuidv4 } = require('uuid');

async function ensureTables() {
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
}

let tablesReady = false;

async function getDb() {
  if (!tablesReady) {
    await ensureTables();
    tablesReady = true;
  }
  return sql;
}

function calculateSpamScore(name, email, message) {
  var score = 0;
  var text = (name + ' ' + email + ' ' + message).toLowerCase();
  if (text.indexOf('http://') !== -1 || text.indexOf('https://') !== -1) score += 2;
  if (text.indexOf('buy now') !== -1 || text.indexOf('click here') !== -1) score += 3;
  if (text.indexOf('free money') !== -1 || text.indexOf('casino') !== -1) score += 5;
  if (/[A-Z]{10,}/.test(message)) score += 1;
  var excl = (message.match(/!/g) || []).length;
  if (excl > 3) score += 1;
  if (email.indexOf('tempmail') !== -1 || email.indexOf('throwaway') !== -1) score += 3;
  return score;
}

async function createContact({ name, email, subject, message, ipAddress, userAgent }) {
  var spamScore = calculateSpamScore(name, email, message);
  var id = uuidv4();
  var status = spamScore >= 5 ? 'spam' : 'new';
  var sql = await getDb();
  await sql`
    INSERT INTO contacts (id, name, email, subject, message, ip_address, user_agent, spam_score, status)
    VALUES (${id}, ${name.trim()}, ${email.trim().toLowerCase()}, ${(subject || '').trim()}, ${message.trim()}, ${ipAddress || null}, ${userAgent || null}, ${spamScore}, ${status})
  `;
  return { id, status };
}

async function createSubscriber({ email, ipAddress }) {
  var sql = await getDb();
  var normalizedEmail = email.trim().toLowerCase();

  var existing = await sql`SELECT * FROM newsletter WHERE email = ${normalizedEmail}`;
  if (existing.rows.length > 0) {
    var sub = existing.rows[0];
    if (sub.status === 'unsubscribed') {
      var confirmToken = uuidv4();
      var unsubToken = uuidv4();
      await sql`
        UPDATE newsletter SET status = 'pending', confirm_token = ${confirmToken},
        unsubscribe_token = ${unsubToken}, unsubscribed_at = NULL
        WHERE email = ${normalizedEmail}
      `;
      return { status: 're-subscribed', confirmToken };
    }
    return { status: sub.status };
  }

  var id = uuidv4();
  var confirmToken = uuidv4();
  var unsubToken = uuidv4();
  await sql`
    INSERT INTO newsletter (id, email, status, confirm_token, unsubscribe_token, ip_address)
    VALUES (${id}, ${normalizedEmail}, 'pending', ${confirmToken}, ${unsubToken}, ${ipAddress || null})
  `;
  return { status: 'pending', confirmToken };
}

async function confirmSubscriber(token) {
  var sql = await getDb();
  var result = await sql`SELECT * FROM newsletter WHERE confirm_token = ${token}`;
  if (result.rows.length === 0) return false;
  await sql`
    UPDATE newsletter SET status = 'confirmed', confirmed_at = NOW(), confirm_token = NULL
    WHERE confirm_token = ${token}
  `;
  return true;
}

async function unsubscribe(token) {
  var sql = await getDb();
  var result = await sql`SELECT * FROM newsletter WHERE unsubscribe_token = ${token}`;
  if (result.rows.length === 0) return false;
  await sql`
    UPDATE newsletter SET status = 'unsubscribed', unsubscribed_at = NOW(), unsubscribe_token = NULL
    WHERE unsubscribe_token = ${token}
  `;
  return true;
}

async function countSubscribers() {
  var sql = await getDb();
  var result = await sql`SELECT COUNT(*)::int as count FROM newsletter WHERE status = 'confirmed'`;
  return result.rows[0].count;
}

async function trackEvent({ eventType, pagePath, referrer, userAgent, ipAddress, metadata }) {
  var sql = await getDb();
  await sql`
    INSERT INTO analytics (event_type, page_path, referrer, user_agent, ip_address, metadata)
    VALUES (${eventType}, ${pagePath || '/'}, ${referrer || null}, ${userAgent || null}, ${ipAddress || null}, ${metadata ? JSON.stringify(metadata) : null})
  `;
}

module.exports = {
  createContact,
  createSubscriber,
  confirmSubscriber,
  unsubscribe,
  countSubscribers,
  trackEvent,
};
