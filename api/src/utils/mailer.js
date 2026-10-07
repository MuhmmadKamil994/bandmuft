const { Resend } = require('resend');

let resend = null;
function client() {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    // Key paste nahi hui to email fail nahi karega — dev mein console par print
    if (!key || key.includes('PASTE_YOUR')) return null;
    resend = new Resend(key);
  }
  return resend;
}

async function sendMail({ to, subject, html }) {
  const c = client();
  if (!c) {
    console.log(`[mail:dev] to=${to} subject="${subject}"\n${html}`);
    return { dev: true };
  }
  return c.emails.send({
    from: process.env.MAIL_FROM || 'BandMuft <onboarding@resend.dev>',
    to,
    subject,
    html,
  });
}

function otpEmail(code) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#0E2A47">BandMuft — Verify your email</h2>
      <p>Your verification code (valid 10 minutes):</p>
      <p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#0E2A47">${code}</p>
      <p style="color:#666;font-size:12px">If you didn't request this, ignore this email.</p>
    </div>`;
}

function resetEmail(link) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#0E2A47">BandMuft — Reset your password</h2>
      <p>Click the link below (valid 30 minutes, one-time use):</p>
      <p><a href="${link}" style="background:#F5A623;color:#0E2A47;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold">Reset password</a></p>
      <p style="color:#666;font-size:12px">If you didn't request this, ignore this email.</p>
    </div>`;
}

module.exports = { sendMail, otpEmail, resetEmail };
