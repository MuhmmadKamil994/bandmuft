'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import SpeakingRecorder from '@/components/SpeakingRecorder';

const FIXED = { tfng: ['True', 'False', 'Not Given'], ynng: ['Yes', 'No', 'Not Given'] };

function fmt(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function words(t) { return (t || '').trim() ? (t || '').trim().split(/\s+/).length : 0; }

function QuestionInput({ q, value, onChange, disabled }) {
  const opts = q.options?.length ? q.options : FIXED[q.type];
  if (opts) {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {opts.map((o) => (
          <label key={o}
            className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${disabled ? 'opacity-70' : 'cursor-pointer'} ${value === o ? 'border-navy bg-navy text-white' : 'border-gray-200 hover:border-navy'}`}>
            <input type="radio" name={q.qid} className="hidden" disabled={disabled}
              checked={value === o} onChange={() => onChange(q.qid, o)} />
            {o}
          </label>
        ))}
      </div>
    );
  }
  return (
    <input className="input mt-2 max-w-md" placeholder="Type your answer" disabled={disabled}
      value={value || ''} onChange={(e) => onChange(q.qid, e.target.value)} />
  );
}

function FeedbackBox({ fb, pendingText }) {
  if (!fb) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        {pendingText || 'Your AI feedback is being prepared. Refresh this page in a minute — it will appear here automatically.'}
      </div>
    );
  }
  const rows = [
    ['Task Response', fb.taskResponse], ['Fluency & Coherence', fb.fluency],
    ['Coherence & Cohesion', fb.coherence], ['Lexical Resource', fb.lexical],
    ['Grammatical Range & Accuracy', fb.grammar],
  ].filter(([, v]) => typeof v === 'number');
  return (
    <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3">
      <p className="font-bold text-navy">AI Band: <span className="text-2xl">{Number(fb.overall).toFixed(1)}</span></p>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
        {rows.map(([k, v]) => (
          <p key={k} className="flex justify-between border-b border-green-100 py-1"><span>{k}</span><b>{Number(v).toFixed(1)}</b></p>
        ))}
      </div>
      {fb.comments && <p className="text-sm text-gray-700 mt-2">{fb.comments}</p>}
    </div>
  );
}

export default function TakeTest({ params }) {
  const router = useRouter();
  const { slug } = params;
  const [test, setTest] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [attemptState, setAttemptState] = useState(null);
  const [answers, setAnswers] = useState({});
  const [essays, setEssays] = useState({});
  const [section, setSection] = useState(null);
  const [secsLeft, setSecsLeft] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [writingBusy, setWritingBusy] = useState(false);
  const [writingState, setWritingState] = useState(null);
  const [speakingBusy, setSpeakingBusy] = useState(false);
  const [speakingState, setSpeakingState] = useState(null);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const audioRef = useRef(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        await api.get('/auth/me');
      } catch { router.push('/login'); return; }
      try {
        const d = await api.post(`/tests/${slug}/start`);
        setTest(d.test); setAttemptId(d.attemptId); setAttemptState(d.attemptState);
        setSection(d.test.sections[0]?.key || 'listening');
        if (d.attemptState?.status !== 'submitted') setSecsLeft(d.test.durationMin * 60);
        const savedA = localStorage.getItem(`bm-answers-${d.attemptId}`);
        const savedE = localStorage.getItem(`bm-essays-${d.attemptId}`);
        setAnswers(d.attemptState?.answers && Object.keys(d.attemptState.answers).length
          ? d.attemptState.answers : savedA ? JSON.parse(savedA) : {});
        if (savedE) setEssays(JSON.parse(savedE));
        if (d.attemptState?.writing) setWritingState(d.attemptState.writing);
        if (d.attemptState?.speaking) setSpeakingState(d.attemptState.speaking);
      } catch (err) { setError(err.message); }
    })();
  }, [slug, router]);

  const lrLocked = attemptState?.status === 'submitted';

  function setAnswer(qid, val) {
    if (lrLocked) return;
    setAnswers((prev) => {
      const next = { ...prev, [qid]: val };
      if (attemptId) localStorage.setItem(`bm-answers-${attemptId}`, JSON.stringify(next));
      return next;
    });
  }
  function setEssay(taskType, val) {
    setEssays((prev) => {
      const next = { ...prev, [taskType]: val };
      if (attemptId) localStorage.setItem(`bm-essays-${attemptId}`, JSON.stringify(next));
      return next;
    });
  }

  async function submitLR() {
    if (submittedRef.current || submitting || lrLocked) return;
    submittedRef.current = true; setSubmitting(true);
    try {
      await api.post(`/tests/attempts/${attemptId}/submit`, { answers });
      localStorage.removeItem(`bm-answers-${attemptId}`);
      router.push(`/mock/${slug}/result/${attemptId}`);
    } catch (err) {
      setError(err.message); setSubmitting(false); submittedRef.current = false;
    }
  }

  async function submitWriting() {
    setWritingBusy(true); setError('');
    try {
      const tasks = wsec.writing.map((w) => ({ taskType: w.taskType, text: essays[w.taskType] || '' }));
      const d = await api.post(`/tests/attempts/${attemptId}/writing`, { tasks });
      setWritingState(d.writing);
      localStorage.removeItem(`bm-essays-${attemptId}`);
      if (test.kind === 'writing') router.push(`/mock/${slug}/result/${attemptId}`);
    } catch (err) { setError(err.message); }
    setWritingBusy(false);
  }

  async function submitSpeaking(parts) {
    setSpeakingBusy(true); setError('');
    try {
      const d = await api.post(`/speaking/attempt/${attemptId}`, { parts });
      setSpeakingState(d.speaking);
      if (test.kind === 'speaking') router.push(`/mock/${slug}/result/${attemptId}`);
    } catch (err) { setError(err.message); }
    setSpeakingBusy(false);
  }

  // Timer — zero par auto-submit (sirf L/R wale hisse ke liye)
  useEffect(() => {
    if (secsLeft === null || !attemptId || lrLocked) return;
    if (secsLeft === 0) { submitLR(); return; }
    const t = setTimeout(() => setSecsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secsLeft, attemptId, lrLocked]);

  function playAudio(url) {
    if (audioPlayed || !audioRef.current) return;
    audioRef.current.src = url;
    audioRef.current.play();
  }

  if (error && !test) return <p className="text-center py-16 text-red-600 font-semibold">{error}</p>;
  if (!test) return <p className="text-center py-16">Loading test…</p>;

  const secData = test.sections.find((s) => s.key === section) || test.sections[0];
  const qs = test.questions.filter((q) => q.section === section);
  const groups = [...new Set(qs.map((q) => q.group || ''))];
  const answered = Object.keys(answers).filter((k) => answers[k]).length;
  const wsec = test.sections.find((s) => s.key === 'writing');
  const ssec = test.sections.find((s) => s.key === 'speaking');
  const writingDone = writingState && writingState.status !== 'not-started';
  const speakingDone = speakingState && speakingState.status !== 'not-started';
  const hasLR = test.questions.length > 0;

  const speakingPrompts = ssec ? [
    { part: 1, title: `Part 1 — ${ssec.speaking.part1.topic}`, lines: ssec.speaking.part1.questions, note: 'Answer each question in 2–3 sentences.' },
    { part: 2, title: 'Part 2 — Cue card', cue: ssec.speaking.part2, note: 'Speak for 1–2 minutes.' },
    { part: 3, title: `Part 3 — ${ssec.speaking.part3.topic}`, lines: ssec.speaking.part3.questions, note: 'Give longer, thoughtful answers.' },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur py-3 flex items-center justify-between border-b mb-6">
        <div>
          <h1 className="font-extrabold">{test.title}</h1>
          <p className="text-sm text-gray-600">
            {hasLR && !lrLocked ? `${answered}/${test.questions.length} answered` : lrLocked ? 'Listening & Reading submitted' : ''}
            {lrLocked && (writingDone || speakingDone) ? ' · ' : ''}
            {writingDone ? 'Writing done ' : ''}{speakingDone ? '· Speaking done' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {secsLeft !== null && !lrLocked && (
            <span className={`font-mono font-bold text-xl ${secsLeft < 300 ? 'text-red-600' : 'text-navy'}`}>
              {fmt(secsLeft)}
            </span>
          )}
          {hasLR && !lrLocked && (
            <Button size="sm" disabled={submitting} onClick={() => { if (confirm('Submit Listening & Reading now? Writing and Speaking can still be completed afterwards.')) submitLR(); }}>
              {submitting ? 'Submitting…' : 'Submit L & R'}
            </Button>
          )}
          {lrLocked && (
            <a href={`/mock/${slug}/result/${attemptId}`} className="btn-primary btn-sm">See results</a>
          )}
        </div>
      </div>

      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}
      {lrLocked && test.kind === 'full' && (!writingDone || !speakingDone) && (
        <div className="rounded-xl bg-gold/15 border border-gold px-4 py-3 text-sm mb-6">
          Your Listening &amp; Reading are submitted. Complete the remaining section(s) below to finish your full mock and unlock your certificate.
        </div>
      )}

      {/* Section tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {test.sections.map((s) => (
          <button key={s.key}
            onClick={() => setSection(s.key)}
            className={`btn-sm rounded-lg px-5 py-2 font-semibold ${section === s.key ? 'bg-navy text-white' : 'bg-white border text-navy'}`}>
            {s.title}
            {s.key === 'writing' && writingDone ? ' ✓' : ''}
            {s.key === 'speaking' && speakingDone ? ' ✓' : ''}
            {(s.key === 'listening' || s.key === 'reading') && lrLocked ? ' ✓' : ''}
          </button>
        ))}
      </div>

      {/* LISTENING / READING */}
      {(section === 'listening' || section === 'reading') && (
        <>
          {section === 'listening' && secData.audioUrl && (
            <div className="card mb-6 flex items-center gap-4">
              <audio ref={audioRef} onEnded={() => setAudioPlayed(true)} className="hidden" />
              <Button size="sm" disabled={audioPlayed || lrLocked} onClick={() => playAudio(secData.audioUrl)}>
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
          {section === 'reading' && secData.passages?.map((p, i) => (
            <div key={i} className="card mb-6">
              <h3 className="font-bold mb-2">{p.title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-line">{p.text}</p>
            </div>
          ))}
          {groups.map((g) => (
            <div key={g} className="mb-8">
              {g && <h3 className="font-bold text-navy mb-3">{g}</h3>}
              <div className="space-y-4">
                {qs.filter((q) => (q.group || '') === g).map((q) => (
                  <div key={q.qid} className="card">
                    <p className="font-semibold">
                      <span className="text-gold-dark font-extrabold mr-2">{q.qid}</span>{q.prompt}
                    </p>
                    <QuestionInput q={q} value={answers[q.qid]} onChange={setAnswer} disabled={lrLocked} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* WRITING */}
      {section === 'writing' && wsec && (
        <div className="space-y-6">
          {wsec.writing.map((w) => (
            <div key={w.taskType} className="card">
              <h3 className="font-bold text-lg mb-2">{w.title}</h3>
              <p className="text-[15px] text-gray-800 whitespace-pre-line mb-4">{w.text}</p>
              <textarea className="input min-h-56" rows={10} disabled={!!writingDone}
                placeholder="Write your answer here…"
                value={writingDone
                  ? (writingState.tasks?.find((t) => t.taskType === w.taskType)?.text || '')
                  : essays[w.taskType] || ''}
                onChange={(e) => setEssay(w.taskType, e.target.value)} />
              <p className="text-xs text-gray-500 mt-1">
                {writingDone
                  ? `${writingState.tasks?.find((t) => t.taskType === w.taskType)?.wordCount || 0} words`
                  : `${words(essays[w.taskType])} words · minimum 20 words to submit`}
              </p>
            </div>
          ))}
          {writingDone ? (
            <FeedbackBox fb={writingState.tasks?.find((t) => t.feedback)?.feedback && writingState.band
              ? { overall: parseFloat(writingState.band), comments: 'Band shown is the average of your two tasks. Open each task above after refreshing if feedback was pending.', ...Object.fromEntries(writingState.tasks.filter((t) => t.feedback).flatMap((t) => [])) }
              : null}
              pendingText="Your essays were submitted. AI feedback is being prepared — refresh in a minute and it will appear on your results page." />
          ) : (
            <div className="flex justify-end">
              <Button disabled={writingBusy || wsec.writing.some((w) => words(essays[w.taskType]) < 20)}
                onClick={() => { if (confirm('Submit both writing tasks for AI feedback? You cannot edit them afterwards.')) submitWriting(); }}>
                {writingBusy ? 'Grading…' : 'Submit writing for AI feedback'}
              </Button>
            </div>
          )}
          {writingDone && writingState.tasks?.map((t) => t.feedback && (
            <div key={t.taskType} className="card">
              <h4 className="font-bold mb-2">{t.taskType === 'task1' ? 'Task 1' : 'Task 2'} feedback</h4>
              <FeedbackBox fb={t.feedback} />
            </div>
          ))}
        </div>
      )}

      {/* SPEAKING */}
      {section === 'speaking' && ssec && (
        <div>
          {speakingDone ? (
            <div className="space-y-4">
              <FeedbackBox fb={speakingState.feedback || null}
                pendingText="Your speaking was submitted. AI feedback is being prepared — refresh in a minute and it will appear on your results page." />
              {speakingState.band && <p className="font-bold text-navy">Speaking band: {speakingState.band}</p>}
            </div>
          ) : (
            <SpeakingRecorder prompts={speakingPrompts} busy={speakingBusy} done={false} onSubmit={submitSpeaking} />
          )}
        </div>
      )}
    </div>
  );
}
