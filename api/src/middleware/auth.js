const jwt = require('jsonwebtoken');
const { httpError } = require('./error');
const User = require('../models/User');

function cookieOpts() {
  const prod = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: prod,          // sirf HTTPS par
    // Production mein frontend (vercel.app) aur backend (onrender.com) alag
    // domains par hain — cross-origin cookies ke liye SameSite=None lazmi hai,
    // warna browser cookie bhejta hi nahi aur login loop ban jata hai.
    // (Render par NODE_ENV=production set hona chahiye.)
    sameSite: prod ? 'none' : 'lax',
    path: '/',
  };
}

function signAccess(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );
}

function signRefresh(user, tokenVersion) {
  return jwt.sign(
    { sub: user._id.toString(), v: tokenVersion },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
}

// Route guard: login zaroori
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.bm_access;
    if (!token) throw httpError(401, 'Login required');
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub).select('_id role email name isVerified');
    if (!user) throw httpError(401, 'Login required');
    req.user = user;
    next();
  } catch (err) {
    next(err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError'
      ? httpError(401, 'Session expired, please login again')
      : err);
  }
}

// Route guard: role check — client se aaya role kabhi trust nahi hota
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(httpError(403, 'Not allowed'));
    }
    next();
  };
}

module.exports = { cookieOpts, signAccess, signRefresh, requireAuth, requireRole };
