const mongoose = require('mongoose');

// Course roadmap progress — har user x subject ke liye aik document.
// stepsDone: step numbers (1..7) jo mukammal ho chuke.
const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true }, // subject slug
  stepsDone: { type: [Number], default: [] },
  // step 5/6 ke results ka halka record (band display ke liye)
  stepResults: {
    type: Map,
    of: new mongoose.Schema({ band: String, score: String, at: Date }, { _id: false }),
    default: {},
  },
}, { timestamps: true });

progressSchema.index({ user: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('CourseProgress', progressSchema);
