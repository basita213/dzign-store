const { createSubscriber, confirmSubscriber, unsubscribe, countSubscribers } = require('../lib/db');
const { sendNewsletterConfirmation } = require('../lib/email');
const { validateNewsletter } = require('../lib/validate');
const { isRateLimited, getRateLimitHeaders, getClientIp } = require('../lib/rateLimit');
const { success, created, error, validationError, rateLimitError, parseBody, getRequestId } = require('../lib/helpers');

module.exports = async function handler(req, res) {
  var requestId = getRequestId(req);
  var ip = getClientIp(req);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-ID');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Request-ID', requestId);

  var url = new URL(req.url, 'http://localhost');
  var pathname = url.pathname;

  // GET /api/newsletter/confirm?token=xxx
  if (req.method === 'GET' && pathname.endsWith('/confirm')) {
    var token = url.searchParams.get('token');
    if (!token) {
      return error(res, 400, 'INVALID_TOKEN', 'Invalid confirmation link.', requestId);
    }

    try {
      var success = await confirmSubscriber(token);
      if (!success) {
        return error(res, 404, 'TOKEN_NOT_FOUND', 'Confirmation link is invalid or already used.', requestId);
      }
      var siteUrl = process.env.SITE_URL || 'http://localhost:3000';
      res.setHeader('Location', siteUrl + '/?newsletter=confirmed');
      return res.status(302).end();
    } catch (err) {
      console.error('[NEWSLETTER] Confirm error:', err.message);
      return error(res, 500, 'INTERNAL_ERROR', 'Something went wrong.', requestId);
    }
  }

  // GET /api/newsletter/unsubscribe?token=xxx
  if (req.method === 'GET' && pathname.endsWith('/unsubscribe')) {
    var token = url.searchParams.get('token');
    if (!token) {
      return error(res, 400, 'INVALID_TOKEN', 'Invalid unsubscribe link.', requestId);
    }

    try {
      var unsubResult = await unsubscribe(token);
      if (!unsubResult) {
        return error(res, 404, 'TOKEN_NOT_FOUND', 'Unsubscribe link is invalid or already used.', requestId);
      }
      var siteUrl = process.env.SITE_URL || 'http://localhost:3000';
      res.setHeader('Location', siteUrl + '/?newsletter=unsubscribed');
      return res.status(302).end();
    } catch (err) {
      console.error('[NEWSLETTER] Unsubscribe error:', err.message);
      return error(res, 500, 'INTERNAL_ERROR', 'Something went wrong.', requestId);
    }
  }

  // GET /api/newsletter/stats
  if (req.method === 'GET' && pathname.endsWith('/stats')) {
    try {
      var total = await countSubscribers();
      return success(res, { subscribers: total }, requestId);
    } catch (err) {
      return error(res, 500, 'INTERNAL_ERROR', 'Something went wrong.', requestId);
    }
  }

  // POST /api/newsletter/subscribe
  if (req.method === 'POST' && pathname.endsWith('/subscribe')) {
    if (isRateLimited(ip, 'newsletter', 3, 3600000)) {
      var headers = getRateLimitHeaders(ip, 'newsletter', 3, 3600000);
      Object.keys(headers).forEach(function (k) { res.setHeader(k, headers[k]); });
      return rateLimitError(res, requestId);
    }

    var headers = getRateLimitHeaders(ip, 'newsletter', 3, 3600000);
    Object.keys(headers).forEach(function (k) { res.setHeader(k, headers[k]); });

    try {
      var body = await parseBody(req);
    } catch (e) {
      return error(res, 400, 'INVALID_BODY', 'Invalid request body.', requestId);
    }

    var errors = validateNewsletter(body);
    if (errors.length > 0) {
      return validationError(res, errors, requestId);
    }

    try {
      var ipAddress = ip;
      var result = await createSubscriber({ email: body.email, ipAddress: ipAddress });

      if (result.status === 'confirmed') {
        return success(res, { status: 'already_subscribed' }, requestId);
      }

      if (result.status === 'pending' && result.confirmToken) {
        sendNewsletterConfirmation({
          email: body.email.trim().toLowerCase(),
          confirmToken: result.confirmToken,
        }).catch(function (err) {
          console.error('[NEWSLETTER] Confirmation email failed:', err.message);
        });
      }

      return created(res, { status: 'pending' }, requestId);
    } catch (err) {
      console.error('[NEWSLETTER] Error:', err.message);
      return error(res, 500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.', requestId);
    }
  }

  return error(res, 404, 'NOT_FOUND', 'Endpoint not found.', requestId);
};
