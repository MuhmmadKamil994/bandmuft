const express = require('express');
const rateLimit = require('express-rate-limit');
const Attempt = require('../models/Attempt');
const Recording = require('../models/Recording');
const { httpError } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');
const { gradeSpeaking } = require('../utils/gemini');
const { markStep } = require('../utils/progress');
const mongoose = require('mongoose');
const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const { getSubject } = require('../utils/subjects');

const router = express.Router();

// Gemini quota bachane ke liye speaking submissions par limit
const speakingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 12,
  message: { error: 'Too many speaking submissions. Please wait a few minutes.' },
  standardHeaders: true, legacyHeaders: false,
});

const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // per part

// parts: [{ part, transcript, audio (base64, optional), mime }]
// Recordings MongoDB mein save hoti hain (Cloudinary nahi) — admin panel
// se suni aur delete ki ja sakti hain.
async function saveParts(req, { attemptId = null, context }) {
  const partsIn = Array.isArray(req.body.parts) ? req.body.parts : [];
  if (!partsIn.length) throw httpError(400, 'No speaking parts received.');
  const saved = [];
  for (const p of partsIn) {
    const partNo = [1, 2, 3].includes(p.part) ? p.part : null;
    if (!partNo) throw httpError(400, 'Invalid speaking part.');
    let recordingId;
    if (p.audio) {
      const buf = Buffer.from(String(p.audio), 'base64');
      if (buf.length > MAX_AUDIO_BYTES) throw httpError(413, 'Recording too large.');
      if (buf.length > 1000) {
        const rec = await Recording.create({
          user: req.user._id, attempt: attemptId, part: partNo, context,
          mime: String(p.mime || 'audio/webm').slice(0, 60),
          sizeBytes: buf.length, data: buf,
        });
        recordingId = rec._id;
      }
    }
    saved.push({
      part: partNo,
      transcript: String(p.transcript || '').slice(0, 8000),
      recordingId,
    });
  }
  return saved;
}

// POST /api/v1/speaking/attempt/:attemptId — mock/practice test ki speaking
router.post('/attempt/:attemptId', requireAuth, speakingLimiter, async (req, res, next) => {
  try {
    if (!validId(req.params.attemptId)) throw httpError(404, 'Attempt not found');
    const attempt = await Attempt.findById(req.params.attemptId);
    if (!attempt || attempt.user.toString() !== req.user._id.toString()) {
      throw httpError(404, 'Attempt not found');
    }
    const MockTest = require('../models/MockTest');
    const test = await MockTest.findById(attempt.test).lean();
    if (!test?.sections.some((s) => s.key === 'speaking')) {
      throw httpError(400, 'This test has no speaking section.');
    }
    const parts = await saveParts(req, { attemptId: attempt._id, context: 'test' });
    const fb = await gradeSpeaking(parts).catch(() => null);
    attempt.speaking = {
      status: fb ? 'feedback-ready' : 'feedback-pending',
      parts,
      feedback: fb || undefined,
      band: fb ? fb.overall.toFixed(1) : undefined,
    };
    if (test.kind === 'speaking' && attempt.status !== 'submitted') {
      attempt.status = 'submitted';
      attempt.submittedAt = new Date();
    }
    await attempt.save();
    res.json({ ok: true, speaking: attempt.speaking });
  } catch (err) { next(err); }
});

// POST /api/v1/speaking/course/:subjectSlug — course Step 6 (Speaking)
router.post('/course/:subjectSlug', requireAuth, speakingLimiter, async (req, res, next) => {
  try {
    const subject = getSubject(req.params.subjectSlug);
    if (!subject) throw httpError(404, 'Subject not found');
    const parts = await saveParts(req, { context: `course:${subject.slug}` });
    const fb = await gradeSpeaking(parts).catch(() => null);
    if (fb) {
      await markStep(req.user._id, subject.slug, 6, { band: fb.overall.toFixed(1) });
    }
    res.json({
      ok: true,
      status: fb ? 'feedback-ready' : 'feedback-pending',
      feedback: fb || null,
      band: fb ? fb.overall.toFixed(1) : null,
    });
  } catch (err) { next(err); }
});

// GET /api/v1/speaking/recording/:id — audio stream (sirf owner ya admin)
router.get('/recording/:id', requireAuth, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) throw httpError(404, 'Recording not found');
    const rec = await Recording.findById(req.params.id).select('+data');
    if (!rec) throw httpError(404, 'Recording not found');
    const isOwner = rec.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') throw httpError(403, 'Not allowed');
    res.setHeader('Content-Type', rec.mime || 'audio/webm');
    res.setHeader('Content-Length', rec.data.length);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(rec.data);
  } catch (err) { next(err); }
});

module.exports = router;
