const mongoose = require('mongoose');

// Speaking recordings — MongoDB mein hi (Cloudinary nahi; user ki shart).
// Render ki disk deploy par saaf ho jati hai, is liye audio yahan rakha hai.
// Compress (Opus/WebM, low bitrate) par ~1 MB per speaking test.
// Alag collection mein hai taake Attempt documents halke rahen.
const recordingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  attempt: { type: mongoose.Schema.Types.ObjectId, ref: 'Attempt' },
  part: { type: Number }, // speaking part 1|2|3 (course speaking par null ho sakta)
  context: { type: String, default: 'test' }, // 'test' | 'course:<subjectSlug>'
  mime: { type: String, default: 'audio/webm' },
  sizeBytes: { type: Number, default: 0 },
  data: { type: Buffer, required: true, select: false },
}, { timestamps: true });

recordingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Recording', recordingSchema);
