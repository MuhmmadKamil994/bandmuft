// Admin routes — sirf role='admin'. requireRole client ka bheja role
// kabhi trust nahi karta, JWT se aaya role check hota hai.
const express = require('express');
const { httpError } = require('../middleware/error');
const { requireAuth, requireRole } = require('../middleware/auth');
const { overallFromBands } = require('../utils/bands');
const User = require('../models/User');
const MockTest = require('../models/MockTest');
const Attempt = require('../models/Attempt');
const Certificate = require('../models/Certificate');
const Submission = require('../models/Submission');
const Recording = require('../models/Recording');
const CourseProgress = require('../models/CourseProgress');

const router = express.Router();
router.use(requireAuth, requireRole('admin'));

function attemptOverall(a) {
  const bands = [];
  if (a.sectionScores?.listening?.band) bands.push(a.sectionScores.listening.band);
  if (a.sectionScores?.reading?.band) bands.push(a.sectionScores.reading.band);
  if (a.writing?.band) bands.push(a.writing.band);
  if (a.speaking?.band) bands.push(a.speaking.band);
  return bands.length ? parseFloat(overallFromBands(bands)) : null;
}

// ── Overview ────────────────────────────────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const [users, tests, attempts, certificates, recAgg] = await Promise.all([
      User.countDocuments(),
      MockTest.countDocuments(),
      Attempt.countDocuments({ status: 'submitted' }),
      Certificate.countDocuments(),
      Recording.aggregate([{ $group: { _id: null, count: { $sum: 1 }, bytes: { $sum: '$sizeBytes' } } }]),
    ]);
    // Pichle 7 din ki signups (chart ke liye)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - i);
      const end = new Date(start); end.setDate(end.getDate() + 1);
      const count = await User.countDocuments({ createdAt: { $gte: start, $lt: end } });
      days.push({ date: start.toISOString().slice(0, 10), count });
    }
    const recentAttempts = await Attempt.find({ status: 'submitted' })
      .sort({ submittedAt: -1 }).limit(8)
      .populate('user', 'name email').populate('test', 'title')
      .select('sectionScores writing.band speaking.band submittedAt').lean();
    res.json({
      ok: true,
      stats: { users, tests, attempts, certificates },
      signups7d: days,
      recordings: {
        count: recAgg[0]?.count || 0,
        sizeMB: Math.round(((recAgg[0]?.bytes || 0) / (1024 * 1024)) * 10) / 10,
      },
      recentActivity: recentAttempts.map((a) => ({
        id: a._id.toString(),
        user: a.user ? { name: a.user.name, email: a.user.email } : null,
        test: a.test?.title || '',
        overall: attemptOverall(a),
        at: a.submittedAt,
      })),
    });
  } catch (err) { next(err); }
});

// ── Users ───────────────────────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
  try {
    const q = String(req.query.search || '').trim();
    const filter = {};
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .select('name email role isVerified banned createdAt');
    res.json({ ok: true, users });
  } catch (err) { next(err); }
});

function guardSelf(req) {
  if (req.params.id === req.user._id.toString()) {
    throw httpError(400, 'You cannot do this to your own account');
  }
}

router.patch('/users/:id/role', async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'student'].includes(role)) throw httpError(400, 'Invalid role');
    guardSelf(req); // apna role khud change nahi — lockout se bachao
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true })
      .select('name email role');
    if (!user) throw httpError(404, 'User not found');
    res.json({ ok: true, user });
  } catch (err) { next(err); }
});

// Email change — dummy-email recovery ka core tool
router.patch('/users/:id/email', async (req, res, next) => {
  try {
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) throw httpError(400, 'Invalid email');
    const clash = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (clash) throw httpError(409, 'This email is already used by another account');
    const user = await User.findByIdAndUpdate(req.params.id, { email }, { new: true })
      .select('name email role');
    if (!user) throw httpError(404, 'User not found');
    res.json({ ok: true, user });
  } catch (err) { next(err); }
});

// Password reset — admin kisi user ka password set kar sakta hai.
// Purane sessions foran khatam (refreshVersion bump).
router.post('/users/:id/reset-password', async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || String(password).length < 8) {
      throw httpError(400, 'Password must be at least 8 characters');
    }
    const user = await User.findById(req.params.id).select('+refreshVersion');
    if (!user) throw httpError(404, 'User not found');
    await user.setPassword(String(password));
    user.refreshVersion += 1;
    await user.save();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Ban / unban — login band, data mehfooz, reversible
router.patch('/users/:id/ban', async (req, res, next) => {
  try {
    guardSelf(req);
    const banned = !!req.body.banned;
    const user = await User.findById(req.params.id).select('+refreshVersion name email banned');
    if (!user) throw httpError(404, 'User not found');
    user.banned = banned;
    if (banned) user.refreshVersion += 1; // live sessions bhi khatam
    await user.save();
    res.json({ ok: true, user: { id: user._id.toString(), name: user.name, email: user.email, banned: user.banned } });
  } catch (err) { next(err); }
});

