const express = require('express');
const router = express.Router();
const { createSubscriber, confirmSubscriber, unsubscribe, countSubscribers } = require('../db/database');
const { sendNewsletterConfirmation } = require('../utils/email');
const { newsletterLimiter } = require('../middleware/rateLimit');
const { newsletterValidation } = require('../middleware/validate');

// ── POST /api/v1/newsletter/subscribe ───────────────────────────────
router.post('/subscribe', newsletterLimiter, newsletterValidation, async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;

    const result = createSubscriber({ email, ipAddress });

    if (result.status === 'confirmed') {
      return res.status(200).json({
        data: { status: 'already_subscribed' },
        error: null,
        meta: { request_id: req.id },
      });
    }

    if (result.status === 'pending' && result.confirmToken) {
      sendNewsletterConfirmation({
        email: email.trim().toLowerCase(),
        confirmToken: result.confirmToken,
      }).catch(err => {
        console.error('[NEWSLETTER] Confirmation email failed:', err.message);
      });
    }

    res.status(201).json({
      data: { status: 'pending' },
      error: null,
      meta: { request_id: req.id },
    });
  } catch (err) {
    console.error('[NEWSLETTER] Error:', err.message);
    res.status(500).json({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' },
      meta: { request_id: req.id },
    });
  }
});

// ── GET /api/v1/newsletter/confirm?token=xxx ────────────────────────
router.get('/confirm', (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        data: null,
        error: { code: 'INVALID_TOKEN', message: 'Invalid confirmation link.' },
        meta: { request_id: req.id },
      });
    }

    const success = confirmSubscriber(token);
    if (!success) {
      return res.status(404).json({
        data: null,
        error: { code: 'TOKEN_NOT_FOUND', message: 'Confirmation link is invalid or already used.' },
        meta: { request_id: req.id },
      });
    }

    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    res.redirect(`${siteUrl}/?newsletter=confirmed`);
  } catch (err) {
    console.error('[NEWSLETTER] Confirm error:', err.message);
    res.status(500).json({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
      meta: { request_id: req.id },
    });
  }
});

// ── GET /api/v1/newsletter/unsubscribe?token=xxx ────────────────────
router.get('/unsubscribe', (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        data: null,
        error: { code: 'INVALID_TOKEN', message: 'Invalid unsubscribe link.' },
        meta: { request_id: req.id },
      });
    }

    const success = unsubscribe(token);
    if (!success) {
      return res.status(404).json({
        data: null,
        error: { code: 'TOKEN_NOT_FOUND', message: 'Unsubscribe link is invalid or already used.' },
        meta: { request_id: req.id },
      });
    }

    const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    res.redirect(`${siteUrl}/?newsletter=unsubscribed`);
  } catch (err) {
    console.error('[NEWSLETTER] Unsubscribe error:', err.message);
    res.status(500).json({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
      meta: { request_id: req.id },
    });
  }
});

// ── GET /api/v1/newsletter/stats ────────────────────────────────────
router.get('/stats', (req, res) => {
  try {
    const total = countSubscribers();
    res.json({
      data: { subscribers: total },
      error: null,
      meta: { request_id: req.id },
    });
  } catch (err) {
    res.status(500).json({
      data: null,
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
      meta: { request_id: req.id },
    });
  }
});

module.exports = router;
