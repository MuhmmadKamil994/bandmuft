const express = require('express');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const crypto = require('crypto');
const Attempt = require('../models/Attempt');
const Certificate = require('../models/Certificate');
const { httpError } = require('../middleware/error');
const { requireAuth } = require('../middleware/auth');
const { overallFromBands } = require('../utils/bands');

const router = express.Router();

// Design C — Dark Premium
const NAVY = '#0B2149';
const NAVY_DEEP = '#071733';
const GOLD = '#C9A227';
const GOLD_LIGHT = '#E8C766';
const CREAM = '#F7EFDC';
const MUTED = '#A9B6CC';

function makeCode() {
  return 'BM-2026-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

function attemptBands(attempt) {
  return {
    listeningBand: attempt.sectionScores?.listening?.band || null,
    readingBand: attempt.sectionScores?.reading?.band || null,
    writingBand: attempt.writing?.band || null,
    speakingBand: attempt.speaking?.band || null,
  };
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

    const bands = attemptBands(attempt);
    const present = [bands.listeningBand, bands.readingBand, bands.writingBand, bands.speakingBand].filter(Boolean);
    if (!present.length) throw httpError(400, 'No scores to certify yet.');
    const overallBand = overallFromBands(present);

    const cert = await Certificate.create({
      code: makeCode(),
      user: req.user._id,
      attempt: attempt._id,
      name: req.user.name,
      testTitle: attempt.test.title,
      ...bands,
      overallBand,
    });
    res.status(201).json({ ok: true, code: cert.code });
  } catch (err) { next(err); }
});

// GET /api/v1/certificates/verify/:code — public
router.get('/verify/:code', async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ code: req.params.code.toUpperCase() })
      .select('code name testTitle listeningBand readingBand writingBand speakingBand overallBand createdAt').lean();
    if (!cert) throw httpError(404, 'Certificate not found');
    res.json({ ok: true, certificate: cert });
  } catch (err) { next(err); }
});

// GET /api/v1/certificates/mine (login zaroori) — /:code se PEHLE
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const certs = await Certificate.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('code testTitle listeningBand readingBand writingBand speakingBand overallBand createdAt').lean();
    res.json({ ok: true, certificates: certs });
  } catch (err) { next(err); }
});

// GET /api/v1/certificates/:code — certificate detail (screen par Design C dikhane ke liye)
router.get('/:code', async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ code: req.params.code.toUpperCase() })
      .select('code name testTitle listeningBand readingBand writingBand speakingBand overallBand createdAt').lean();
    if (!cert) throw httpError(404, 'Certificate not found');
    res.json({ ok: true, certificate: cert });
  } catch (err) { next(err); }
});

// GET /api/v1/certificates/:code/qr — QR image (verify link ki taraf)
router.get('/:code/qr', async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase();
    const cert = await Certificate.findOne({ code }).select('code').lean();
    if (!cert) throw httpError(404, 'Certificate not found');
    const verifyUrl = `${process.env.WEB_URL}/verify-certificate?code=${code}`;
    const png = await QRCode.toBuffer(verifyUrl, { width: 240, margin: 1 });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(png);
  } catch (err) { next(err); }
});

