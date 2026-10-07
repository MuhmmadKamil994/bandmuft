const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
  taskType: { type: String, enum: ['task1', 'task2'], required: true },
  title: String,
  text: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('WritingPrompt', promptSchema);
