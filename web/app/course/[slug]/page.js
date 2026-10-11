'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import SpeakingRecorder from '@/components/SpeakingRecorder';

const STEP_NAMES = ['Vocabulary', 'Key Ideas', 'Reading', 'Listening', 'Writing', 'Speaking', 'Subject Test'];
const FIXED = { tfng: ['True', 'False', 'Not Given'], ynng: ['Yes', 'No', 'Not Given'] };

function speakWord(text) {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch { /* no TTS on this device */ }
}

// Generic quiz — options hon to chips, warna tfng/ynng fixed, warna text input.
// Submit par server grading + review (sahi jawab + wajah) wapas ata hai.
function QuizRunner({ slug, kind, questions, passText, onPassed }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setBusy(true); setError('');
    try {
      const ordered = questions.map((_, i) => answers[i] || '');
      const d = await api.post('/course/quiz', { subject: slug, kind, answers: ordered });
      setResult(d);
      if (d.passed && onPassed) onPassed(d);
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <div>
      <div className="space-y-4">
        {questions.map((q, i) => {
          const opts = q.options?.length ? q.options : FIXED[q.type];
          const review = result?.review?.[i];
          return (
            <div key={i} className={`card !p-4 ${review ? (review.correct ? '!border-green-300' : '!border-red-300') : ''}`}>
              <p className="font-semibold text-[15px]">
                <span className="text-gold-dark font-extrabold mr-2">{i + 1}</span>{q.q}
              </p>
              {opts ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {opts.map((o) => (
                    <button key={o} disabled={!!result}
                      onClick={() => setAnswers({ ...answers, [i]: o })}
                      className={`rounded-lg border-2 px-3.5 py-1.5 text-sm font-medium transition-colors ${answers[i] === o ? 'border-navy bg-navy text-white' : 'border-gray-200 hover:border-navy'} ${result ? 'opacity-80' : ''}`}>
                      {o}
                    </button>
                  ))}
                </div>
              ) : (
                <input className="input mt-2 max-w-md" disabled={!!result} placeholder="Type your answer"
                  value={answers[i] || ''} onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })} />
              )}
              {review && (
                <div className="text-sm mt-3">
                  {review.correct
                    ? <p className="text-green-700 font-semibold">✓ Correct</p>
                    : <p className="text-red-600">✗ Your answer: <b>{review.given || '—'}</b> · Correct: <b className="text-green-700">{review.answer}</b></p>}
                  {review.why && <p className="text-gray-600 mt-1">{review.why}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="text-red-600 font-semibold mt-4">{error}</p>}
      {result ? (
        <div className={`rounded-xl px-4 py-3 mt-5 text-sm font-semibold ${result.passed ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
          You scored {result.score}/{result.total}. {result.passed ? `Step complete ✓ — ${passText || ''}` : 'Not passed yet — review the answers above and try again.'}
          {!result.passed && (
            <button className="btn-secondary btn-sm ml-3" onClick={() => { setResult(null); setAnswers({}); }}>Try again</button>
          )}
        </div>
      ) : (
        <div className="flex justify-end mt-5">
          <Button disabled={busy} onClick={submit}>{busy ? 'Checking…' : 'Check my answers'}</Button>
        </div>
      )}
      {result?.script && (
        <details className="card mt-5">
          <summary className="font-bold cursor-pointer">Listening transcript</summary>
          <pre className="whitespace-pre-wrap text-sm text-gray-700 mt-3 font-sans">{result.script}</pre>
        </details>
      )}
    </div>
  );
}

function FeedbackSummary({ fb, band }) {
  if (!fb) {
    return (
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
        Your work was submitted, but the AI feedback could not be generated just now. Please try again in a few minutes — your step will complete when the feedback arrives.
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
      <p className="font-bold text-navy">AI Band: <span className="text-2xl">{(band || fb.overall)}</span></p>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm">
        {rows.map(([k, v]) => (
          <p key={k} className="flex justify-between border-b border-green-100 py-1"><span>{k}</span><b>{Number(v).toFixed(1)}</b></p>
        ))}
      </div>
      {fb.comments && <p className="text-sm text-gray-700 mt-2">{fb.comments}</p>}
    </div>
  );
}

export default function SubjectPage({ params }) {
  const router = useRouter();
  const slug = params.slug;
  const [subject, setSubject] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [stepsDone, setStepsDone] = useState([]);
  const [stepResults, setStepResults] = useState({});
  const [needLogin, setNeedLogin] = useState(false);
  const [wordFilter, setWordFilter] = useState('');
  const [ownSentence, setOwnSentence] = useState('');
  const [essay, setEssay] = useState({ task1: '', task2: '' });
  const [writingFb, setWritingFb] = useState({});
  const [writingBusy, setWritingBusy] = useState('');
  const [speakBusy, setSpeakBusy] = useState(false);
  const [speakResult, setSpeakResult] = useState(null);
  const [markingIdeas, setMarkingIdeas] = useState(false);

  useEffect(() => {
    api.get(`/course/subjects/${slug}`).then((d) => setSubject(d.subject)).catch((e) => setError(e.message));
    api.get('/course/progress')
      .then((d) => {
        const p = d.progress?.[slug];
        if (p) { setStepsDone(p.stepsDone || []); setStepResults(p.stepResults || {}); }
      })
      .catch(() => setNeedLogin(true));
  }, [slug]);

  const flatReading = useMemo(
    () => (subject?.steps.reading.passages || []).flatMap((p) => p.questions),
    [subject]
  );

  function markDone(n, extra) {
    setStepsDone((prev) => [...new Set([...prev, n])]);
    if (extra) setStepResults((prev) => ({ ...prev, [n]: extra }));
  }

  async function markIdeas() {
    setMarkingIdeas(true);
    try {
      const d = await api.post('/course/step', { subject: slug, step: 2 });
      setStepsDone(d.stepsDone);
    } catch (err) {
      if (String(err.message).match(/login/i)) router.push('/login');
      else setError(err.message);
    }
    setMarkingIdeas(false);
  }

  async function submitWriting(taskType) {
    setWritingBusy(taskType); setError('');
    try {
      const d = await api.post('/course/writing', { subject: slug, taskType, text: essay[taskType] });
      setWritingFb((prev) => ({ ...prev, [taskType]: d }));
      if (d.status === 'feedback-ready') markDone(5, { band: d.feedback?.overall?.toFixed(1) });
    } catch (err) {
      if (String(err.message).match(/login/i)) router.push('/login');
      else setError(err.message);
    }
    setWritingBusy('');
  }

  async function submitSpeaking(parts) {
    setSpeakBusy(true); setError('');
    try {
      const d = await api.post(`/speaking/course/${slug}`, { parts });
      setSpeakResult(d);
      if (d.status === 'feedback-ready') markDone(6, { band: d.band });
    } catch (err) {
      if (String(err.message).match(/login/i)) router.push('/login');
      else setError(err.message);
    }
    setSpeakBusy(false);
  }

  if (error && !subject) return <p className="text-center py-16 text-red-600 font-semibold">{error}</p>;
  if (!subject) return <p className="text-center py-16">Loading topic…</p>;

  const st = subject.steps;
  const doneCount = stepsDone.length;
  const speakingPrompts = [
    { part: 1, title: `Part 1 — ${st.speaking.part1.topic || subject.name}`, lines: st.speaking.part1.questions, note: 'Answer each question in 2–3 sentences.' },
    { part: 2, title: 'Part 2 — Cue card', cue: st.speaking.part2, note: 'Speak for 1–2 minutes.' },
    { part: 3, title: `Part 3 — ${st.speaking.part3.topic || subject.name}`, lines: st.speaking.part3.questions, note: 'Give longer, thoughtful answers.' },
  ];
  const wordsShown = st.vocab.words.filter(
    (w) => !wordFilter || w.w.toLowerCase().includes(wordFilter.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <a href="/course" className="text-sm text-navy font-semibold hover:underline">← All topics</a>
      <div className="flex flex-wrap items-end justify-between gap-3 mt-2 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">{subject.name}</h1>
          <p className="text-gray-600">{subject.tagline}</p>
        </div>
        <span className={`text-sm font-bold rounded-full px-3 py-1.5 ${doneCount === 7 ? 'bg-green-100 text-green-700' : 'bg-gold/20 text-gold-dark'}`}>
          {doneCount}/7 steps complete
        </span>
      </div>

      {needLogin && (
        <div className="rounded-xl bg-gold/15 border border-gold px-4 py-3 text-sm mb-6">
          You are browsing as a guest. <a href="/login" className="font-bold text-navy hover:underline">Login</a> or{' '}
          <a href="/register" className="font-bold text-navy hover:underline">register free</a> so your progress is saved and your Writing &amp; Speaking can be graded.
        </div>
      )}
      {error && <p className="text-red-600 font-semibold mb-4">{error}</p>}

      {/* Stepper */}
      <div className="flex gap-1.5 mb-8 flex-wrap">
        {STEP_NAMES.map((name, i) => {
          const n = i + 1;
          const done = stepsDone.includes(n);
          return (
            <button key={n} onClick={() => setStep(n)}
              className={`rounded-lg px-3 py-2 text-[13px] font-semibold border-2 transition-colors ${
                step === n ? 'border-navy bg-navy text-white' : done ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-navy'}`}>
              {n}. {name}{done ? ' ✓' : ''}
            </button>
          );
        })}
      </div>

      {/* STEP 1 — VOCABULARY */}
      {step === 1 && (
        <div>
          <div className="card mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h2 className="font-bold text-lg">{st.vocab.words.length} words for {subject.name}</h2>
              <input className="input !w-auto" placeholder="Search a word…"
                value={wordFilter} onChange={(e) => setWordFilter(e.target.value)} />
            </div>
            <p className="text-sm text-gray-600 mb-4">Tap 🔊 to hear the word. The meaning is given in Urdu to help you learn faster.</p>
            <div className="divide-y">
              {wordsShown.map((w) => (
                <div key={w.w} className="py-3 flex gap-3">
                  <button onClick={() => speakWord(w.w)} title="Listen"
                    className="shrink-0 w-9 h-9 rounded-full bg-navy text-white text-sm hover:bg-navy-light">🔊</button>
                  <div>
                    <p className="font-bold">{w.w} <span className="font-medium text-gray-500">— {w.m}</span></p>
                    <p className="text-sm text-gray-600 italic">{w.ex}</p>
                  </div>
                </div>
              ))}
              {wordsShown.length === 0 && <p className="text-sm text-gray-500 py-4">No word matches your search.</p>}
            </div>
            <div className="mt-5">
              <label className="label">Your turn — write one sentence using any word from this list</label>
              <textarea className="input" rows={2} value={ownSentence} onChange={(e) => setOwnSentence(e.target.value)}
                placeholder="e.g. Education should be compulsory for every child." />
            </div>
          </div>
          <h3 className="font-bold mb-3">Quick check — score 4/5 to complete this step</h3>
          <QuizRunner slug={slug} kind="vocab" questions={st.vocab.quiz}
            passText="Vocabulary step complete." onPassed={() => markDone(1)} />
        </div>
      )}

      {/* STEP 2 — KEY IDEAS */}
      {step === 2 && (
        <div>
          <p className="text-gray-600 mb-5">
            These debate topics appear again and again in IELTS Writing Task 2 and Speaking Part 3.
            Learn the points on both sides — then you will never run out of ideas in the exam.
          </p>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {st.ideas.topics.map((t, i) => (
              <div key={i} className="card !p-5">
                <h3 className="font-bold mb-3">{t.t}</h3>
                <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-1.5">Arguments for</p>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
                  {t.for.map((x, j) => <li key={j}>{x}</li>)}
                </ul>
                <p className="text-xs font-bold uppercase tracking-wide text-red-600 mb-1.5">Arguments against</p>
                <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
                  {t.against.map((x, j) => <li key={j}>{x}</li>)}
                </ul>
              </div>
            ))}
          </div>
          {stepsDone.includes(2) ? (
            <p className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-semibold text-green-800">Step complete ✓</p>
          ) : (
            <div className="flex justify-end">
              <Button disabled={markingIdeas} onClick={markIdeas}>
                {markingIdeas ? 'Saving…' : 'I have studied these ideas — mark step complete'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3 — READING */}
      {step === 3 && (
        <div>
          {st.reading.passages.map((p, i) => (
            <div key={i} className="card mb-5">
              <h3 className="font-bold mb-2">{p.title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-800 whitespace-pre-line">{p.text}</p>
            </div>
          ))}
          <p className="text-sm text-gray-600 mb-4">Answer all questions below. Score 60% or more to complete this step. In the real test you would have about 20 minutes for a passage like this.</p>
          <QuizRunner slug={slug} kind="reading" questions={flatReading}
            passText="Reading step complete." onPassed={(d) => markDone(3, { score: `${d.score}/${d.total}` })} />
        </div>
      )}

      {/* STEP 4 — LISTENING */}
      {step === 4 && (
        <div>
          <div className="card mb-5">
            <h3 className="font-bold mb-2">{st.listening.title}</h3>
            <p className="text-sm text-gray-600 mb-3">
              This is a learning step, so you may replay the recording. In a mock test it plays only once.
            </p>
            <audio controls className="w-full"
              src={st.listening.audioUrl} />
          </div>
          <QuizRunner slug={slug} kind="listening" questions={st.listening.questions}
            passText="Listening step complete. The transcript is now unlocked above." onPassed={(d) => markDone(4, { score: `${d.score}/${d.total}` })} />
        </div>
      )}

      {/* STEP 5 — WRITING */}
      {step === 5 && (
        <div className="space-y-8">
          {['task1', 'task2'].map((tt) => {
            const task = st.writing[tt];
            const min = tt === 'task1' ? 150 : 250;
            const count = essay[tt].trim() ? essay[tt].trim().split(/\s+/).length : 0;
            return (
              <div key={tt} className="card">
                <h3 className="font-bold text-lg mb-2">{task.title}</h3>
                <p className="text-[15px] text-gray-800 whitespace-pre-line mb-4">{task.text}</p>
                <details className="mb-4">
                  <summary className="text-sm font-semibold text-navy cursor-pointer">Read a Band 8 sample answer</summary>
                  <p className="text-sm text-gray-700 whitespace-pre-line mt-2 bg-paper rounded-lg p-3">{task.sample}</p>
                </details>
                <textarea className="input min-h-52" rows={9}
                  placeholder={`Write at least ${min} words…`}
                  value={essay[tt]} onChange={(e) => setEssay({ ...essay, [tt]: e.target.value })} />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">{count} words</p>
                  <Button size="sm" disabled={writingBusy === tt || count < 20}
                    onClick={() => submitWriting(tt)}>
                    {writingBusy === tt ? 'Grading…' : 'Get AI feedback'}
                  </Button>
                </div>
                {writingFb[tt] && (
                  <div className="mt-4">
                    <FeedbackSummary fb={writingFb[tt].feedback} />
                  </div>
                )}
              </div>
            );
          })}
          {stepsDone.includes(5) && (
            <p className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-semibold text-green-800">
              Step complete ✓ {stepResults[5]?.band ? `· Best band so far: ${stepResults[5].band}` : ''}
            </p>
          )}
        </div>
      )}

      {/* STEP 6 — SPEAKING */}
      {step === 6 && (
        <div>
          <div className="card mb-5">
            <h3 className="font-bold mb-2">Useful phrases for this topic</h3>
            <div className="flex flex-wrap gap-2">
              {(st.speaking.part1.phrases || []).map((ph, i) => (
                <button key={i} onClick={() => speakWord(ph)}
                  className="text-sm font-medium bg-navy/5 hover:bg-navy/10 rounded-full px-3.5 py-1.5" title="Tap to hear">
                  🔊 {ph}
                </button>
              ))}
            </div>
            <details className="mt-4">
              <summary className="text-sm font-semibold text-navy cursor-pointer">Read &amp; hear a Band 9 sample answer (Part 2)</summary>
              <p className="text-sm text-gray-700 whitespace-pre-line mt-2 bg-paper rounded-lg p-3">{st.speaking.part2.sample}</p>
              <audio controls className="w-full mt-3"
                src={st.speaking.sampleAudioUrl} />
            </details>
          </div>
          {speakResult ? (
            <div className="space-y-4">
              <FeedbackSummary fb={speakResult.feedback} band={speakResult.band} />
              <div className="flex justify-end">
                <button className="btn-secondary btn-sm" onClick={() => setSpeakResult(null)}>Practise again</button>
              </div>
            </div>
          ) : (
            <SpeakingRecorder prompts={speakingPrompts} busy={speakBusy} done={false}
              submitLabel="Submit speaking for AI feedback" onSubmit={submitSpeaking} />
          )}
          {stepsDone.includes(6) && (
            <p className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm font-semibold text-green-800 mt-5">
              Step complete ✓ {stepResults[6]?.band ? `· Band: ${stepResults[6].band}` : ''}
            </p>
          )}
        </div>
      )}

      {/* STEP 7 — SUBJECT TEST */}
      {step === 7 && (
        <div>
          <div className="card mb-5">
            <h3 className="font-bold text-lg mb-1">Final test — {subject.name}</h3>
            <p className="text-sm text-gray-600">
              10 mixed questions: vocabulary, reading and listening knowledge from this topic.
              Score 7/10 or more to complete the topic. 🎓
            </p>
          </div>
          <QuizRunner slug={slug} kind="test" questions={st.test.questions}
            passText="Topic complete — well done!" onPassed={(d) => markDone(7, { score: `${d.score}/${d.total}` })} />
          {doneCount === 7 && (
            <div className="card mt-6 text-center">
              <p className="text-4xl mb-2">🎓</p>
              <h3 className="font-extrabold text-lg mb-1">You finished {subject.name}!</h3>
              <p className="text-sm text-gray-600 mb-4">Pick your next topic, or put everything together in a full mock test.</p>
              <div className="flex gap-3 justify-center">
                <a href="/course" className="btn-secondary btn-sm">All topics</a>
                <a href="/mock" className="btn-primary btn-sm">Take a full mock</a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prev / next step */}
      <div className="flex justify-between mt-10">
        <button className="btn-ghost btn-sm" disabled={step === 1} onClick={() => setStep(step - 1)}>← Previous step</button>
        <button className="btn-ghost btn-sm" disabled={step === 7} onClick={() => setStep(step + 1)}>Next step →</button>
      </div>
    </div>
  );
}
