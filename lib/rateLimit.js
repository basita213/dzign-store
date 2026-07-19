var rateLimitStore = {};

function getRateLimitKey(ip, action) {
  return action + ':' + ip;
}

function isRateLimited(ip, action, limit, windowMs) {
  var key = getRateLimitKey(ip, action);
  var now = Date.now();
  var entry = rateLimitStore[key];

  if (!entry || now - entry.start > windowMs) {
    rateLimitStore[key] = { start: now, count: 1 };
    return false;
  }

  entry.count++;
  return entry.count > limit;
}

function getRateLimitHeaders(ip, action, limit, windowMs) {
  var key = getRateLimitKey(ip, action);
  var entry = rateLimitStore[key];
  var now = Date.now();

  if (!entry || now - entry.start > windowMs) {
    return {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(limit - 1),
      'X-RateLimit-Reset': String(Math.ceil((now + windowMs) / 1000)),
    };
  }

  var remaining = Math.max(0, limit - entry.count);
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil((entry.start + windowMs) / 1000)),
  };
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']
    ? req.headers['x-forwarded-for'].split(',')[0].trim()
    : req.headers['x-real-ip'] || '127.0.0.1';
}

module.exports = {
  isRateLimited: isRateLimited,
  getRateLimitHeaders: getRateLimitHeaders,
  getClientIp: getClientIp,
};
