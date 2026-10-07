const mongoose = require('mongoose');

const certSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // BM-2026-XXXXXX
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attempt: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt', required: true },
  name: String,
  testTitle: String,
  listeningBand: String,
  readingBand: String,
  overallBand: String,
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certSchema);
