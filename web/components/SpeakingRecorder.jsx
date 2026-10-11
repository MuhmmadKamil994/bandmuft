'use client';
import { useEffect, useRef, useState } from 'react';

// Speaking recorder — teen cheezain aik saath:
//  1) Mic recording (MediaRecorder) — audio baad mein sunne ke liye save hota hai
//  2) Live transcript (SpeechRecognition, jahan available ho)
//  3) Type karne ka fallback — purana browser ho to bhi test rukta nahi
// prompts: [{ part, title, lines: [..], cue?: {cue, points} , note? }]
// onSubmit(parts): parts = [{ part, transcript, audio(base64|null), mime }]
export default function SpeakingRecorder({ prompts, submitLabel = 'Submit speaking for AI feedback', onSubmit, busy, done }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // part -> { transcript, audio, mime, audioUrl }
  const [recording, setRecording] = useState(false);
  const [recError, setRecError] = useState('');
  const [prepLeft, setPrepLeft] = useState(null);
  const recRef = useRef(null);
  const recogRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const p = prompts[current];
  const ans = answers[p.part] || { transcript: '', audio: null, mime: '', audioUrl: null };

  useEffect(() => () => { stopAll(); }, []);
  useEffect(() => {
    if (prepLeft === null || prepLeft <= 0) return;
    const t = setTimeout(() => setPrepLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [prepLeft]);

  function stopAll() {
    try { recRef.current?.stop(); } catch { /* noop */ }
    try { recogRef.current?.stop(); } catch { /* noop */ }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
  }

  async function startRecording() {
    setRecError('');
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', ''].find(
        (m) => m === '' || window.MediaRecorder?.isTypeSupported(m)
      );
      const rec = new window.MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      recRef.current = rec;
      rec.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' });
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = String(reader.result).split(',')[1] || null;
          setAnswers((prev) => ({
            ...prev,
            [p.part]: { ...(prev[p.part] || ans), audio: base64, mime: blob.type, audioUrl: URL.createObjectURL(blob) },
          }));
        };
        reader.readAsDataURL(blob);
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      rec.start(1000);
    } catch {
      setRecError('Microphone access was blocked. You can still type your answers below — the AI will grade the text.');
    }
    // Live transcript (Chrome/Edge) — na ho to khamoshi se skip
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      try {
        const recog = new SR();
        recog.lang = 'en-GB';
        recog.continuous = true;
        recog.interimResults = false;
        recog.onresult = (e) => {
          let text = '';
          for (let i = e.resultIndex; i < e.results.length; i++) {
            if (e.results[i].isFinal) text += e.results[i][0].transcript + ' ';
          }
          if (text) {
            setAnswers((prev) => ({
              ...prev,
              [p.part]: { ...(prev[p.part] || { transcript: '', audio: null, mime: '', audioUrl: null }), transcript: ((prev[p.part]?.transcript || '') + text).slice(0, 8000) },
            }));
          }
        };
        recog.onerror = () => { /* transcript na mile to bhi recording chalti rahe */ };
        recogRef.current = recog;
        recog.start();
      } catch { /* ignore */ }
    }
    setRecording(true);
  }

  function setTranscript(v) {
    setAnswers((prev) => ({ ...prev, [p.part]: { ...(prev[p.part] || ans), transcript: v } }));
  }

  const allParts = prompts.map((pr) => {
    const a = answers[pr.part];
    return { part: pr.part, transcript: a?.transcript || '', audio: a?.audio || null, mime: a?.mime || 'audio/webm' };
  });
  const anyContent = allParts.some((x) => x.transcript.trim().length >= 10 || x.audio);

  return (
    <div>
      {/* Part tabs */}
      <div className="flex gap-2 mb-5">
        {prompts.map((pr, i) => (
          <button key={pr.part} onClick={() => { stopAll(); setCurrent(i); }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold border-2 ${current === i ? 'border-navy bg-navy text-white' : 'border-gray-200 hover:border-navy'}`}>
            Part {pr.part}{answers[pr.part]?.transcript || answers[pr.part]?.audio ? ' ✓' : ''}
          </button>
        ))}
      </div>

      <div className="card mb-5">
        <h3 className="font-bold text-lg mb-2">{p.title}</h3>
        {p.cue ? (
          <div className="rounded-xl border-2 border-dashed border-gold bg-gold/10 p-4 mb-3">
            <p className="font-bold mb-2">{p.cue.cue}</p>
            <p className="text-sm font-semibold mb-1">You should say:</p>
            <ul className="list-disc pl-5 text-sm text-gray-700">
              {p.cue.points.map((pt, i) => <li key={i}>{pt}</li>)}
            </ul>
            <div className="mt-3 flex items-center gap-3">
              <button className="btn-secondary btn-sm" onClick={() => setPrepLeft(60)} disabled={prepLeft !== null && prepLeft > 0}>
                {prepLeft !== null && prepLeft > 0 ? `Preparing… ${prepLeft}s` : 'Start 1-minute preparation'}
              </button>
              <span className="text-xs text-gray-500">In the real test you get 1 minute to prepare and speak for up to 2 minutes.</span>
            </div>
          </div>
        ) : (
          <ul className="space-y-2 mb-3">
            {p.lines.map((q, i) => (
              <li key={i} className="text-[15px] text-gray-800 flex gap-2">
                <span className="text-gold-dark font-bold">Q{i + 1}</span><span>{q}</span>
              </li>
            ))}
          </ul>
        )}
        {p.note && <p className="text-sm text-gray-500 mb-2">{p.note}</p>}

        <div className="flex flex-wrap items-center gap-3 my-4">
          {!recording ? (
            <button className="btn-primary btn-sm" onClick={startRecording} disabled={done}>
              🎤 {ans.audio || ans.transcript ? 'Record again' : 'Start recording'}
            </button>
          ) : (
            <button className="btn-danger btn-sm" onClick={stopAll}>
              ⏹ Stop recording
            </button>
          )}
          {recording && <span className="text-sm font-semibold text-red-600 animate-pulse">● Recording… speak now</span>}
          {ans.audioUrl && !recording && (
            <audio controls src={ans.audioUrl} className="h-9" />
          )}
        </div>
        {recError && <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">{recError}</p>}

        <label className="label">Your answer (transcript)</label>
        <textarea className="input min-h-28" rows={4} value={ans.transcript}
          onChange={(e) => setTranscript(e.target.value)} disabled={done}
          placeholder="Your words will appear here as you speak. If nothing appears, type your answers here instead." />
        <p className="text-xs text-gray-500 mt-1">
          The AI grades this transcript. Your recording is also saved so the admin can listen to it.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button className="btn-ghost btn-sm" disabled={current === 0}
            onClick={() => { stopAll(); setCurrent(current - 1); }}>← Previous part</button>
          <button className="btn-ghost btn-sm" disabled={current === prompts.length - 1}
            onClick={() => { stopAll(); setCurrent(current + 1); }}>Next part →</button>
        </div>
        <button className="btn-primary btn-sm" disabled={busy || done || !anyContent}
          onClick={() => { stopAll(); onSubmit(allParts); }}>
          {done ? 'Speaking submitted ✓' : busy ? 'Grading…' : submitLabel}
        </button>
      </div>
      {!anyContent && !done && (
        <p className="text-xs text-gray-500 mt-2 text-right">Answer at least one part to submit.</p>
      )}
    </div>
  );
}
