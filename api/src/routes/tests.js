const express = require('express');
const MockTest = require('../models/MockTest');
const Attempt = require('../models/Attempt');
const { httpError } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');
const { rawToBand, isCorrect, overallFromBands } = require('../utils/bands');
const mongoose = require('mongoose');
const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const { gradeWriting, gradeSpeaking } = require('../utils/gemini');

const router = express.Router();

// Fields jo client ko submission se pehle KABHI nahi jayenge
const HIDE = '-questions.answers -sections.transcript';

// ── Pending writing/speaking ka lazy retry ─────────────────────────────
// Pehle retry ka system tha hi nahi: aik dafa pending = hamesha pending.
// Ab result dekhne par 60s se purani pending grading dobara try hoti hai.
async function retryAttemptSkills(attempt, test) {
  let changed = false;
  const ageMs = Date.now() - new Date(attempt.updatedAt).getTime();
  if (ageMs < 60 * 1000) return attempt;

  if (attempt.writing?.status === 'feedback-pending') {
    const sec = test.sections.find((s) => s.key === 'writing');
    for (const t of attempt.writing.tasks) {
      if (!t.feedback) {
        const fb = await gradeWriting(t.taskType, t.prompt, t.text).catch(() => null);
        if (fb) { t.feedback = fb; changed = true; }
      }
    }
    const graded = attempt.writing.tasks.filter((t) => t.feedback);
    if (graded.length) {
      attempt.writing.status = graded.length === attempt.writing.tasks.length ? 'feedback-ready' : 'feedback-pending';
      attempt.writing.band = overallFromBands(graded.map((t) => String(t.feedback.overall)));
      changed = true;
    }
    void sec;
  }
  if (attempt.speaking?.status === 'feedback-pending' && attempt.speaking.parts?.length) {
    const fb = await gradeSpeaking(attempt.speaking.parts).catch(() => null);
    if (fb) {
      attempt.speaking.feedback = fb;
      attempt.speaking.status = 'feedback-ready';
      attempt.speaking.band = fb.overall.toFixed(1);
      changed = true;
    }
  }
  if (changed) await attempt.save();
  return attempt;
}

// GET /api/v1/tests — published tests ki list
router.get('/', async (req, res, next) => {
  try {
    const tests = await MockTest.find({ published: true })
      .select('slug title durationMin kind sections.key questions.qid')
      .lean();
    const out = tests.map((t) => ({
      slug: t.slug, title: t.title, durationMin: t.durationMin, kind: t.kind,
      skills: (t.sections || []).map((s) => s.key),
      questionCount: (t.questions || []).length,
    }));
    res.json({ ok: true, tests: out });
  } catch (err) { next(err); }
});

// POST /api/v1/tests/attempts/:id/submit — Listening/Reading submit + marking
router.post('/attempts/:id/submit', requireAuth, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) throw httpError(404, 'Attempt not found');
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt || attempt.user.toString() !== req.user._id.toString()) {
      throw httpError(404, 'Attempt not found');
    }
    if (attempt.status === 'submitted') {
      return res.json({ ok: true, already: true, attemptId: attempt._id.toString() });
    }
    const test = await MockTest.findById(attempt.test).select('+questions.answers').lean();
    if (!test) throw httpError(404, 'Test not found');
    if (!test.questions.length) throw httpError(400, 'This test has no Listening/Reading questions.');

    const given = req.body.answers || {};
    const results = [];
    const totals = { listening: { raw: 0, total: 0 }, reading: { raw: 0, total: 0 } };

    for (const q of test.questions) {
      const correct = isCorrect(q, given[q.qid]);
      totals[q.section].total += q.points;
      if (correct) totals[q.section].raw += q.points;
      results.push({
        qid: q.qid, section: q.section, type: q.type, group: q.group,
        prompt: q.prompt, options: q.options, items: q.items,
        given: given[q.qid] || '', correct, answers: q.answers,
      });
    }

    attempt.answers = given;
    attempt.status = 'submitted';
    attempt.submittedAt = new Date();
    attempt.sectionScores = {
      listening: totals.listening.total
        ? { raw: totals.listening.raw, band: rawToBand(totals.listening.raw, 'listening') }
        : undefined,
      reading: totals.reading.total
        ? { raw: totals.reading.raw, band: rawToBand(totals.reading.raw, 'reading') }
        : undefined,
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

// POST /api/v1/tests/attempts/:id/writing — full mock / writing test ke essays
router.post('/attempts/:id/writing', requireAuth, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) throw httpError(404, 'Attempt not found');
    const attempt = await Attempt.findById(req.params.id);
    if (!attempt || attempt.user.toString() !== req.user._id.toString()) {
      throw httpError(404, 'Attempt not found');
    }
    const test = await MockTest.findById(attempt.test).lean();
    const wsec = test?.sections.find((s) => s.key === 'writing');
    if (!wsec?.writing?.length) throw httpError(400, 'This test has no writing section.');

    const incoming = Array.isArray(req.body.tasks) ? req.body.tasks : [];
    const tasks = [];
    for (const wp of wsec.writing) {
      const given = incoming.find((t) => t.taskType === wp.taskType);
      if (!given || !given.text || given.text.trim().split(/\s+/).length < 20) {
        throw httpError(400, `Write at least 20 words for ${wp.title}.`);
      }
      if (given.text.length > 5000) throw httpError(400, 'Max 5000 characters per task.');
      tasks.push({
        taskType: wp.taskType, prompt: wp.text, text: given.text.trim(),
        wordCount: given.text.trim().split(/\s+/).length, feedback: undefined,
      });
    }
    for (const t of tasks) {
      t.feedback = await gradeWriting(t.taskType, t.prompt, t.text).catch(() => null) || undefined;
    }
    const graded = tasks.filter((t) => t.feedback);
    attempt.writing = {
      status: graded.length === tasks.length ? 'feedback-ready' : 'feedback-pending',
      tasks,
      band: graded.length ? overallFromBands(graded.map((t) => String(t.feedback.overall))) : undefined,
    };
    if (test.kind === 'writing' && attempt.status !== 'submitted') {
      attempt.status = 'submitted';
      attempt.submittedAt = new Date();
    }
    await attempt.save();
    res.json({ ok: true, writing: attempt.writing });
  } catch (err) { next(err); }
});

