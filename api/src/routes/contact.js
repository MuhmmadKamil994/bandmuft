const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { validate } = require('../middleware/validate');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

// Spam se bachao — 5 messages per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  message: { error: 'Too many messages. Please try again later.' },
  standardHeaders: true, legacyHeaders: false,
});

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().max(160),
  message: z.string().trim().min(10).max(2000),
});

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// POST /api/v1/contact — message seedha admin ki email par.
// Resend test mode mein bhi chalega: recipient account owner khud hai.
router.post('/', contactLimiter, validate(schema), async (req, res, next) => {
  try {
    const { name, email, message } = req.body;
    const to = process.env.CONTACT_TO || process.env.ADMIN_EMAIL;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#0E2A47">BandMuft — new contact message</h2>
        <p><b>Name:</b> ${esc(name)}</p>
        <p><b>Email:</b> ${esc(email)}</p>
        <p><b>Message:</b></p>
        <p style="white-space:pre-wrap;background:#f6f6f6;padding:12px;border-radius:8px">${esc(message)}</p>
        <p style="color:#666;font-size:12px">Reply dabao ge to jawab seedha is user ko jayega (reply-to set hai).</p>
      </div>`;
    if (to) {
      await sendMail({ to, subject: `BandMuft contact — ${name}`, html, replyTo: email });
    } else {
      console.log(`[contact] CONTACT_TO/ADMIN_EMAIL not set. From ${email}: ${message}`);
    }
    res.json({ ok: true, message: 'Message sent. We usually reply within 24 hours.' });
  } catch (err) { next(err); }
});

module.exports = router;
