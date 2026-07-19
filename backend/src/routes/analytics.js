const express = require('express');
const router = express.Router();
const { trackEvent, getAnalyticsSummary, getAnalyticsByPage } = require('../db/database');
const { analyticsLimiter } = require('../middleware/rateLimit');
const { analyticsValidation } = require('../middleware/validate');

// ── POST /api/v1/analytics ──────────────────────────────────────────
router.post('/', analyticsLimiter, analyticsValidation, (req, res) => {
  try {
    const { event_type, page_path, referrer, metadata } = req.body;
    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;

    trackEvent({
      eventType: event_type,
      pagePath: page_path,
      referrer,
      userAgent,
      ipAddress,
      metadata,
    });

    res.status(204).end();
  } catch (err) {
    console.error('[ANALYTICS] Error:', err.message);
    res.status(204).end();
  }
});

// ── POST /api/v1/analytics/batch ────────────────────────────────────
router.post('/batch', analyticsLimiter, (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || events.length > 50) {
      return res.status(400).json({
        data: null,
        error: { code: 'VALIDATION_ERROR', message: 'Batch must be an array of up to 50 events.' },
        meta: { request_id: req.id },
      });
    }

    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;

    for (const event of events) {
      if (!event.event_type) continue;
      trackEvent({
        eventType: event.event_type,
        pagePath: event.page_path,
        referrer: event.referrer,
        userAgent,
        ipAddress,
        metadata: event.metadata,
      });
    }

    res.status(204).end();
  } catch (err) {
    console.error('[ANALYTICS] Batch error:', err.message);
    res.status(204).end();
  }
});

// ── GET /api/v1/analytics/summary ───────────────────────────────────
router.get('/summary', (req, res) => {
  res.status(403).json({
    data: null,
    error: { code: 'AUTH_REQUIRED', message: 'Authentication required.' },
    meta: { request_id: req.id },
  });
});

module.exports = router;