// Delete — permanent. Attempts/progress/recordings saaf; certificates
// verification ke liye mehfooz rahte hain.
router.delete('/users/:id', async (req, res, next) => {
  try {
    guardSelf(req);
    const user = await User.findById(req.params.id);
    if (!user) throw httpError(404, 'User not found');
    await Promise.all([
      Attempt.deleteMany({ user: user._id }),
      Submission.deleteMany({ user: user._id }),
      CourseProgress.deleteMany({ user: user._id }),
      Recording.deleteMany({ user: user._id }),
    ]);
    await user.deleteOne();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Tests ───────────────────────────────────────────────────────────────
router.get('/tests', async (req, res, next) => {
  try {
    const tests = await MockTest.find()
      .sort({ createdAt: -1 })
      .select('slug title kind published durationMin questions.qid sections.key createdAt')
      .lean();
    const out = [];
    for (const t of tests) {
      const attempts = await Attempt.find({ test: t._id, status: 'submitted' })
        .select('sectionScores writing.band speaking.band').lean();
      const overalls = attempts.map(attemptOverall).filter((n) => n !== null);
      out.push({
        id: t._id.toString(), slug: t.slug, title: t.title, kind: t.kind,
        published: t.published, durationMin: t.durationMin,
        skills: (t.sections || []).map((s) => s.key),
        questionCount: (t.questions || []).length,
        attempts: attempts.length,
        avgBand: overalls.length
          ? Math.round((overalls.reduce((a, b) => a + b, 0) / overalls.length) * 2) / 2
          : null,
        createdAt: t.createdAt,
      });
    }
    res.json({ ok: true, tests: out });
  } catch (err) { next(err); }
});

router.patch('/tests/:id/publish', async (req, res, next) => {
  try {
    const test = await MockTest.findByIdAndUpdate(
      req.params.id, { published: !!req.body.published }, { new: true }
    ).select('slug title published');
    if (!test) throw httpError(404, 'Test not found');
    res.json({ ok: true, test });
  } catch (err) { next(err); }
});

// ── Attempts + recordings ───────────────────────────────────────────────
router.get('/attempts', async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ status: 'submitted' })
      .sort({ submittedAt: -1 }).limit(60)
      .populate('user', 'name email').populate('test', 'title slug')
      .select('sectionScores writing.status writing.band speaking.status speaking.band speaking.parts.part speaking.parts.recordingId submittedAt')
      .lean();
    res.json({
      ok: true,
      attempts: attempts.map((a) => ({
        id: a._id.toString(),
        user: a.user ? { name: a.user.name, email: a.user.email } : null,
        test: a.test ? { title: a.test.title, slug: a.test.slug } : null,
        listening: a.sectionScores?.listening?.band || null,
        reading: a.sectionScores?.reading?.band || null,
        writing: a.writing?.band || null,
        speaking: a.speaking?.band || null,
        overall: attemptOverall(a),
        speakingParts: (a.speaking?.parts || []).map((p) => ({
          part: p.part, recordingId: p.recordingId ? p.recordingId.toString() : null,
        })),
        submittedAt: a.submittedAt,
      })),
    });
  } catch (err) { next(err); }
});

router.get('/attempts/:id', async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('user', 'name email').populate('test', 'title slug').lean();
    if (!attempt) throw httpError(404, 'Attempt not found');
    res.json({ ok: true, attempt });
  } catch (err) { next(err); }
});

router.get('/recordings', async (req, res, next) => {
  try {
    const recs = await Recording.find()
      .sort({ createdAt: -1 }).limit(100)
      .populate('user', 'name email')
      .select('user attempt part context mime sizeBytes createdAt').lean();
    const totalBytes = recs.reduce((a, r) => a + (r.sizeBytes || 0), 0);
    res.json({
      ok: true,
      totalMB: Math.round((totalBytes / (1024 * 1024)) * 10) / 10,
      recordings: recs.map((r) => ({
        id: r._id.toString(),
        user: r.user ? { name: r.user.name, email: r.user.email } : null,
        attemptId: r.attempt ? r.attempt.toString() : null,
        part: r.part, context: r.context,
        sizeMB: Math.round(((r.sizeBytes || 0) / (1024 * 1024)) * 100) / 100,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) { next(err); }
});

router.delete('/recordings/:id', async (req, res, next) => {
  try {
    const rec = await Recording.findById(req.params.id);
    if (!rec) throw httpError(404, 'Recording not found');
    // Attempt ke andar ka reference bhi saaf kar do
    if (rec.attempt) {
      await Attempt.updateOne(
        { _id: rec.attempt },
        { $unset: { 'speaking.parts.$[p].recordingId': '' } },
        { arrayFilters: [{ 'p.recordingId': rec._id }] }
      ).catch(() => {});
    }
    await rec.deleteOne();
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Certificates ────────────────────────────────────────────────────────
router.get('/certificates', async (req, res, next) => {
  try {
    const certs = await Certificate.find()
      .sort({ createdAt: -1 }).limit(100)
      .select('code name testTitle listeningBand readingBand writingBand speakingBand overallBand createdAt')
      .lean();
    res.json({ ok: true, certificates: certs });
  } catch (err) { next(err); }
});

module.exports = router;
