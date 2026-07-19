const { body, query, validationResult } = require('express-validator');

// ── Validation Error Handler ────────────────────────────────────────
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      data: null,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: errors.array().map(e => ({
          field: e.path,
          message: e.msg,
        })),
      },
      meta: { request_id: req.id },
    });
  }
  next();
}

// ── Contact Form Validation Rules ───────────────────────────────────
const contactValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\u00C0-\u024F\u0600-\u06FF\s'-]+$/)
    .withMessage('Name contains invalid characters'),

  body('email')
    .trim()
    .isEmail({ minDomainSegments: 2, maxDnsLength: 253 })
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('subject')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subject must be under 200 characters'),

  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Message must be between 10 and 5000 characters'),

  handleValidation,
];

// ── Newsletter Validation Rules ─────────────────────────────────────
const newsletterValidation = [
  body('email')
    .trim()
    .isEmail({ minDomainSegments: 2, maxDnsLength: 253 })
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  handleValidation,
];

// ── Analytics Validation Rules ──────────────────────────────────────
const analyticsValidation = [
  body('event_type')
    .trim()
    .isIn(['pageview', 'click', 'scroll', 'cta_click', 'form_open', 'form_submit'])
    .withMessage('Invalid event type'),

  body('page_path')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Page path too long')
    .matches(/^\/[a-zA-Z0-9\-_\/]*$/)
    .withMessage('Invalid page path'),

  body('referrer')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Referrer too long'),

  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),

  handleValidation,
];

module.exports = {
  contactValidation,
  newsletterValidation,
  analyticsValidation,
  handleValidation,
};
