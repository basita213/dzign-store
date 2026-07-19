const { createContact } = require('../lib/db');
const { sendContactNotification } = require('../lib/email');
const { validateContact } = require('../lib/validate');
const { isRateLimited, getRateLimitHeaders, getClientIp } = require('../lib/rateLimit');
const { success, created, error, validationError, rateLimitError, parseBody, getRequestId } = require('../lib/helpers');

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

  if (req.method === 'GET') {
    return error(res, 403, 'AUTH_REQUIRED', 'Authentication required to access this endpoint.', requestId);
  }

  if (req.method !== 'POST') {
    return error(res, 405, 'METHOD_NOT_ALLOWED', 'Method not allowed.', requestId);
  }

  if (isRateLimited(ip, 'contact', 5, 3600000)) {
    var headers = getRateLimitHeaders(ip, 'contact', 5, 3600000);
    Object.keys(headers).forEach(function (k) { res.setHeader(k, headers[k]); });
    return rateLimitError(res, requestId);
  }

  var headers = getRateLimitHeaders(ip, 'contact', 5, 3600000);
  Object.keys(headers).forEach(function (k) { res.setHeader(k, headers[k]); });

  try {
    var body = await parseBody(req);
  } catch (e) {
    return error(res, 400, 'INVALID_BODY', 'Invalid request body.', requestId);
  }

  var errors = validateContact(body);
  if (errors.length > 0) {
    return validationError(res, errors, requestId);
  }

  try {
    var ipAddress = ip;
    var userAgent = req.headers['user-agent'] || null;

    var result = await createContact({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
      ipAddress: ipAddress,
      userAgent: userAgent,
    });

    sendContactNotification({
      name: body.name,
      email: body.email,
      subject: body.subject,
      message: body.message,
    }).catch(function (err) {
      console.error('[CONTACT] Email notification failed:', err.message);
    });

    return created(res, { id: result.id, status: 'received' }, requestId);
  } catch (err) {
    console.error('[CONTACT] Error:', err.message);
    return error(res, 500, 'INTERNAL_ERROR', 'Something went wrong. Please try again.', requestId);
  }
};
