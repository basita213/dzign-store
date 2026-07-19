const { getRequestId } = require('../lib/helpers');

module.exports = async function handler(req, res) {
  var requestId = getRequestId(req);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Request-ID', requestId);

  res.status(200).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    data: { status: 'ok', timestamp: new Date().toISOString() },
    error: null,
    meta: { request_id: requestId },
  }));
};
