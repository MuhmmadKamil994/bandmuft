'use client';
import { useEffect, useState } from 'react';
import { api, API_BASE } from '@/lib/api';
import Button from '@/components/ui/Button';

function overallFrom(bands) {
  const nums = bands.map((b) => parseFloat(b)).filter((n) => !Number.isNaN(n));
  if (!nums.length) return null;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return (Math.round(avg * 2) / 2).toFixed(1);
}

function Feedback({ fb }) {
  if (!fb) return <p className="text-sm text-amber-700">AI feedback is being prepared — refresh in a minute.</p>;
  const rows = [
    ['Task Response', fb.taskResponse], ['Fluency & Coherence', fb.fluency],
    ['Coherence & Cohesion', fb.coherence], ['Lexical Resource', fb.lexical],
    ['Grammatical Range & Accuracy', fb.grammar],
  ].filter(([, v]) => typeof v === 'number');
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
        {rows.map(([k, v]) => (
          <p key={k} className="flex justify-between border-b border-gray-100 py-1"><span>{k}</span><b>{Number(v).toFixed(1)}</b></p>
        ))}
      </div>
      {fb.comments && <p className="text-sm text-gray-700 mt-2">{fb.comments}</p>}
    </div>
  );
}

export default function Result({ params }) {
  const { slug, attemptId } = params;
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [certCode, setCertCode] = useState(null);
  const [certBusy, setCertBusy] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    api.get(`/tests/attempts/${attemptId}`)
      .then(setData)
      .catch((err) => setError(err.message));
    api.get('/certificates/mine')
      .then((d) => {
        const mine = (d.certificates || []).find((c) => c.attemptId === attemptId);
        // /mine attempt id nahi deta — code result page par issue ke baad hi dikhega
        void mine;
      })
      .catch(() => {});
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

  const { scores, results, writing, speaking } = data;
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;

  const bands = {
    listening: scores?.listening?.band, reading: scores?.reading?.band,
    writing: writing?.band, speaking: speaking?.band,
  };
  const overall = overallFrom([bands.listening, bands.reading, bands.writing, bands.speaking]);
  const isFull = data.test.kind === 'full';
  const missing = [];
  if (isFull) {
    if (!writing || writing.status === 'not-started') missing.push('Writing');
    if (!speaking || speaking.status === 'not-started') missing.push('Speaking');
  }

  // Weak areas — group-wise accuracy (Listening sections / Reading passages)
  const byGroup = {};
  for (const r of results) {
    const g = r.group || r.section;
    byGroup[g] = byGroup[g] || { total: 0, correct: 0 };
    byGroup[g].total += 1;
    if (r.correct) byGroup[g].correct += 1;
  }
  const weak = Object.entries(byGroup)
    .map(([g, v]) => ({ g, pct: Math.round((v.correct / v.total) * 100), ...v }))
    .sort((a, b) => a.pct - b.pct);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-1">{data.test.title}</h1>
      <p className="text-gray-600 mb-8">
        {total > 0 ? `Listening & Reading: ${correct}/${total} correct` : 'Your results'}
        {overall && <> · Overall band <b className="text-navy">{overall}</b></>}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {scores?.listening && (
          <div className="card text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">🎧 Listening</p>
            <p className="text-5xl font-extrabold text-navy my-2">{scores.listening.band}</p>
            <p className="text-sm text-gray-600">{scores.listening.raw}/40 correct</p>
          </div>
        )}
        {scores?.reading && (
          <div className="card text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">📖 Reading</p>
            <p className="text-5xl font-extrabold text-navy my-2">{scores.reading.band}</p>
            <p className="text-sm text-gray-600">{scores.reading.raw}/40 correct</p>
          </div>
        )}
        {(writing || isFull) && (
          <div className="card text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">✍️ Writing</p>
            <p className="text-5xl font-extrabold text-navy my-2">{writing?.band || '—'}</p>
            <p className="text-sm text-gray-600">
              {!writing || writing.status === 'not-started' ? 'Not completed yet' : writing.status === 'feedback-pending' ? 'Feedback on its way' : 'AI feedback below'}
            </p>
          </div>
        )}
        {(speaking || isFull) && (
          <div className="card text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">🎤 Speaking</p>
            <p className="text-5xl font-extrabold text-navy my-2">{speaking?.band || '—'}</p>
            <p className="text-sm text-gray-600">
              {!speaking || speaking.status === 'not-started' ? 'Not completed yet' : speaking.status === 'feedback-pending' ? 'Feedback on its way' : 'AI feedback below'}
            </p>
          </div>
        )}
      </div>

      {missing.length > 0 && (
        <div className="rounded-xl bg-gold/15 border border-gold px-5 py-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm">
            <b>Your full mock is not complete yet.</b> Finish {missing.join(' and ')} to complete all four skills before your certificate.
          </p>
          <a href={`/mock/${slug}`} className="btn-primary btn-sm shrink-0">Complete now</a>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-10">
        {!certCode ? (
          <Button size="sm" disabled={certBusy} onClick={getCertificate}>
            {certBusy ? 'Issuing…' : 'Get my certificate'}
          </Button>
        ) : (
          <>
            <a href={`/certificate/${certCode}`} className="btn-primary btn-sm">View certificate</a>
            <a className="btn-secondary btn-sm"
              href={`${API_BASE}/api/v1/certificates/${certCode}/pdf`}>
              Download PDF
            </a>
            <a href={`/verify-certificate?code=${certCode}`} className="btn-ghost btn-sm">Verify page</a>
          </>
        )}
        <a href="/mock" className="btn-ghost btn-sm">Try another test</a>
        <a href="/course" className="btn-ghost btn-sm">Practice weak topics</a>
      </div>

      {weak.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-extrabold mb-4">Where you stand</h2>
          <div className="space-y-3">
            {weak.map((w) => (
              <div key={w.g}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{w.g}</span>
                  <span className={w.pct < 60 ? 'text-red-600 font-semibold' : 'text-gray-600'}>{w.correct}/{w.total} · {w.pct}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full ${w.pct < 60 ? 'bg-red-400' : w.pct < 80 ? 'bg-gold' : 'bg-green-500'}`} style={{ width: `${w.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Your weakest area is <b>{weak[0]?.g}</b>. The <a href="/course" className="text-navy font-semibold hover:underline">topic course</a> is the fastest way to fix it.
          </p>
        </div>
      )}

      {writing && writing.status !== 'not-started' && (
        <div className="card mb-8">
          <h2 className="text-xl font-extrabold mb-4">Writing feedback {writing.band && <span className="text-gold-dark">· Band {writing.band}</span>}</h2>
          <div className="space-y-5">
            {(writing.tasks || []).map((t) => (
              <div key={t.taskType}>
                <h3 className="font-bold mb-2">{t.taskType === 'task1' ? 'Task 1' : 'Task 2'}</h3>
                <Feedback fb={t.feedback} />
                <details className="mt-2">
                  <summary className="text-sm text-navy font-semibold cursor-pointer">Read your essay</summary>
                  <p className="text-sm text-gray-700 whitespace-pre-line mt-2 bg-paper rounded-lg p-3">{t.text}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      {speaking && speaking.status !== 'not-started' && (
        <div className="card mb-8">
          <h2 className="text-xl font-extrabold mb-4">Speaking feedback {speaking.band && <span className="text-gold-dark">· Band {speaking.band}</span>}</h2>
          <Feedback fb={speaking.feedback} />
          <div className="space-y-4 mt-4">
            {(speaking.parts || []).map((p) => (
              <div key={p.part} className="rounded-xl bg-paper p-4">
                <p className="font-bold text-sm mb-2">Part {p.part}</p>
                {p.recordingId && (
                  <audio controls crossOrigin="use-credentials" className="w-full mb-2"
                    src={`${API_BASE}/api/v1/speaking/recording/${p.recordingId}`} />
                )}
                {p.transcript && <p className="text-sm text-gray-700 whitespace-pre-line">{p.transcript}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.listeningTranscript && (
        <div className="card mb-8">
          <button className="font-extrabold text-lg" onClick={() => setShowTranscript(!showTranscript)}>
            {showTranscript ? '▾' : '▸'} Listening transcript
          </button>
          {showTranscript && (
            <pre className="whitespace-pre-wrap text-sm text-gray-700 mt-3 font-sans">{data.listeningTranscript}</pre>
          )}
        </div>
      )}

      {results.length > 0 && (
        <>
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
        </>
      )}
    </div>
  );
}
