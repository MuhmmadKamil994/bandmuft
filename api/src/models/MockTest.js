const mongoose = require('mongoose');

// Question types:
// mcq        — options[], answers: [correct option text]
// tfng/ynng  — options fixed, answers: ['True'] etc.
// matching   — items[] (match these), options[] (to these), answers[] aligned with items
// completion — sentence/summary completion, answers: [acceptable texts...]
// short      — short answer, answers: [acceptable texts...]
const questionSchema = new mongoose.Schema({
  qid: { type: String, required: true }, // "L1".."L40", "R1".. — test ke andar unique
  section: { type: String, enum: ['listening', 'reading'], required: true },
  type: {
    type: String, required: true,
    enum: ['mcq', 'tfng', 'ynng', 'matching', 'completion', 'short'],
  },
  prompt: { type: String, required: true },
  group: { type: String }, // "Section 1", "Passage 2" — display grouping
  options: [String],
  items: [String],
  // answers KABHI client ko submission se pehle nahi jayenge
  answers: { type: [String], required: true, select: false },
  points: { type: Number, default: 1 },
}, { _id: false });

const sectionSchema = new mongoose.Schema({
  key: { type: String, enum: ['listening', 'reading', 'writing', 'speaking'], required: true },
  title: String,
  audioUrl: String,          // listening
  transcript: { type: String, select: false }, // sirf submit ke baad
  passages: [{ title: String, text: String }], // reading
  // writing section:
  writing: [{
    taskType: { type: String, enum: ['task1', 'task2'] },
    title: String,
    text: String,
  }],
  // speaking section:
  speaking: {
    part1: { topic: String, questions: [String] },
    part2: { cue: String, points: [String] },
    part3: { topic: String, questions: [String] },
  },
}, { _id: false });

const testSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  // full = charon skills; warna single-skill practice test
  kind: { type: String, enum: ['full', 'listening', 'reading', 'writing', 'speaking'], default: 'full' },
  published: { type: Boolean, default: false },
  durationMin: { type: Number, default: 60 },
  sections: [sectionSchema],
  questions: [questionSchema],
}, { timestamps: true });

module.exports = mongoose.model('MockTest', testSchema);