// GET /api/v1/tests/attempts/mine — history (login zaroori)
router.get('/attempts/mine', requireAuth, async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id, status: 'submitted' })
      .populate('test', 'slug title kind')
      .sort({ submittedAt: -1 })
      .select('test sectionScores writing.band writing.status speaking.band speaking.status submittedAt')
      .lean();
    res.json({ ok: true, attempts });
  } catch (err) { next(err); }
});

// GET /api/v1/tests/attempts/:id — result review, sirf apna + submitted
router.get('/attempts/:id', requireAuth, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) throw httpError(404, 'Attempt not found');
    const attempt = await Attempt.findById(req.params.id).populate('test', 'slug title kind');
    if (!attempt || attempt.user.toString() !== req.user._id.toString()) {
      throw httpError(404, 'Attempt not found');
    }
    if (attempt.status !== 'submitted') throw httpError(400, 'Submit first to see results.');
    const test = await MockTest.findById(attempt.test._id).select('+questions.answers +sections.transcript').lean();
    await retryAttemptSkills(attempt, test);
    const given = Object.fromEntries(attempt.answers || new Map());
    const results = test.questions.map((q) => ({
      qid: q.qid, section: q.section, type: q.type, group: q.group,
      prompt: q.prompt, options: q.options, items: q.items,
      given: given[q.qid] || '', correct: isCorrect(q, given[q.qid]), answers: q.answers,
    }));
    const listeningSec = test.sections.find((s) => s.key === 'listening');
    res.json({
      ok: true,
      test: { slug: test.slug, title: test.title, kind: test.kind },
      scores: attempt.sectionScores,
      writing: attempt.writing,
      speaking: attempt.speaking ? {
        status: attempt.speaking.status, band: attempt.speaking.band,
        feedback: attempt.speaking.feedback, parts: attempt.speaking.parts,
      } : undefined,
      listeningTranscript: listeningSec?.transcript || null,
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
// Resume-friendly: adhoora attempt ho to wahi wapas milta hai; full mock
// L/R submit ho chuka ho lekin Writing/Speaking baqi hon to wahi attempt
// "complete remaining sections" mode mein resume hota hai.
router.post('/:slug/start', requireAuth, async (req, res, next) => {
  try {
    const test = await MockTest.findOne({ slug: req.params.slug, published: true })
      .select(HIDE).lean();
    if (!test) throw httpError(404, 'Test not found');

    let attempt = await Attempt.findOne({ user: req.user._id, test: test._id, status: 'in-progress' })
      .sort({ createdAt: -1 });
    if (!attempt && test.kind === 'full') {
      const last = await Attempt.findOne({ user: req.user._id, test: test._id, status: 'submitted' })
        .sort({ createdAt: -1 });
      const wOpen = !last?.writing || last.writing.status === 'not-started' || !last.writing.status;
      const sOpen = !last?.speaking || last.speaking.status === 'not-started' || !last.speaking.status;
      if (last && (wOpen || sOpen)) attempt = last;
    }
    if (!attempt) {
      attempt = await Attempt.create({ user: req.user._id, test: test._id });
    }
    res.status(201).json({
      ok: true,
      attemptId: attempt._id.toString(),
      test,
      attemptState: {
        status: attempt.status,
        answers: Object.fromEntries(attempt.answers || new Map()),
        writing: attempt.writing || null,
        speaking: attempt.speaking ? {
          status: attempt.speaking.status, band: attempt.speaking.band,
          feedback: attempt.speaking.feedback,
          parts: (attempt.speaking.parts || []).map((p) => ({ part: p.part, recordingId: p.recordingId ? p.recordingId.toString() : null })),
        } : null,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
