function json(res, statusCode, data) {
  res.status(statusCode).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function success(res, data, requestId) {
  json(res, 200, {
    data: data,
    error: null,
    meta: { request_id: requestId },
  });
}

function created(res, data, requestId) {
  json(res, 201, {
    data: data,
    error: null,
    meta: { request_id: requestId },
  });
}

function error(res, statusCode, code, message, requestId, details) {
  var body = {
    data: null,
    error: {
      code: code,
      message: message,
    },
    meta: { request_id: requestId },
  };
  if (details) body.error.details = details;
  json(res, statusCode, body);
}

function validationError(res, errors, requestId) {
  error(res, 400, 'VALIDATION_ERROR', 'Invalid input', requestId, errors);
}

function rateLimitError(res, requestId) {
  error(res, 429, 'RATE_LIMITED', 'Too many requests. Please try again later.', requestId);
}

function parseBody(req) {
  return new Promise(function (resolve, reject) {
    var body = '';
    req.on('data', function (chunk) {
      body += chunk;
      if (body.length > 102400) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', function () {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function getRequestId(req) {
  return req.headers['x-request-id'] || require('uuid').v4();
}

module.exports = {
  json: json,
  success: success,
  created: created,
  error: error,
  validationError: validationError,
  rateLimitError: rateLimitError,
  parseBody: parseBody,
  getRequestId: getRequestId,
};
