'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const LABELS = {
  taskResponse: 'Task Achievement / Response',
  coherence: 'Coherence & Cohesion',
  lexical: 'Lexical Resource',
  grammar: 'Grammatical Range & Accuracy',
};

function Bar({ label, value }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-semibold">{label}</span>
        <b className="text-navy">{value?.toFixed(1) ?? '—'}</b>
      </div>
      <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-gold rounded-full" style={{ width: `${((value || 0) / 9) * 100}%` }} />
      </div>
    </div>
  );
}

export default function Feedback({ params }) {
  const [sub, setSub] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/writing/${params.id}`).then((d) => setSub(d.submission)).catch((e) => setError(e.message));
  }, [params.id]);

  if (error) return <p className="text-center py-16 text-red-600 font-semibold">{error}</p>;
  if (!sub) return <p className="text-center py-16">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-1">Writing Feedback</h1>
      <p className="text-gray-600 mb-8">{sub.wordCount} words · {new Date(sub.createdAt).toLocaleDateString()}</p>

      {sub.status === 'feedback-ready' && sub.feedback ? (
        <>
          <div className="card mb-6 text-center">
            <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">Estimated band</p>
            <p className="text-6xl font-extrabold text-navy my-2">{sub.feedback.overall.toFixed(1)}</p>
          </div>
          <div className="card mb-6">
            {Object.entries(LABELS).map(([k, label]) => (
              <Bar key={k} label={label} value={sub.feedback[k]} />
            ))}
          </div>
          <div className="card">
            <h2 className="font-bold mb-2">Examiner comments</h2>
            <p className="text-[15px] leading-relaxed text-gray-800">{sub.feedback.comments}</p>
          </div>
        </>
      ) : (
        <div className="card text-center py-10">
          <p className="font-semibold">AI feedback is being prepared.</p>
          <p className="text-sm text-gray-600 mt-1">Refresh this page in a minute.</p>
        </div>
      )}

      <div className="card mt-6">
        <h2 className="font-bold mb-2">Your answer</h2>
        <p className="text-[15px] leading-relaxed whitespace-pre-line text-gray-800">{sub.text}</p>
      </div>
    </div>
  );
}
