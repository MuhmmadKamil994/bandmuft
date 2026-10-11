const express = require('express');
const CourseProgress = require('../models/CourseProgress');
const Submission = require('../models/Submission');
const { httpError } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');
const { norm } = require('../utils/bands');
const { gradeWriting } = require('../utils/gemini');
const { markStep } = require('../utils/progress');
const { getSubject, subjectList, publicSubject } = require('../utils/subjects');

const router = express.Router();

// Step numbers: 1 Vocab, 2 Ideas, 3 Reading, 4 Listening, 5 Writing, 6 Speaking, 7 Test
const QUIZ_STEPS = { vocab: 1, reading: 3, listening: 4, test: 7 };
const PASS_RATIO = { vocab: 0.8, reading: 0.6, listening: 0.6, test: 0.7 };

function quizQuestions(subject, kind) {
  const st = subject.steps;
  if (kind === 'vocab') return st.vocab.quiz;
  if (kind === 'reading') return st.reading.passages.flatMap((p) => p.questions);
  if (kind === 'listening') return st.listening.questions;
  if (kind === 'test') return st.test.questions;
  return [];
}

// GET /api/v1/course/subjects — public list
router.get('/subjects', (req, res) => {
  res.json({ ok: true, subjects: subjectList() });
});

// GET /api/v1/course/progress — meri progress (login zaroori)
router.get('/progress', requireAuth, async (req, res, next) => {
  try {
    const docs = await CourseProgress.find({ user: req.user._id }).lean();
    const progress = {};
    for (const d of docs) {
      progress[d.subject] = {
        stepsDone: d.stepsDone,
        stepResults: d.stepResults instanceof Map ? Object.fromEntries(d.stepResults) : (d.stepResults || {}),
      };
    }
    res.json({ ok: true, progress });
  } catch (err) { next(err); }
});

// POST /api/v1/course/step — sirf Step 2 (Key Ideas) self-mark hota hai
router.post('/step', requireAuth, async (req, res, next) => {
  try {
    const { subject: slug, step } = req.body || {};
    const subject = getSubject(slug);
    if (!subject) throw httpError(404, 'Subject not found');
    if (step !== 2) throw httpError(400, 'This step completes through its own activity.');
    const doc = await markStep(req.user._id, slug, 2);
    res.json({ ok: true, stepsDone: doc.stepsDone });
  } catch (err) { next(err); }
});

// POST /api/v1/course/quiz — vocab/reading/listening/test grading (server-side)
router.post('/quiz', requireAuth, async (req, res, next) => {
  try {
    const { subject: slug, kind, answers } = req.body || {};
    const subject = getSubject(slug);
    if (!subject) throw httpError(404, 'Subject not found');
    const step = QUIZ_STEPS[kind];
    if (!step) throw httpError(400, 'Invalid quiz kind.');
    const questions = quizQuestions(subject, kind);
    const given = Array.isArray(answers) ? answers : [];
    let score = 0;
    const review = questions.map((q, i) => {
      const g = given[i] || '';
      const correct = norm(g) === norm(q.answer);
      if (correct) score += 1;
      return { q: q.q, given: g, correct, answer: q.answer, why: q.why || undefined };
    });
    const total = questions.length;
    const passed = total > 0 && score / total >= PASS_RATIO[kind];
    let stepsDone;
    if (passed) {
      const doc = await markStep(req.user._id, slug, step, { score: `${score}/${total}` });
      stepsDone = doc.stepsDone;
    }
    res.json({
      ok: true, score, total, passed, review, stepsDone,
      // Listening ka transcript sirf attempt ke BAAD milta hai
      script: kind === 'listening' ? subject.steps.listening.script : undefined,
    });
  } catch (err) { next(err); }
});

// POST /api/v1/course/writing — Step 5: subject ke prompt par Gemini feedback
router.post('/writing', requireAuth, async (req, res, next) => {
  try {
    const { subject: slug, taskType, text } = req.body || {};
    const subject = getSubject(slug);
    if (!subject) throw httpError(404, 'Subject not found');
    const task = subject.steps.writing[taskType];
    if (!task) throw httpError(400, 'Invalid task type.');
    if (!text || text.trim().split(/\s+/).length < 20) throw httpError(400, 'Write at least 20 words.');
    if (text.length > 5000) throw httpError(400, 'Max 5000 characters.');

    const words = text.trim().split(/\s+/).length;
    const sub = await Submission.create({
      user: req.user._id, taskType, prompt: task.text, text: text.trim(),
      wordCount: words, status: 'feedback-pending',
    });
    const fb = await gradeWriting(taskType, task.text, text.trim()).catch(() => null);
    if (fb) {
      sub.feedback = fb;
      sub.status = 'feedback-ready';
      await sub.save();
      await markStep(req.user._id, slug, 5, { band: fb.overall.toFixed(1) });
    }
    res.json({ ok: true, id: sub._id.toString(), status: sub.status, feedback: fb || null });
  } catch (err) { next(err); }
});

// GET /api/v1/course/subjects/:slug — full content, answers KATE hue
router.get('/subjects/:slug', (req, res, next) => {
  try {
    const subject = getSubject(req.params.slug);
    if (!subject) throw httpError(404, 'Subject not found');
    res.json({ ok: true, subject: publicSubject(subject) });
  } catch (err) { next(err); }
});

module.exports = router;
