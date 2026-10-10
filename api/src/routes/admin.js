// Admin routes — sirf role='admin' walay. requireRole client ka bheja
// role kabhi trust nahi karta, JWT se aaya role check hota hai.
const express = require('express');
const { httpError } = require('../middleware/error');
const { requireAuth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const MockTest = require('../models/MockTest');
const Attempt = require('../models/Attempt');
const Certificate = require('../models/Certificate');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

// Dashboard stats
router.get('/stats', async (req, res, next) => {
  try {
    const [users, tests, attempts, certificates] = await Promise.all([
      User.countDocuments(),
      MockTest.countDocuments(),
      Attempt.countDocuments(),
      Certificate.countDocuments(),
    ]);
    res.json({ ok: true, stats: { users, tests, attempts, certificates } });
  } catch (err) { next(err); }
});

// Users list (latest 100)
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .select('name email role isVerified createdAt');
    res.json({ ok: true, users });
  } catch (err) { next(err); }
});

// Role change: student <-> admin
router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'student'].includes(role)) {
      throw httpError(400, 'Invalid role');
    }
    // Apna role khud change nahi kar sakte — lockout se bachao
    if (req.params.id === req.user._id.toString()) {
      throw httpError(400, 'You cannot change your own role');
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('name email role');
    if (!user) throw httpError(404, 'User not found');
    res.json({ ok: true, user });
  } catch (err) { next(err); }
});

// Mock tests list (admin overview)
router.get('/tests', async (req, res, next) => {
  try {
    const tests = await MockTest.find()
      .sort({ createdAt: -1 })
      .select('slug title isPublished durationMin createdAt')
      .lean();
    const withCounts = tests.map((t) => ({
      ...t,
      questionCount: t.questions ? t.questions.length : 0,
      questions: undefined,
    }));
    res.json({ ok: true, tests: withCounts });
  } catch (err) { next(err); }
});

module.exports = router;
