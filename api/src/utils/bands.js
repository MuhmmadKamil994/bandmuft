// Official IELTS raw (0–40) → band. Listening + Reading (Academic).
const TABLE = [
  [39, '9.0'], [37, '8.5'], [35, '8.0'], [33, '7.5'], [30, '7.0'],
  [27, '6.5'], [23, '6.0'], [20, '5.5'], [16, '5.0'], [13, '4.5'],
  [11, '4.0'], [9, '3.5'], [7, '3.0'],
];

function rawToBand(raw) {
  if (!Number.isInteger(raw) || raw < 0 || raw > 40) return null;
  for (const [min, band] of TABLE) if (raw >= min) return band;
  return 'Below 3.0';
}

// Text answers normalize karo: case/punctuation/spacing se farq na pare
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[.,;:!?'"()]/g, '')
    .replace(/\s+/g, ' ');
}

function isCorrect(question, given) {
  const g = norm(given);
  if (!g) return false;
  return question.answers.some((a) => norm(a) === g);
}

module.exports = { rawToBand, norm, isCorrect };
