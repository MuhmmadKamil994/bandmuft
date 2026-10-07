const express = require('express');
const WritingPrompt = require('../models/WritingPrompt');
const Submission = require('../models/Submission');
const { httpError } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');
const { gradeWriting } = require('../utils/gemini');

const router = express.Router();

// GET /api/v1/writing/prompts
router.get('/prompts', async (req, res, next) => {
  try {
    const prompts = await WritingPrompt.find({ active: true }).select('taskType title text').lean();
    res.json({ ok: true, prompts });
  } catch (err) { next(err); }
});

// POST /api/v1/writing/submit (login zaroori)
router.post('/submit', requireAuth, async (req, res, next) => {
  try {
    const { promptId, text } = req.body;
    if (!promptId || !text || text.trim().split(/\s+/).length < 20) {
      throw httpError(400, 'Write at least 20 words.');
    }
    if (text.length > 5000) throw httpError(400, 'Max 5000 characters.');
    const prompt = await WritingPrompt.findById(promptId);
    if (!prompt || !prompt.active) throw httpError(404, 'Prompt not found');

    const words = text.trim().split(/\s+/).length;
    const sub = await Submission.create({
      user: req.user._id,
      taskType: prompt.taskType,
      prompt: prompt.text,
      text: text.trim(),
      wordCount: words,
      status: 'submitted',
    });

    // AI feedback — key nahi to pending (cron/worker baad mein retry kar sakta hai)
    const fb = await gradeWriting(prompt.taskType, prompt.text, text.trim()).catch(() => null);
    if (fb) {
      sub.feedback = fb;
      sub.status = 'feedback-ready';
      await sub.save();
    } else {
      sub.status = 'feedback-pending';
      await sub.save();
    }
    res.status(201).json({ ok: true, id: sub._id.toString(), status: sub.status });
  } catch (err) { next(err); }
});

// GET /api/v1/writing/mine
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const subs = await Submission.find({ user: req.user._id })
      .sort({ createdAt: -1 }).select('taskType wordCount status feedback.overall createdAt').lean();
    res.json({ ok: true, submissions: subs });
  } catch (err) { next(err); }
});

// GET /api/v1/writing/:id — sirf apni
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const sub = await Submission.findById(req.params.id).lean();
    if (!sub || sub.user.toString() !== req.user._id.toString()) {
      throw httpError(404, 'Not found');
    }
    res.json({ ok: true, submission: sub });
  } catch (err) { next(err); }
});

module.exports = router;
