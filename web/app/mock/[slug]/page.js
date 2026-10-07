'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

const FIXED = { tfng: ['True', 'False', 'Not Given'], ynng: ['Yes', 'No', 'Not Given'] };

function fmt(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function QuestionInput({ q, value, onChange }) {
  const opts = q.options?.length ? q.options : FIXED[q.type];
  if (opts) {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {opts.map((o) => (
          <label key={o}
            className={`cursor-pointer rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${value === o ? 'border-navy bg-navy text-white' : 'border-gray-200 hover:border-navy'}`}>
            <input type="radio" name={q.qid} className="hidden"
              checked={value === o} onChange={() => onChange(q.qid, o)} />
            {o}
          </label>
        ))}
      </div>
    );
  }
  return (
    <input className="input mt-2 max-w-md" placeholder="Type your answer"
      value={value || ''} onChange={(e) => onChange(q.qid, e.target.value)} />
  );
}

export default function TakeTest({ params }) {
  const router = useRouter();
  const { slug } = params;
  const [test, setTest] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [section, setSection] = useState('listening');
  const [secsLeft, setSecsLeft] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const audioRef = useRef(null);
  const submittedRef = useRef(false);

  // Start attempt
  useEffect(() => {
    (async () => {
      try {
        await api.get('/auth/me');
      } catch { router.push(`/login`); return; }
      try {
        const d = await api.post(`/tests/${slug}/start`);
        setTest(d.test); setAttemptId(d.attemptId);
        setSecsLeft(d.test.durationMin * 60);
        const saved = localStorage.getItem(`bm-answers-${d.attemptId}`);
        if (saved) setAnswers(JSON.parse(saved));
      } catch (err) { setError(err.message); }
    })();
  }, [slug, router]);

  function setAnswer(qid, val) {
    setAnswers((prev) => {
      const next = { ...prev, [qid]: val };
      if (attemptId) localStorage.setItem(`bm-answers-${attemptId}`, JSON.stringify(next));
      return next;
    });
  }

  async function submit() {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true; setSubmitting(true);
    try {
      await api.post(`/tests/attempts/${attemptId}/submit`, { answers });
      localStorage.removeItem(`bm-answers-${attemptId}`);
      router.push(`/mock/${slug}/result/${attemptId}`);
    } catch (err) {
      setError(err.message); setSubmitting(false); submittedRef.current = false;
    }
  }

  // Timer — zero par auto-submit
  useEffect(() => {
    if (secsLeft === null || secsLeft <= 0 || !attemptId) return;
    if (secsLeft === 0) { submit(); return; }
    const t = setTimeout(() => setSecsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secsLeft, attemptId]);

  function playAudio(url) {
    if (audioPlayed || !audioRef.current) return;
    audioRef.current.src = url;
    audioRef.current.play();
  }

  if (error) return <p className="text-center py-16 text-red-600 font-semibold">{error}</p>;
  if (!test) return <p className="text-center py-16">Loading test…</p>;

  const secData = test.sections.find((s) => s.key === section);
  const qs = test.questions.filter((q) => q.section === section);
  const groups = [...new Set(qs.map((q) => q.group || ''))];
  const answered = Object.keys(answers).filter((k) => answers[k]).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur py-3 flex items-center justify-between border-b mb-6">
        <div>
          <h1 className="font-extrabold">{test.title}</h1>
          <p className="text-sm text-gray-600">{answered}/{test.questions.length} answered</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-mono font-bold text-xl ${secsLeft < 300 ? 'text-red-600' : 'text-navy'}`}>
            {fmt(secsLeft ?? 0)}
          </span>
          <Button size="sm" disabled={submitting} onClick={() => { if (confirm('Submit the test now?')) submit(); }}>
            {submitting ? 'Submitting…' : 'Submit'}
          </Button>
        </div>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 mb-6">
        {test.sections.map((s) => (
          <button key={s.key}
            onClick={() => setSection(s.key)}
            className={`btn-sm rounded-lg px-5 py-2 font-semibold ${section === s.key ? 'bg-navy text-white' : 'bg-white border text-navy'}`}>
            {s.title}
          </button>
        ))}
      </div>

      {/* Listening audio — SIRF AIK DAFA, no rewind (real IELTS rule) */}
      {section === 'listening' && secData.audioUrl && (
        <div className="card mb-6 flex items-center gap-4">
          <audio ref={audioRef} onEnded={() => setAudioPlayed(true)} className="hidden" />
          <Button size="sm" disabled={audioPlayed} onClick={() => playAudio(secData.audioUrl)}>
            {audioPlayed ? 'Audio finished' : '▶ Play audio (once only)'}
          </Button>
          <p className="text-sm text-gray-600">Like the real test: the recording plays one time only.</p>
        </div>
      )}
      {section === 'listening' && !secData.audioUrl && (
        <div className="card mb-6">
          <p className="text-sm text-gray-600">Audio for this test is being prepared and will appear here soon. You can still attempt the questions below.</p>
        </div>
      )}

      {/* Reading passages */}
      {section === 'reading' && secData.passages?.map((p, i) => (
        <div key={i} className="card mb-6">
          <h3 className="font-bold mb-2">{p.title}</h3>
          <p className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-line">{p.text}</p>
        </div>
      ))}

      {/* Questions */}
      {groups.map((g) => (
        <div key={g} className="mb-8">
          {g && <h3 className="font-bold text-navy mb-3">{g}</h3>}
          <div className="space-y-4">
            {qs.filter((q) => (q.group || '') === g).map((q) => (
              <div key={q.qid} className="card">
                <p className="font-semibold">
                  <span className="text-gold-dark font-extrabold mr-2">{q.qid}</span>{q.prompt}
                </p>
                <QuestionInput q={q} value={answers[q.qid]} onChange={setAnswer} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
