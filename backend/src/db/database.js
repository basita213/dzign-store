const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let store = { contacts: [], newsletter: [], analytics: [] };

function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      store = JSON.parse(raw);
    }
  } catch (err) {
    console.error('[DB] Failed to load store:', err.message);
    store = { contacts: [], newsletter: [], analytics: [] };
  }
}

function save() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Failed to save store:', err.message);
  }
}

load();

function genId() { return uuidv4(); }
function nowIso() { return new Date().toISOString(); }

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

function createContact(opts) {
  var name = opts.name;
  var email = opts.email;
  var subject = opts.subject;
  var message = opts.message;
  var ipAddress = opts.ipAddress;
  var userAgent = opts.userAgent;
  var spamScore = calculateSpamScore(name, email, message);
  var contact = {
    id: genId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: (subject || '').trim(),
    message: message.trim(),
    ip_address: ipAddress || null,
    user_agent: userAgent || null,
    spam_score: spamScore,
    status: spamScore >= 5 ? 'spam' : 'new',
    created_at: nowIso()
  };
  store.contacts.push(contact);
  save();
  return { id: contact.id, status: contact.status };
}

function getContacts(opts) {
  var limit = (opts && opts.limit) || 50;
  var offset = (opts && opts.offset) || 0;
  return store.contacts
    .filter(function(c) { return c.status !== 'spam'; })
    .sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); })
    .slice(offset, offset + limit);
}

function getContactById(id) {
  return store.contacts.find(function(c) { return c.id === id; }) || null;
}

function updateContactStatus(id, status) {
  var contact = store.contacts.find(function(c) { return c.id === id; });
  if (contact) {
    contact.status = status;
    save();
    return true;
  }
  return false;
}

function countContacts() {
  return store.contacts.filter(function(c) { return c.status !== 'spam'; }).length;
}

function createSubscriber(opts) {
  var email = opts.email;
  var ipAddress = opts.ipAddress;
  var normalizedEmail = email.trim().toLowerCase();
  var existing = store.newsletter.find(function(s) { return s.email === normalizedEmail; });

  if (existing) {
    if (existing.status === 'unsubscribed') {
      existing.status = 'pending';
      existing.confirm_token = genId();
      existing.unsubscribe_token = genId();
      existing.unsubscribed_at = null;
      existing.ip_address = ipAddress || existing.ip_address;
      save();
      return { status: 're-subscribed', confirmToken: existing.confirm_token };
    }
    return { status: existing.status };
  }

  var subscriber = {
    id: genId(),
    email: normalizedEmail,
    status: 'pending',
    confirm_token: genId(),
    unsubscribe_token: genId(),
    ip_address: ipAddress || null,
    subscribed_at: nowIso(),
    confirmed_at: null,
    unsubscribed_at: null
  };
  store.newsletter.push(subscriber);
  save();
  return { status: 'pending', confirmToken: subscriber.confirm_token };
}

function confirmSubscriber(token) {
  var sub = store.newsletter.find(function(s) { return s.confirm_token === token; });
  if (sub) {
    sub.status = 'confirmed';
    sub.confirmed_at = nowIso();
    sub.confirm_token = null;
    save();
    return true;
  }
  return false;
}

function unsubscribe(token) {
  var sub = store.newsletter.find(function(s) { return s.unsubscribe_token === token; });
  if (sub) {
    sub.status = 'unsubscribed';
    sub.unsubscribed_at = nowIso();
    sub.unsubscribe_token = null;
    save();
    return true;
  }
  return false;
}

function countSubscribers() {
  return store.newsletter.filter(function(s) { return s.status === 'confirmed'; }).length;
}

var analyticsCounter = 0;

function trackEvent(opts) {
  store.analytics.push({
    id: ++analyticsCounter,
    event_type: opts.eventType,
    page_path: opts.pagePath || '/',
    referrer: opts.referrer || null,
    user_agent: opts.userAgent || null,
    ip_address: opts.ipAddress || null,
    metadata: opts.metadata || null,
    created_at: nowIso()
  });
}

function parsePeriod(str) {
  var match = str.match(/^(-?\d+)\s*(day|week|month)s?$/);
  if (!match) return -7 * 24 * 60 * 60 * 1000;
  var num = parseInt(match[1], 10);
  var unit = match[2];
  var multipliers = { day: 86400000, week: 604800000, month: 2592000000 };
  return num * (multipliers[unit] || 86400000);
}

function getAnalyticsSummary(period) {
  period = period || '-7 days';
  var cutoff = new Date(Date.now() + parsePeriod(period));
  var result = {};
  store.analytics.forEach(function(e) {
    if (new Date(e.created_at) >= cutoff) {
      result[e.event_type] = (result[e.event_type] || 0) + 1;
    }
  });
  return result;
}

function getAnalyticsByPage(period, limit) {
  period = period || '-7 days';
  limit = limit || 10;
  var cutoff = new Date(Date.now() + parsePeriod(period));
  var pageviews = {};
  store.analytics.forEach(function(e) {
    if (e.event_type === 'pageview' && new Date(e.created_at) >= cutoff) {
      pageviews[e.page_path] = (pageviews[e.page_path] || 0) + 1;
    }
  });
  return Object.keys(pageviews)
    .map(function(p) { return { page_path: p, views: pageviews[p] }; })
    .sort(function(a, b) { return b.views - a.views; })
    .slice(0, limit);
}

process.on('SIGINT', function() { save(); process.exit(0); });
process.on('SIGTERM', function() { save(); process.exit(0); });
setInterval(save, 30000);

module.exports = {
  createContact: createContact,
  getContacts: getContacts,
  getContactById: getContactById,
  updateContactStatus: updateContactStatus,
  countContacts: countContacts,
  createSubscriber: createSubscriber,
  confirmSubscriber: confirmSubscriber,
  unsubscribe: unsubscribe,
  countSubscribers: countSubscribers,
  trackEvent: trackEvent,
  getAnalyticsSummary: getAnalyticsSummary,
  getAnalyticsByPage: getAnalyticsByPage
};
