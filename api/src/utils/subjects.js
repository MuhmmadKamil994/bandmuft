const mongoose = require('mongoose');

// Saare course subjects aik jagah — data files se.
// Har file aik array export karti hai (4 subjects each).
function load(file) {
  try {
    const data = require(file);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`[subjects] could not load ${file}: ${err.message}`);
    return [];
  }
}

const SUBJECTS = [
  ...load('../data/subjects-1'),
  ...load('../data/subjects-2'),
  ...load('../data/subjects-3'),
  ...load('../data/subjects-4'),
];

const bySlug = new Map(SUBJECTS.map((s) => [s.slug, s]));

function getSubject(slug) {
  return bySlug.get(slug) || null;
}

function subjectList() {
  return SUBJECTS.map((s) => ({ slug: s.slug, name: s.name, tagline: s.tagline }));
}

// Client ko bhejne wala content — quiz ke answers KATA kar.
// (Grading hamesha server par hoti hai.)
function stripAnswers(q) {
  if (!q) return q;
  const { answer, why, ...rest } = q;
  void answer; void why;
  return rest;
}

function publicSubject(s) {
  const st = s.steps;
  return {
    slug: s.slug, name: s.name, tagline: s.tagline,
    steps: {
      vocab: { words: st.vocab.words, quiz: st.vocab.quiz.map(stripAnswers) },
      ideas: st.ideas,
      reading: {
        passages: st.reading.passages.map((p) => ({
          title: p.title, text: p.text, questions: p.questions.map(stripAnswers),
        })),
      },
      listening: {
        title: st.listening.title,
        audioUrl: `/audio/course-${s.slug}-listening.mp3`,
        questions: st.listening.questions.map(stripAnswers),
      },
      writing: st.writing,
      speaking: { ...st.speaking, sampleAudioUrl: `/audio/course-${s.slug}-speaking-sample.mp3` },
      test: { questions: st.test.questions.map(stripAnswers) },
    },
  };
}

module.exports = { SUBJECTS, getSubject, subjectList, publicSubject, isValidObjectId: mongoose.isValidObjectId };
