'use client';
import { useState } from 'react';
import Input from '@/components/ui/Input';

// Official IELTS conversion tables (Academic) — Listening aur Reading ki
// tables ALAG hain. Backend (api/src/utils/bands.js) se bilkul match.
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

function rawToBand(raw, table) {
  for (const [min, band] of table) if (raw >= min) return band;
  return 'Below 2.5';
}

function overallBand(scores) {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  // IELTS rounding: .25 up to the next half band, .75 up to the next whole band
  return (Math.round(avg * 2) / 2).toFixed(1);
}

export default function BandCalculator() {
  const [skill, setSkill] = useState('listening');
  const [raw, setRaw] = useState('');
  const [skills, setSkills] = useState({ l: '', r: '', w: '', s: '' });

  const rawNum = raw === '' ? null : Number(raw);
  const rawError = rawNum !== null && (!Number.isInteger(rawNum) || rawNum < 0 || rawNum > 40)
    ? 'Enter a whole number between 0 and 40.'
    : '';
  const band = rawNum !== null && !rawError
    ? rawToBand(rawNum, skill === 'listening' ? LISTENING : READING)
    : null;

  const nums = Object.values(skills).map(Number);
  const allFilled = Object.values(skills).every((v) => v !== '') && nums.every((n) => n >= 0 && n <= 9);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2">IELTS Band Score Calculator</h1>
      <p className="text-gray-600 mb-8">Free. No signup needed.</p>

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Raw score → Band</h2>
        <div className="flex gap-2 mb-4">
          {[['listening', 'Listening'], ['reading', 'Reading (Academic)']].map(([k, label]) => (
            <button key={k} onClick={() => setSkill(k)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold border-2 transition-colors ${skill === k ? 'border-navy bg-navy text-white' : 'border-gray-200 hover:border-navy'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input label="Correct answers (0–40)" type="number" min={0} max={40}
              value={raw} onChange={(e) => setRaw(e.target.value)} />
          </div>
        </div>
        {rawError && <p className="text-red-600 font-semibold mt-2">{rawError}</p>}
        {band && (
          <p className="text-lg mt-2">Your {skill} band: <b className="text-navy text-2xl">{band}</b></p>
        )}
        <p className="text-xs text-gray-500 mt-3">
          Listening and Reading use different official conversion tables — pick the right skill.
          Based on the official IELTS 40-question conversion scale (Academic).
        </p>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">Overall band calculator</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[['l', 'Listening'], ['r', 'Reading'], ['w', 'Writing'], ['s', 'Speaking']].map(([k, label]) => (
            <Input key={k} label={label} type="number" min={0} max={9} step={0.5}
              value={skills[k]}
              onChange={(e) => setSkills({ ...skills, [k]: e.target.value })} />
          ))}
        </div>
        {allFilled && (
          <p className="text-lg mt-2">Overall band: <b className="text-navy text-2xl">{overallBand(nums)}</b></p>
        )}
      </div>
    </div>
  );
}
