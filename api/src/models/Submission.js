const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  taskType: { type: String, enum: ['task1', 'task2'], required: true },
  prompt: { type: String, required: true },
  text: { type: String, required: true, maxlength: 5000 },
  wordCount: Number,
  status: { type: String, enum: ['submitted', 'feedback-ready', 'feedback-pending'], default: 'submitted' },
  feedback: {
    taskResponse: Number, coherence: Number, lexical: Number, grammar: Number,
    overall: Number, comments: String,
  },
}, { timestamps: true });

submissionSchema.index({ user: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
