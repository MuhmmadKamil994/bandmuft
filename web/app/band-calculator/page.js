'use client';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Official IELTS raw (0–40) → band mapping, Listening + Reading (Academic).
// Low end varies slightly per test — below 3.0 ko estimate batate hain.
const TABLE = [
  [39, '9.0'], [37, '8.5'], [35, '8.0'], [33, '7.5'], [30, '7.0'],
  [27, '6.5'], [23, '6.0'], [20, '5.5'], [16, '5.0'], [13, '4.5'],
  [11, '4.0'], [9, '3.5'], [7, '3.0'],
];

function rawToBand(raw) {
  if (raw > 40 || raw < 0 || !Number.isInteger(raw)) return null;
  for (const [min, band] of TABLE) if (raw >= min) return band;
  return 'Below 3.0';
}

function overallBand(scores) {
  const avg = scores.reduce((a, b) => a + b, 0) / 4;
  // IELTS rounding: .25 → .5, .75 → next whole
  return (Math.round(avg * 2) / 2).toFixed(1);
}

export default function BandCalculator() {
  const [raw, setRaw] = useState('');
  const [skills, setSkills] = useState({ l: '', r: '', w: '', s: '' });

  const band = raw === '' ? null : rawToBand(Number(raw));
  const nums = Object.values(skills).map(Number);
  const allFilled = nums.every((n) => n >= 0 && n <= 9 && skills.l !== '');

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2">IELTS Band Score Calculator</h1>
      <p className="text-gray-600 mb-8">Free. No signup needed.</p>

      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Raw score → Band (Listening / Reading)</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input label="Correct answers (0–40)" type="number" min={0} max={40}
              value={raw} onChange={(e) => setRaw(e.target.value)} />
          </div>
        </div>
        {band && (
          <p className="text-lg mt-2">Your band: <b className="text-navy text-2xl">{band}</b></p>
        )}
        <p className="text-xs text-gray-500 mt-3">
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
