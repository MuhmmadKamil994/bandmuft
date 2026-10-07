const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true },
  answers: { type: Map, of: String, default: {} }, // qid -> user ka jawab
  status: { type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' },
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  // marking ke baad:
  sectionScores: {
    listening: { raw: Number, band: String },
    reading: { raw: Number, band: String },
  },
}, { timestamps: true });

attemptSchema.index({ user: 1, test: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
