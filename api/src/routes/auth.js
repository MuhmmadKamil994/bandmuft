const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const User = require('../models/User');
const { httpError } = require('../middleware/error');
const { validate } = require('../middleware/validate');
const { cookieOpts, signAccess, signRefresh, requireAuth } = require('../middleware/auth');
const { sha256, randomOtp, randomToken } = require('../utils/tokens');
const { sendMail, otpEmail, resetEmail } = require('../utils/mailer');

const router = express.Router();

// Sensitive endpoints par sakht rate limit
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  message: { error: 'Too many attempts, try again in 15 minutes.' },
  standardHeaders: true, legacyHeaders: false,
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { error: 'Too many login attempts, try again in 15 minutes.' },
  standardHeaders: true, legacyHeaders: false,
});

const emailRule = z.string().email().max(160).transform((s) => s.toLowerCase().trim());
const passwordRule = z.string().min(8, 'Min 8 characters').max(72);

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailRule,
  password: passwordRule,
});
const otpSchema = z.object({ email: emailRule, code: z.string().regex(/^\d{6}$/) });
const loginSchema = z.object({ email: emailRule, password: z.string().min(1).max(72) });
const forgotSchema = z.object({ email: emailRule });
const resetSchema = z.object({
  token: z.string().min(10).max(200),
  password: passwordRule,
});

async function issueOtp(user) {
  const code = randomOtp();
  user.otpHash = sha256(code);
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.otpAttempts = 0;
  await user.save();
  await sendMail({ to: user.email, subject: 'BandMuft — your verification code', html: otpEmail(code) });
}

function setSessionCookies(res, user) {
  const access = signAccess(user);
  const refresh = signRefresh(user, user.refreshVersion);
  res.cookie('bm_access', access, { ...cookieOpts(), maxAge: 15 * 60 * 1000 });
  res.cookie('bm_refresh', refresh, { ...cookieOpts(), maxAge: 7 * 24 * 3600 * 1000 });
}

function clearSessionCookies(res) {
  res.clearCookie('bm_access', { ...cookieOpts() });
  res.clearCookie('bm_refresh', { ...cookieOpts() });
}

// POST /api/v1/auth/register
router.post('/register', authLimiter, validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    // User enumeration se bachao: registered ho ya na ho, same response
    if (exists) {
      if (!exists.isVerified) await issueOtp(exists);
      return res.status(201).json({ ok: true, message: 'If this email is new, a code was sent.' });
    }
    const user = new User({ name, email });
    await user.setPassword(password);
    await user.save();
    await issueOtp(user);
    res.status(201).json({ ok: true, message: 'Account created. Verification code sent.' });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/verify-otp
router.post('/verify-otp', authLimiter, validate(otpSchema), async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email }).select('+otpHash +otpExpires +otpAttempts');
    if (!user || !user.otpHash || !user.otpExpires || user.otpExpires < new Date()) {
      throw httpError(400, 'Code expired or invalid. Request a new one.');
    }
    if (user.otpAttempts >= 5) throw httpError(429, 'Too many wrong tries. Request a new code.');
    if (sha256(code) !== user.otpHash) {
      user.otpAttempts += 1;
      await user.save();
      throw httpError(400, 'Wrong code.');
    }
    user.isVerified = true;
    user.otpHash = undefined; user.otpExpires = undefined; user.otpAttempts = 0;
    user.refreshVersion += 1;
    await user.save();
    setSessionCookies(res, user);
    res.json({ ok: true, user: user.toSafeJSON() });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/resend-otp
router.post('/resend-otp', authLimiter, validate(forgotSchema), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && !user.isVerified) await issueOtp(user);
    res.json({ ok: true, message: 'If the account exists and is unverified, a code was sent.' });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/login
router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // Same message chahe email ghalat ho ya password — enumeration nahi
    if (!user || !(await user.checkPassword(password))) {
      throw httpError(401, 'Invalid credentials');
    }
    if (!user.isVerified) {
      await issueOtp(user);
      throw httpError(403, 'Email not verified. A new code was sent.');
    }
    setSessionCookies(res, user);
    res.json({ ok: true, user: user.toSafeJSON() });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/refresh — rotation + reuse detection
router.post('/refresh', async (req, res, next) => {
  try {
    const jwt = require('jsonwebtoken');
    const token = req.cookies.bm_refresh;
    if (!token) throw httpError(401, 'Login required');
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw httpError(401, 'Session expired, please login again');
    }
    const user = await User.findById(payload.sub).select('+refreshVersion');
    if (!user) throw httpError(401, 'Login required');
    // Purana token dobara aaya = chori ka shak → sab sessions kill
    if (payload.v !== user.refreshVersion) {
      user.refreshVersion += 1;
      await user.save();
      clearSessionCookies(res);
      throw httpError(401, 'Session compromised. Please login again.');
    }
    user.refreshVersion += 1; // rotate
    await user.save();
    setSessionCookies(res, user);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/logout
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+refreshVersion');
    if (user) { user.refreshVersion += 1; await user.save(); }
    clearSessionCookies(res);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/forgot-password  (FYP mein nahi tha — yahan hai)
router.post('/forgot-password', authLimiter, validate(forgotSchema), async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+resetHash');
    if (user) {
      const token = randomToken();
      user.resetHash = sha256(token);
      user.resetExpires = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      const link = `${process.env.WEB_URL}/reset-password?token=${token}`;
      await sendMail({ to: user.email, subject: 'BandMuft — reset your password', html: resetEmail(link) });
    }
    // Email registered ho ya na ho — same response (enumeration nahi)
    res.json({ ok: true, message: 'If the email exists, a reset link was sent.' });
  } catch (err) { next(err); }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', authLimiter, validate(resetSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetHash: sha256(token) })
      .select('+resetHash +resetExpires +refreshVersion');
    if (!user || !user.resetExpires || user.resetExpires < new Date()) {
      throw httpError(400, 'Link expired or invalid.');
    }
    await user.setPassword(password);
    user.resetHash = undefined; user.resetExpires = undefined;
    user.refreshVersion += 1; // purane sessions kill — choor bahar
    await user.save();
    res.json({ ok: true, message: 'Password changed. Please login.' });
  } catch (err) { next(err); }
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user.toSafeJSON() });
});

module.exports = router;
