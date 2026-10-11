'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const ROADMAP = ['Start free', 'Pick a topic', 'Finish its 7 steps', 'Take a Full Mock', 'Get your certificate'];

export default function CourseList() {
  const [subjects, setSubjects] = useState(null);
  const [progress, setProgress] = useState({});
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    api.get('/course/subjects').then((d) => setSubjects(d.subjects)).catch(() => setSubjects([]));
    api.get('/course/progress')
      .then((d) => { setProgress(d.progress || {}); setLoggedIn(true); })
      .catch(() => setLoggedIn(false));
  }, []);

  const doneCount = (slug) => (progress[slug]?.stepsDone || []).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2">The BandMuft Course</h1>
      <p className="text-gray-600 mb-8 max-w-2xl">
        Sixteen topics that IELTS loves most. Each topic is a short roadmap of 7 steps —
        vocabulary, key ideas, reading, listening, writing, speaking and a final test.
      </p>

      {/* Overall roadmap */}
      <div className="card mb-10">
        <h2 className="font-bold mb-4">Your overall roadmap</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {ROADMAP.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 rounded-xl bg-navy text-white px-4 py-3 text-sm font-semibold w-full justify-center text-center">
                <span className="text-gold font-extrabold">{i + 1}</span> {s}
              </div>
              {i < ROADMAP.length - 1 && <span className="text-gold-dark font-extrabold hidden sm:inline">→</span>}
            </div>
          ))}
        </div>
        {!loggedIn && (
          <p className="text-sm text-gray-600 mt-4">
            <a href="/login" className="text-navy font-semibold hover:underline">Login</a> or{' '}
            <a href="/register" className="text-navy font-semibold hover:underline">register free</a> to save your progress.
          </p>
        )}
      </div>

      {subjects === null && <p>Loading…</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(subjects || []).map((s) => {
          const done = doneCount(s.slug);
          const pct = Math.round((done / 7) * 100);
          return (
            <a key={s.slug} href={`/course/${s.slug}`} className="card block hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-1">
                <h2 className="font-bold text-lg">{s.name}</h2>
                {done === 7
                  ? <span className="text-xs font-bold bg-green-100 text-green-700 rounded-full px-2.5 py-1">✓ Complete</span>
                  : done > 0
                    ? <span className="text-xs font-bold bg-gold/20 text-gold-dark rounded-full px-2.5 py-1">In progress</span>
                    : <span className="text-xs font-bold bg-gray-100 text-gray-500 rounded-full px-2.5 py-1">Not started</span>}
              </div>
              <p className="text-sm text-gray-600 mb-4">{s.tagline}</p>
              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-1.5">
                <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-gray-500">{done}/7 steps · {pct}%</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}
