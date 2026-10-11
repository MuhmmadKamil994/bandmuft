const mongoose = require('mongoose');

const fbSchema = new mongoose.Schema({
  // writing: taskResponse/coherence/lexical/grammar — speaking: fluency/lexical/grammar
  taskResponse: Number,
  coherence: Number,
  fluency: Number,
  lexical: Number,
  grammar: Number,
  overall: Number,
  comments: String,
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true },
  answers: { type: Map, of: String, default: {} }, // qid -> user ka jawab
  status: { type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' },
  startedAt: { type: Date, default: Date.now },
  submittedAt: Date,
  // marking ke baad (Listening/Reading):
  sectionScores: {
    listening: { raw: Number, band: String },
    reading: { raw: Number, band: String },
  },
  // Writing (full mock ya writing practice ke andar):
  writing: {
    status: { type: String, enum: ['not-started', 'feedback-ready', 'feedback-pending'], default: 'not-started' },
    tasks: [{
      taskType: { type: String, enum: ['task1', 'task2'] },
      prompt: String,
      text: String,
      wordCount: Number,
      feedback: fbSchema,
      _id: false,
    }],
    band: String, // dono tasks ke overall ka average (0.5 rounding)
  },
  // Speaking:
  speaking: {
    status: { type: String, enum: ['not-started', 'feedback-ready', 'feedback-pending'], default: 'not-started' },
    parts: [{
      part: Number,           // 1 | 2 | 3
      transcript: String,
      recordingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recording' },
      _id: false,
    }],
    feedback: fbSchema,
    band: String,
  },
}, { timestamps: true });

attemptSchema.index({ user: 1, test: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
