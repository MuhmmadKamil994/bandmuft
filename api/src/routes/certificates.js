const express = require('express');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');
const Attempt = require('../models/Attempt');
const Certificate = require('../models/Certificate');
const { httpError } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const NAVY = '#0E2A47';
const GOLD = '#B8860B';
const GOLD_LIGHT = '#F5A623';
const PAPER = '#FAF7F1';

function makeCode() {
  return 'BM-2026-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

// POST /api/v1/certificates/issue { attemptId } — sirf submitted attempt par
router.post('/issue', requireAuth, async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.body.attemptId).populate('test', 'title');
    if (!attempt || attempt.user.toString() !== req.user._id.toString()) {
      throw httpError(404, 'Attempt not found');
    }
    if (attempt.status !== 'submitted') throw httpError(400, 'Submit the test first.');
    const existing = await Certificate.findOne({ attempt: attempt._id });
    if (existing) return res.json({ ok: true, code: existing.code });

    const l = attempt.sectionScores.listening.band;
    const r = attempt.sectionScores.reading.band;
    const overall = ((parseFloat(l) + parseFloat(r)) / 2);
    const overallBand = (Math.round(overall * 2) / 2).toFixed(1);

    const cert = await Certificate.create({
      code: makeCode(),
      user: req.user._id,
      attempt: attempt._id,
      name: req.user.name,
      testTitle: attempt.test.title,
      listeningBand: l,
      readingBand: r,
      overallBand,
    });
    res.status(201).json({ ok: true, code: cert.code });
  } catch (err) { next(err); }
});

// GET /api/v1/certificates/verify/:code — public
router.get('/verify/:code', async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ code: req.params.code.toUpperCase() })
      .select('code name testTitle listeningBand readingBand overallBand createdAt').lean();
    if (!cert) throw httpError(404, 'Certificate not found');
    res.json({ ok: true, certificate: cert });
  } catch (err) { next(err); }
});

// GET /api/v1/certificates/mine (login zaroori) — /:code se PEHLE
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const certs = await Certificate.find({ user: req.user._id })
      .sort({ createdAt: -1 }).select('code testTitle overallBand createdAt').lean();
    res.json({ ok: true, certificates: certs });
  } catch (err) { next(err); }
});

// GET /api/v1/certificates/:code/pdf — code janta ho to download (unguessable)
router.get('/:code/pdf', async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ code: req.params.code.toUpperCase() }).lean();
    if (!cert) throw httpError(404, 'Certificate not found');

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="BandMuft-${cert.code}.pdf"`);
    doc.pipe(res);

    const W = 841.89, H = 595.28;
    // Background
    doc.rect(0, 0, W, H).fill(PAPER);
    // Double gold border
    doc.rect(24, 24, W - 48, H - 48).lineWidth(3).stroke(GOLD);
    doc.rect(34, 34, W - 68, H - 68).lineWidth(1).stroke(GOLD);

    const cx = W / 2;
    let y = 90;
    doc.fillColor(NAVY).fontSize(26).font('Helvetica-Bold')
      .text('BANDMUFT', 0, y, { align: 'center', width: W });
    y += 34;
    doc.fillColor(GOLD).fontSize(12).font('Helvetica')
      .text('Free IELTS Mock Tests', 0, y, { align: 'center', width: W });
    y += 44;
    doc.fillColor(NAVY).fontSize(34).font('Helvetica-Bold')
      .text('Certificate of Achievement', 0, y, { align: 'center', width: W });
    y += 52;
    doc.fillColor('#333').fontSize(13).font('Helvetica')
      .text('This certificate is proudly awarded to', 0, y, { align: 'center', width: W });
    y += 30;
    doc.fillColor(GOLD).fontSize(30).font('Helvetica-BoldOblique')
      .text(cert.name, 0, y, { align: 'center', width: W });
    y += 44;
    doc.fillColor('#333').fontSize(13).font('Helvetica')
      .text(`for achieving an Overall Band Score of`, 0, y, { align: 'center', width: W });
    y += 8;
    doc.fillColor(GOLD).fontSize(52).font('Helvetica-Bold')
      .text(cert.overallBand, 0, y, { align: 'center', width: W });
    y += 66;
    doc.fillColor('#333').fontSize(11).font('Helvetica')
      .text(`${cert.testTitle}  •  Listening ${cert.listeningBand}  •  Reading ${cert.readingBand}`, 0, y, { align: 'center', width: W });

    // QR — verify link
    const verifyUrl = `${process.env.WEB_URL}/verify?code=${cert.code}`;
    const qr = await QRCode.toBuffer(verifyUrl, { width: 220, margin: 1 });
    doc.image(qr, W - 150, H - 150, { width: 90 });
    doc.fillColor('#666').fontSize(9).font('Helvetica')
      .text('Scan to verify', W - 150, H - 52, { width: 90, align: 'center' });

    // Footer
    doc.fillColor(NAVY).fontSize(10).font('Helvetica')
      .text(`Certificate ID: ${cert.code}   •   Verify at ${verifyUrl}`, 60, H - 78);
    doc.fillColor('#888').fontSize(8)
      .text('Practice assessment only — not an official IELTS result. Not affiliated with British Council, IDP or Cambridge.',
        60, H - 60, { width: W - 260 });

    // Date
    const d = new Date(cert.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.fillColor(NAVY).fontSize(11).font('Helvetica').text(d, 60, H - 150);

    doc.end();
  } catch (err) { next(err); }
});

module.exports = router;
