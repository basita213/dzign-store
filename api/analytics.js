const { trackEvent } = require('../lib/db');
const { validateAnalytics } = require('../lib/validate');
const { isRateLimited, getRateLimitHeaders, getClientIp } = require('../lib/rateLimit');
const { json, error, validationError, rateLimitError, parseBody, getRequestId } = require('../lib/helpers');

module.exports = async function handler(req, res) {
  var requestId = getRequestId(req);
  var ip = getClientIp(req);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-ID');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Request-ID', requestId);

  if (req.method !== 'POST') {
    return error(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed.', requestId);
  }

  if (isRateLimited(ip, 'analytics', 60, 60000)) {
    var headers = getRateLimitHeaders(ip, 'analytics', 60, 60000);
    Object.keys(headers).forEach(function (k) { res.setHeader(k, headers[k]); });
    return rateLimitError(res, requestId);
  }

  var headers = getRateLimitHeaders(ip, 'analytics', 60, 60000);
  Object.keys(headers).forEach(function (k) { res.setHeader(k, headers[k]); });

  try {
    var body = await parseBody(req);
  } catch (e) {
    return error(res, 400, 'INVALID_BODY', 'Invalid request body.', requestId);
  }

  var errors = validateAnalytics(body);
  if (errors.length > 0) {
    return validationError(res, errors, requestId);
  }

  try {
    var userAgent = req.headers['user-agent'] || null;

    await trackEvent({
      eventType: body.event_type,
      pagePath: body.page_path,
      referrer: body.referrer,
      userAgent: userAgent,
      ipAddress: ip,
      metadata: body.metadata,
    });

    res.status(204).end();
  } catch (err) {
    console.error('[ANALYTICS] Error:', err.message);
    res.status(204).end();
  }
};
