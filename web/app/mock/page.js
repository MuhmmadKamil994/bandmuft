'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function MockList() {
  const [tests, setTests] = useState(null);

  useEffect(() => {
    api.get('/tests').then((d) => setTests(d.tests)).catch(() => setTests([]));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2">Free Mock Tests</h1>
      <p className="text-gray-600 mb-8">Full Listening + Reading mocks. Instant band scores. 100% free.</p>
      {tests === null && <p>Loading…</p>}
      {tests && tests.length === 0 && <p>No tests published yet. Check back soon.</p>}
      <div className="grid gap-4">
        {(tests || []).map((t) => (
          <div key={t.slug} className="card flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">{t.title}</h2>
              <p className="text-sm text-gray-600">{t.questionCount} questions · {t.durationMin} minutes</p>
            </div>
            <a href={`/mock/${t.slug}`} className="btn-primary btn-sm">Start</a>
          </div>
        ))}
      </div>
    </div>
  );
}
