const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  var host = process.env.SMTP_HOST;
  var port = parseInt(process.env.SMTP_PORT || '587', 10);
  var user = process.env.SMTP_USER;
  var pass = process.env.SMTP_PASS;

  if (!host) {
    console.warn('[EMAIL] SMTP_HOST not configured — emails will be logged instead of sent');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: port === 465,
    auth: user ? { user: user, pass: pass } : undefined,
  });

  return transporter;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendEmail({ to, from, subject, html }) {
  var transport = getTransporter();

  if (!transport) {
    console.log('[EMAIL] Would send:', { to: to, from: from, subject: subject });
    return { sent: false, reason: 'no_transport' };
  }

  try {
    await transport.sendMail({ to: to, from: from, subject: subject, html: html });
    return { sent: true };
  } catch (err) {
    console.error('[EMAIL] Send failed:', err.message);
    return { sent: false, reason: err.message };
  }
}

async function sendContactNotification({ name, email, subject, message }) {
  var to = process.env.NOTIFICATION_EMAIL || 'hello@dzignstore.com';
  var from = process.env.SMTP_FROM || 'DZIGN STORE <noreply@dzignstore.com>';
  var subj = subject ? '[DZIGN] New Contact: ' + subject : '[DZIGN] New Contact from ' + name;

  var html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">'
    + '<h2 style="color:#e8c820;border-bottom:2px solid #e8c820;padding-bottom:10px">New Contact Form Submission</h2>'
    + '<table style="width:100%;border-collapse:collapse">'
    + '<tr><td style="padding:8px 0;font-weight:bold;color:#555;width:100px">Name</td><td style="padding:8px 0">' + escapeHtml(name) + '</td></tr>'
    + '<tr><td style="padding:8px 0;font-weight:bold;color:#555">Email</td><td style="padding:8px 0"><a href="mailto:' + escapeHtml(email) + '">' + escapeHtml(email) + '</a></td></tr>'
    + (subject ? '<tr><td style="padding:8px 0;font-weight:bold;color:#555">Subject</td><td style="padding:8px 0">' + escapeHtml(subject) + '</td></tr>' : '')
    + '<tr><td style="padding:8px 0;font-weight:bold;color:#555;vertical-align:top">Message</td><td style="padding:8px 0;white-space:pre-wrap">' + escapeHtml(message) + '</td></tr>'
    + '</table>'
    + '<p style="color:#888;font-size:12px;margin-top:20px">Submitted via DZIGN STORE contact form</p>'
    + '</div>';

  return sendEmail({ to: to, from: from, subject: subj, html: html });
}

async function sendNewsletterConfirmation({ email, confirmToken }) {
  var baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  var confirmUrl = baseUrl + '/api/newsletter/confirm?token=' + confirmToken;
  var from = process.env.SMTP_FROM || 'DZIGN STORE <noreply@dzignstore.com>';

  var html = '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">'
    + '<h2 style="color:#e8c820">Welcome to DZIGN STORE!</h2>'
    + '<p>Thanks for subscribing. Please confirm your email address:</p>'
    + '<a href="' + confirmUrl + '" style="display:inline-block;padding:14px 32px;background:#e8c820;color:#0a0a0a;text-decoration:none;font-weight:bold;border-radius:4px;margin:16px 0">Confirm Subscription</a>'
    + '<p style="color:#888;font-size:12px">If you didn\'t subscribe, you can safely ignore this email.</p>'
    + '</div>';

  return sendEmail({ to: email, from: from, subject: 'Confirm your DZIGN STORE subscription', html: html });
}

module.exports = {
  sendContactNotification: sendContactNotification,
  sendNewsletterConfirmation: sendNewsletterConfirmation,
  sendEmail: sendEmail,
};
