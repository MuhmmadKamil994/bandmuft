const CourseProgress = require('../models/CourseProgress');

// Roadmap ka aik step mukammal mark karo (+ optional result)
async function markStep(userId, subjectSlug, step, result) {
  const doc = await CourseProgress.findOneAndUpdate(
    { user: userId, subject: subjectSlug },
    { $addToSet: { stepsDone: step } },
    { upsert: true, new: true }
  );
  if (result) {
    doc.stepResults.set(String(step), { ...result, at: new Date() });
    await doc.save();
  }
  return doc;
}

module.exports = { markStep };
