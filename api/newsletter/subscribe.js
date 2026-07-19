const { createSubscriber } = require('../../lib/db');
const { sendNewsletterConfirmation } = require('../../lib/email');
const { validateNewsletter } = require('../../lib/validate');
const { isRateLimited, getRateLimitHeaders, getClientIp } = require('../../lib/rateLimit');
const { created, error, validationError, rateLimitError, parseBody, getRequestId } = require('../../lib/helpers');

module.exports = async function handler(req, res) {
  var requestId = getRequestId(req);
  var ip = getClientIp(req);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Request-ID', requestId);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-ID');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return error(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed.', requestId);
  }

  if (isRateLimited(ip, 'newsletter', 3, 3600000)) {
    var h = getRateLimitHeaders(ip, 'newsletter', 3, 3600000);
    Object.keys(h).forEach(function (k) { res.setHeader(k, h[k]); });
    return rateLimitError(res, requestId);
  }

  var h = getRateLimitHeaders(ip, 'newsletter', 3, 3600000);
  Object.keys(h).forEach(function (k) { res.setHeader(k, h[k]); });

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
    var result = await createSubscriber({ email: body.email, ipAddress: ip });

    if (result.status === 'confirmed') {
      return error(res, 200, 'ALREADY_SUBSCRIBED', 'Already subscribed.', requestId);
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
};
