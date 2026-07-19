const nodemailer = require('nodemailer');

// ── Email Transport ─────────────────────────────────────────────────
// Configure via environment variables:
//   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
//
// For development, you can use Mailtrap, Ethereal, or similar.
// For production, use a transactional ESP (SendGrid, Postmark, Mailgun, etc.)

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host) {
    console.warn('[EMAIL] SMTP_HOST not configured — emails will be logged instead of sent');
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user ? { user, pass } : undefined,
  });

  return transporter;
}

// ── Send Contact Form Notification ──────────────────────────────────
async function sendContactNotification({ name, email, subject, message }) {
  const to = process.env.NOTIFICATION_EMAIL || 'hello@dzignstore.com';
  const from = process.env.SMTP_FROM || 'DZIGN STORE <noreply@dzignstore.com>';
  const subj = subject ? `[DZIGN] New Contact: ${subject}` : `[DZIGN] New Contact from ${name}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e8c820; border-bottom: 2px solid #e8c820; padding-bottom: 10px;">
        New Contact Form Submission
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #555; width: 100px;">Name</td>
          <td style="padding: 8px 0;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #555;">Email</td>
          <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
        </tr>
        ${subject ? `<tr>
          <td style="padding: 8px 0; font-weight: bold; color: #555;">Subject</td>
          <td style="padding: 8px 0;">${escapeHtml(subject)}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #555; vertical-align: top;">Message</td>
          <td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(message)}</td>
        </tr>
      </table>
      <p style="color: #888; font-size: 12px; margin-top: 20px;">
        Submitted via DZIGN STORE contact form
      </p>
    </div>
  `;

  return sendEmail({ to, from, subject: subj, html });
}

// ── Send Newsletter Confirmation ────────────────────────────────────
async function sendNewsletterConfirmation({ email, confirmToken }) {
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  const confirmUrl = `${baseUrl}/api/v1/newsletter/confirm?token=${confirmToken}`;
  const from = process.env.SMTP_FROM || 'DZIGN STORE <noreply@dzignstore.com>';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e8c820;">Welcome to DZIGN STORE!</h2>
      <p>Thanks for subscribing. Please confirm your email address:</p>
      <a href="${confirmUrl}"
         style="display: inline-block; padding: 14px 32px; background: #e8c820; color: #0a0a0a;
                text-decoration: none; font-weight: bold; border-radius: 4px; margin: 16px 0;">
        Confirm Subscription
      </a>
      <p style="color: #888; font-size: 12px;">
        If you didn't subscribe, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendEmail({ to: email, from, subject: 'Confirm your DZIGN STORE subscription', html });
}

// ── Generic Send ────────────────────────────────────────────────────
async function sendEmail({ to, from, subject, html }) {
  const transport = getTransporter();

  if (!transport) {
    console.log('[EMAIL] Would send:', { to, from, subject });
    return { sent: false, reason: 'no_transport' };
  }

  try {
    await transport.sendMail({ to, from, subject, html });
    return { sent: true };
  } catch (err) {
    console.error('[EMAIL] Send failed:', err.message);
    return { sent: false, reason: err.message };
  }
}

// ── XSS Protection for email content ────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = {
  sendContactNotification,
  sendNewsletterConfirmation,
  sendEmail,
};