// GET /api/v1/certificates/:code/pdf — Design C (Dark Premium) PDF
router.get('/:code/pdf', async (req, res, next) => {
  try {
    const cert = await Certificate.findOne({ code: req.params.code.toUpperCase() }).lean();
    if (!cert) throw httpError(404, 'Certificate not found');

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 0 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="BandMuft-${cert.code}.pdf"`);
    doc.pipe(res);

    const W = 841.89, H = 595.28, cx = W / 2;
    const verifyUrl = `${process.env.WEB_URL}/verify-certificate?code=${cert.code}`;

    // ── Dark navy background + gold double border ──
    doc.rect(0, 0, W, H).fill(NAVY_DEEP);
    doc.rect(18, 18, W - 36, H - 36).fill(NAVY);
    doc.rect(26, 26, W - 52, H - 52).lineWidth(2.5).stroke(GOLD);
    doc.rect(36, 36, W - 72, H - 72).lineWidth(0.75).stroke(GOLD);

    // ── Header ──
    doc.fillColor(GOLD_LIGHT).font('Times-Bold').fontSize(27)
      .text('B A N D M U F T', 0, 58, { align: 'center', width: W });
    doc.fillColor(MUTED).font('Helvetica').fontSize(10)
      .text('F R E E   I E L T S   P R A C T I C E   P L A T F O R M', 0, 90, { align: 'center', width: W });
    doc.moveTo(cx - 120, 116).lineTo(cx + 120, 116).lineWidth(1).stroke(GOLD);

    doc.fillColor(CREAM).font('Times-Bold').fontSize(35)
      .text('Certificate of Achievement', 0, 128, { align: 'center', width: W });
    doc.fillColor(MUTED).font('Helvetica').fontSize(11.5)
      .text('This certificate is proudly presented to', 0, 176, { align: 'center', width: W });
    doc.fillColor(GOLD_LIGHT).font('Times-Italic').fontSize(33)
      .text(cert.name, 0, 196, { align: 'center', width: W });
    doc.fillColor(MUTED).font('Helvetica').fontSize(11.5)
      .text(`for successfully completing ${cert.testTitle} with an Overall Band Score of`, 0, 240, { align: 'center', width: W });
    doc.fillColor(GOLD_LIGHT).font('Times-Bold').fontSize(46)
      .text(cert.overallBand, 0, 258, { align: 'center', width: W });

    // ── Section band boxes ──
    const bands = [
      ['LISTENING', cert.listeningBand], ['READING', cert.readingBand],
      ['WRITING', cert.writingBand], ['SPEAKING', cert.speakingBand],
    ].filter(([, v]) => v);
    const boxW = 118, gap = 16;
    const totalW = bands.length * boxW + (bands.length - 1) * gap;
    let bx = cx - totalW / 2;
    const by = 330;
    for (const [label, val] of bands) {
      doc.rect(bx, by, boxW, 62).lineWidth(1).stroke(GOLD);
      doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(9)
        .text(label, bx, by + 10, { align: 'center', width: boxW });
      doc.fillColor(CREAM).font('Times-Bold').fontSize(24)
        .text(val, bx, by + 24, { align: 'center', width: boxW });
      bx += boxW + gap;
    }

    // ── Gold seal (bottom-left of centre) ──
    const sx = 120, sy = 452;
    doc.polygon([sx - 14, sy + 22], [sx - 2, sy + 22], [sx - 8, sy + 52]).fill('#8E1F2F');
    doc.polygon([sx + 2, sy + 22], [sx + 14, sy + 22], [sx + 8, sy + 52]).fill('#8E1F2F');
    doc.circle(sx, sy, 27).fill(GOLD);
    doc.circle(sx, sy, 21).lineWidth(1.2).stroke(NAVY_DEEP);
    doc.fillColor(NAVY_DEEP).font('Times-Bold').fontSize(13)
      .text('BM', sx - 20, sy - 8, { align: 'center', width: 40 });
    doc.fillColor(NAVY_DEEP).font('Helvetica-Bold').fontSize(5.5)
      .text('VERIFIED', sx - 20, sy + 6, { align: 'center', width: 40 });

    // ── Signature (bottom-centre-right) ──
    doc.fillColor(GOLD_LIGHT).font('Times-Italic').fontSize(16)
      .text('BandMuft Assessment Board', cx - 40, 446, { width: 260 });
    doc.moveTo(cx - 30, 474).lineTo(cx + 210, 474).lineWidth(0.75).stroke(GOLD);
    doc.fillColor(MUTED).font('Helvetica').fontSize(8.5)
      .text('Assessment Board', cx - 30, 480, { width: 240 });

    // ── QR tile (bottom-right) ──
    const qr = await QRCode.toBuffer(verifyUrl, { width: 200, margin: 1, color: { dark: NAVY_DEEP, light: '#FFFFFF' } });
    doc.roundedRect(W - 148, 408, 84, 84, 6).fill('#FFFFFF');
    doc.image(qr, W - 142, 414, { width: 72 });
    doc.fillColor(MUTED).font('Helvetica').fontSize(8)
      .text('Scan to verify', W - 148, 496, { width: 84, align: 'center' });

    // ── Footer: ID + date + disclaimer ──
    const d = new Date(cert.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    doc.fillColor(MUTED).font('Helvetica').fontSize(9.5)
      .text(`Certificate ID: ${cert.code}      Issued: ${d}`, 56, 508);
    doc.fillColor('#7787A0').font('Helvetica').fontSize(7.5)
      .text(`Verify at ${verifyUrl}  •  Practice assessment only — not an official IELTS result. Not affiliated with British Council, IDP or Cambridge.`,
        56, 526, { width: W - 240 });

    doc.end();
  } catch (err) { next(err); }
});

module.exports = router;
