const { confirmSubscriber } = require('../../lib/db');
const { error, getRequestId } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  var requestId = getRequestId(req);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Request-ID', requestId);

  if (req.method !== 'GET') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(405).end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed.' } }));
  }

  var url = new URL(req.url, 'http://localhost');
  var token = url.searchParams.get('token');

  if (!token) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).end(JSON.stringify({ error: { code: 'INVALID_TOKEN', message: 'Invalid confirmation link.' } }));
  }

  try {
    var success = await confirmSubscriber(token);
    if (!success) {
      res.setHeader('Content-Type', 'application/json');
      return res.status(404).end(JSON.stringify({ error: { code: 'TOKEN_NOT_FOUND', message: 'Confirmation link is invalid or already used.' } }));
    }
    var siteUrl = process.env.SITE_URL || 'https://dzign-store-ten.vercel.app';
    res.setHeader('Location', siteUrl + '/?newsletter=confirmed');
    return res.status(302).end();
  } catch (err) {
    console.error('[NEWSLETTER] Confirm error:', err.message);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).end(JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' } }));
  }
};
