// Official IELTS raw (0-40) -> band. Listening aur Reading (Academic) ki
// tables ALAG hain — pehle aik hi combined table thi jo kuch scores par
// ghalat band deti thi. Source: official IELTS conversion tables.
const LISTENING = [
  [39, '9.0'], [37, '8.5'], [35, '8.0'], [32, '7.5'], [30, '7.0'],
  [26, '6.5'], [23, '6.0'], [18, '5.5'], [16, '5.0'], [13, '4.5'],
  [11, '4.0'], [9, '3.5'], [7, '3.0'], [5, '2.5'], [3, '2.0'],
];
const READING = [
  [39, '9.0'], [37, '8.5'], [35, '8.0'], [33, '7.5'], [30, '7.0'],
  [27, '6.5'], [23, '6.0'], [19, '5.5'], [15, '5.0'], [13, '4.5'],
  [10, '4.0'], [8, '3.5'], [6, '3.0'], [4, '2.5'],
];

function rawToBand(raw, section = 'listening') {
  if (!Number.isInteger(raw) || raw < 0 || raw > 40) return null;
  const table = section === 'reading' ? READING : LISTENING;
  for (const [min, band] of table) if (raw >= min) return band;
  return 'Below 2.5';
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

// Overall band: jitne bands maujood hon un ka average,
// IELTS rounding ke saath nearest 0.5 par.
function overallFromBands(bands) {
  const nums = bands.map((b) => parseFloat(b)).filter((n) => !Number.isNaN(n));
  if (!nums.length) return null;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return (Math.round(avg * 2) / 2).toFixed(1);
}

module.exports = { rawToBand, norm, isCorrect, overallFromBands, LISTENING, READING };
