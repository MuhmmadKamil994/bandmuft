'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

export default function Result({ params }) {
  const router = useRouter();
  const { slug, attemptId } = params;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [certCode, setCertCode] = useState(null);
  const [certBusy, setCertBusy] = useState(false);

  useEffect(() => {
    api.get(`/tests/attempts/${attemptId}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [attemptId]);

  async function getCertificate() {
    setCertBusy(true);
    try {
      const d = await api.post('/certificates/issue', { attemptId });
      setCertCode(d.code);
    } catch (err) { setError(err.message); }
    setCertBusy(false);
  }

  if (error) return <p className="text-center py-16 text-red-600 font-semibold">{error}</p>;
  if (!data) return <p className="text-center py-16">Loading results…</p>;

  const { scores, results } = data;
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-1">{data.test.title}</h1>
      <p className="text-gray-600 mb-8">Your results — {correct}/{total} correct</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {['listening', 'reading'].map((k) => (
          <div key={k} className="card text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">{k}</p>
            <p className="text-5xl font-extrabold text-navy my-2">{scores[k].band}</p>
            <p className="text-sm text-gray-600">{scores[k].raw}/40 correct</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        {!certCode ? (
          <Button size="sm" disabled={certBusy} onClick={getCertificate}>
            {certBusy ? 'Issuing…' : 'Get my certificate'}
          </Button>
        ) : (
          <>
            <a className="btn-primary btn-sm"
              href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/certificates/${certCode}/pdf`}>
              Download certificate (PDF)
            </a>
            <a href={`/verify?code=${certCode}`} className="btn-secondary btn-sm">Verify</a>
          </>
        )}
        <a href="/mock" className="btn-ghost btn-sm">Try another test</a>
      </div>

      <h2 className="text-2xl font-extrabold mb-4">Answer review</h2>
      <div className="space-y-3">
        {results.map((r) => (
          <div key={r.qid} className={`card border-l-4 ${r.correct ? 'border-l-green-600' : 'border-l-red-500'}`}>
            <p className="font-semibold">
              <span className="font-extrabold mr-2">{r.qid}</span>{r.prompt}
            </p>
            <div className="text-sm mt-2 space-y-1">
              <p>Your answer: <b className={r.correct ? 'text-green-700' : 'text-red-600'}>{r.given || '—'}</b></p>
              {!r.correct && <p>Correct: <b className="text-green-700">{r.answers.join(' / ')}</b></p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
