'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

function words(s) { return s.trim() ? s.trim().split(/\s+/).length : 0; }

export default function Writing() {
  const router = useRouter();
  const [prompts, setPrompts] = useState(null);
  const [tab, setTab] = useState('task2');
  const [promptId, setPromptId] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/auth/me').catch(() => router.push('/login'));
    api.get('/writing/prompts').then((d) => {
      setPrompts(d.prompts);
      const first = d.prompts.find((p) => p.taskType === 'task2') || d.prompts[0];
      if (first) { setPromptId(first._id); setTab(first.taskType); }
    }).catch(() => setPrompts([]));
  }, [router]);

  const prompt = (prompts || []).find((p) => p._id === promptId);
  const wc = words(text);
  const min = tab === 'task1' ? 150 : 250;

  async function submit() {
    setBusy(true); setError('');
    try {
      const d = await api.post('/writing/submit', { promptId, text });
      router.push(`/writing/${d.id}`);
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2">Writing Practice</h1>
      <p className="text-gray-600 mb-8">Get instant AI feedback on the 4 official IELTS criteria. Free.</p>

      <div className="flex gap-2 mb-6">
        {['task1', 'task2'].map((t) => (
          <button key={t} onClick={() => {
            setTab(t);
            const first = (prompts || []).find((p) => p.taskType === t);
            if (first) setPromptId(first._id);
            setText('');
          }}
            className={`rounded-lg px-5 py-2 font-semibold ${tab === t ? 'bg-navy text-white' : 'bg-white border text-navy'}`}>
            {t === 'task1' ? 'Task 1' : 'Task 2'}
          </button>
        ))}
      </div>

      <div className="card mb-6">
        <label className="label">Choose a prompt</label>
        <select className="input mb-4" value={promptId} onChange={(e) => setPromptId(e.target.value)}>
          {(prompts || []).filter((p) => p.taskType === tab).map((p) => (
            <option key={p._id} value={p._id}>{p.title}</option>
          ))}
        </select>
        {prompt && <p className="text-[15px] leading-relaxed bg-paper rounded-lg p-4">{prompt.text}</p>}
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-2">
          <label className="label !mb-0">Your answer</label>
          <span className={`text-sm font-semibold ${wc >= min ? 'text-green-700' : 'text-gray-500'}`}>
            {wc} words (min {min})
          </span>
        </div>
        <textarea className="input min-h-[280px] leading-relaxed" placeholder="Write your essay here…"
          value={text} onChange={(e) => setText(e.target.value)} />
        {error && <p className="text-sm text-red-600 my-3">{error}</p>}
        <Button className="mt-2" disabled={busy || wc < 20} onClick={submit}>
          {busy ? 'Submitting…' : 'Submit for AI feedback'}
        </Button>
      </div>
    </div>
  );
}
