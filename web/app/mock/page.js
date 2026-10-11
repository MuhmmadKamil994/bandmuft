'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const SKILL_LABEL = { listening: '🎧 Listening', reading: '📖 Reading', writing: '✍️ Writing', speaking: '🎤 Speaking' };

function Group({ title, subtitle, tests }) {
  if (!tests.length) return null;
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-extrabold mb-1">{title}</h2>
      <p className="text-gray-600 mb-5">{subtitle}</p>
      <div className="grid gap-4">
        {tests.map((t) => (
          <div key={t.slug} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-lg">{t.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                {t.questionCount > 0 ? `${t.questionCount} questions · ` : ''}{t.durationMin} minutes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(t.skills || []).map((s) => (
                  <span key={s} className="text-xs font-semibold bg-navy/5 text-navy rounded-full px-2.5 py-1">
                    {SKILL_LABEL[s] || s}
                  </span>
                ))}
              </div>
            </div>
            <a href={`/mock/${t.slug}`} className="btn-primary btn-sm shrink-0">Start</a>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function MockList() {
  const [tests, setTests] = useState(null);

  useEffect(() => {
    api.get('/tests').then((d) => setTests(d.tests)).catch(() => setTests([]));
  }, []);

  const full = (tests || []).filter((t) => t.kind === 'full');
  const practice = (kind) => (tests || []).filter((t) => t.kind === kind);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2">Free Mock Tests</h1>
      <p className="text-gray-600 mb-10">
        Full four-skill mock tests and single-skill practice sets. Instant band scores. 100% free.
      </p>
      {tests === null && <p>Loading…</p>}
      {tests && tests.length === 0 && <p>No tests published yet. Check back soon.</p>}
      <Group title="Full IELTS Mock Tests" subtitle="Listening + Reading + Writing + Speaking — one overall band and a verifiable certificate." tests={full} />
      <Group title="Listening Practice" subtitle="One full listening test: 40 questions, 4 sections." tests={practice('listening')} />
      <Group title="Reading Practice" subtitle="One full reading test: 3 passages, 40 questions." tests={practice('reading')} />
      <Group title="Speaking Practice" subtitle="Parts 1, 2 and 3 — record your voice and get AI feedback." tests={practice('speaking')} />
      <Group title="Writing Practice" subtitle="Prefer the standalone writing studio with more prompts." tests={[]} />
      {(tests || []).length > 0 && (
        <div className="card text-center">
          <p className="font-bold mb-1">Want more Writing practice?</p>
          <p className="text-sm text-gray-600 mb-4">Task 1 and Task 2 prompts with instant AI feedback on the 4 official criteria.</p>
          <a href="/writing" className="btn-secondary btn-sm">Open Writing Practice</a>
        </div>
      )}
    </div>
  );
}
