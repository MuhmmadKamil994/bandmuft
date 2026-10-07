const express = require('express');
const MockTest = require('../models/MockTest');
const Attempt = require('../models/Attempt');
const { httpError } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');
const { rawToBand, isCorrect } = require('../utils/bands');

const router = express.Router();

// Fields jo client ko submission se pehle KABHI nahi jayenge
const HIDE = '-questions.answers -sections.transcript';

// GET /api/v1/tests — published tests ki list
router.get('/', async (req, res, next) => {
  try {
    const tests = await MockTest.find({ published: true })
      .select('slug title durationMin')
      .lean();
    const withCounts = await Promise.all(tests.map(async (t) => {
      const full = await MockTest.findById(t._id).select('questions.qid').lean();
      return { ...t, questionCount: full.questions.length };
    }));
    res.json({ ok: true, tests: withCounts });
  } catch (err) { next(err); }
});

// GET /api/v1/tests/attempts/mine — history (login zaroori)
// NOTE: /:slug routes sab se AAKHIR mein — warna "attempts" slug ban kar match ho jata
router.post('/attempts/:id/submit', requireAuth, async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt || attempt.user.toString() !== req.user._id.toString()) {
      throw httpError(404, 'Attempt not found');
    }
    if (attempt.status === 'submitted') {
      return res.json({ ok: true, already: true, attemptId: attempt._id.toString() });
    }
    // Poora test answers ke saath lao (server ke andar hi — client ko nahi)
    const test = await MockTest.findById(attempt.test).select('+questions.answers').lean();
    if (!test) throw httpError(404, 'Test not found');

    const given = req.body.answers || {};
    const results = [];
    const totals = { listening: { raw: 0, total: 0 }, reading: { raw: 0, total: 0 } };

    for (const q of test.questions) {
      const correct = isCorrect(q, given[q.qid]);
      totals[q.section].total += q.points;
      if (correct) totals[q.section].raw += q.points;
      results.push({
        qid: q.qid, section: q.section, type: q.type,
        prompt: q.prompt, options: q.options, items: q.items,
        given: given[q.qid] || '', correct, answers: q.answers,
      });
    }

    attempt.answers = given;
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    attempt.sectionScores = {
      listening: { raw: totals.listening.raw, band: rawToBand(totals.listening.raw) },
      reading: { raw: totals.reading.raw, band: rawToBand(totals.reading.raw) },
    };
    await attempt.save();

    res.json({
      ok: true,
      attemptId: attempt._id.toString(),
      scores: attempt.sectionScores,
      results,
    });
  } catch (err) { next(err); }
});

// GET /api/v1/tests/attempts/mine — history (login zaroori)
router.get('/attempts/mine', requireAuth, async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id, status: 'submitted' })
      .populate('test', 'slug title')
      .sort({ submittedAt: -1 })
      .select('test sectionScores submittedAt')
      .lean();
    res.json({ ok: true, attempts });
  } catch (err) { next(err); }
});

// GET /api/v1/tests/attempts/:id — result review, sirf apna + submitted
router.get('/attempts/:id', requireAuth, async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id).populate('test', 'slug title');
    if (!attempt || attempt.user.toString() !== req.user._id.toString()) {
      throw httpError(404, 'Attempt not found');
    }
    if (attempt.status !== 'submitted') throw httpError(400, 'Submit first to see results.');
    const test = await MockTest.findById(attempt.test._id).select('+questions.answers').lean();
    const given = Object.fromEntries(attempt.answers || new Map());
    const results = test.questions.map((q) => ({
      qid: q.qid, section: q.section, type: q.type,
      prompt: q.prompt, options: q.options, items: q.items,
      given: given[q.qid] || '', correct: isCorrect(q, given[q.qid]), answers: q.answers,
    }));
    res.json({
      ok: true,
      test: { slug: test.slug, title: test.title },
      scores: attempt.sectionScores,
      submittedAt: attempt.submittedAt,
      results,
    });
  } catch (err) { next(err); }
});

// ── /:slug routes AAKHIR mein (Express order matters) ──

// GET /api/v1/tests/:slug — test WITHOUT answers/transcript
router.get('/:slug', async (req, res, next) => {
  try {
    const test = await MockTest.findOne({ slug: req.params.slug, published: true })
      .select(HIDE).lean();
    if (!test) throw httpError(404, 'Test not found');
    res.json({ ok: true, test });
  } catch (err) { next(err); }
});

// POST /api/v1/tests/:slug/start — attempt shuru karo (login zaroori)
router.post('/:slug/start', requireAuth, async (req, res, next) => {
  try {
    const test = await MockTest.findOne({ slug: req.params.slug, published: true })
      .select(HIDE).lean();
    if (!test) throw httpError(404, 'Test not found');
    const attempt = await Attempt.create({ user: req.user._id, test: test._id });
    res.status(201).json({ ok: true, attemptId: attempt._id.toString(), test });
  } catch (err) { next(err); }
});

module.exports = router;
