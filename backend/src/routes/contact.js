const express = require('express');
const router = express.Router();
const { createContact } = require('../db/database');
const { sendContactNotification } = require('../utils/email');
const { contactLimiter } = require('../middleware/rateLimit');
const { contactValidation } = require('../middleware/validate');

// ── POST /api/v1/contact ────────────────────────────────────────────
router.post('/', contactLimiter, contactValidation, async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
    const userAgent = req.headers['user-agent'] || null;

    const result = createContact({ name, email, subject, message, ipAddress, userAgent });

    sendContactNotification({ name, email, subject, message }).catch(err => {
      console.error('[CONTACT] Email notification failed:', err.message);
    });

    res.status(201).json({
      data: { id: result.id, status: 'received' },
      error: null,
      meta: { request_id: req.id },
    });
  } catch (err) {
    console.error('[CONTACT] Error:', err.message);
    res.status(500).json({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
      meta: { request_id: req.id },
    });
  }
});

// ── GET /api/v1/contact ─────────────────────────────────────────────
router.get('/', (req, res) => {
  res.status(403).json({
    data: null,
    error: { code: 'AUTH_REQUIRED', message: 'Authentication required to access this endpoint.' },
    meta: { request_id: req.id },
  });
});

module.exports = router;
