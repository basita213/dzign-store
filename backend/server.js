require('dotenv').config();

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { helmetMiddleware, corsMiddleware } = require('./src/middleware/security');
const { apiLimiter } = require('./src/middleware/rateLimit');

// ── Route Imports ───────────────────────────────────────────────────
const contactRoutes = require('./src/routes/contact');
const newsletterRoutes = require('./src/routes/newsletter');
const analyticsRoutes = require('./src/routes/analytics');

// ── App Setup ───────────────────────────────────────────────────────
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ── Trust Proxy (for rate limiting behind reverse proxy) ─────────────
app.set('trust proxy', 1);

// ── Request ID Middleware ────────────────────────────────────────────
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// ── Security Middleware ─────────────────────────────────────────────
app.use(helmetMiddleware);
app.use(corsMiddleware);

// ── Body Parsing ────────────────────────────────────────────────────
app.use(express.json({ limit: '100kb' })); // Strict body size limit
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

// ── Rate Limiting ───────────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── Static Files (serve frontend from parent directory) ──────────────
const PUBLIC_DIR = path.join(__dirname, '..');
app.use(express.static(PUBLIC_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  },
}));

// ── API Routes ──────────────────────────────────────────────────────
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/newsletter', newsletterRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// ── Health Check ────────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({
    data: { status: 'ok', timestamp: new Date().toISOString() },
    error: null,
    meta: { request_id: req.id },
  });
});

// ── SPA Fallback — serve index.html for non-API, non-file routes ───
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      data: null,
      error: { code: 'NOT_FOUND', message: 'API endpoint not found.' },
      meta: { request_id: req.id },
    });
  }
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// ── Global Error Handler ────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[SERVER] Unhandled error:', err);

  // Don't leak error details to client
  res.status(500).json({
    data: null,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    meta: { request_id: req.id },
  });
});

// ── Start Server ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[DZIGN] Server running on http://localhost:${PORT}`);
  console.log(`[DZIGN] API base: http://localhost:${PORT}/api/v1`);
  console.log(`[DZIGN] Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
