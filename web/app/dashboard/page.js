'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, API_BASE } from '@/lib/api';

function bandOf(a) {
  const parts = [a.sectionScores?.listening?.band, a.sectionScores?.reading?.band, a.writing?.band, a.speaking?.band]
    .map((b) => parseFloat(b)).filter((n) => !Number.isNaN(n));
  if (!parts.length) return null;
  const avg = parts.reduce((x, y) => x + y, 0) / parts.length;
  return (Math.round(avg * 2) / 2).toFixed(1);
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [certs, setCerts] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    api.get('/auth/me')
      .then((d) => {
        setUser(d.user);
        return Promise.all([
          api.get('/certificates/mine').then((x) => setCerts(x.certificates)).catch(() => {}),
          api.get('/tests/attempts/mine').then((x) => setAttempts(x.attempts)).catch(() => {}),
          api.get('/course/subjects').then((x) => setSubjects(x.subjects)).catch(() => {}),
          api.get('/course/progress').then((x) => setProgress(x.progress || {})).catch(() => {}),
        ]);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  async function logout() {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    router.push('/');
  }

  if (!user) return <p className="text-center py-16">Loading…</p>;

  const totalSteps = subjects.reduce((a, s) => a + (progress[s.slug]?.stepsDone?.length || 0), 0);
  const maxSteps = subjects.length * 7;
  const subjectsDone = subjects.filter((s) => (progress[s.slug]?.stepsDone?.length || 0) === 7).length;
  const nextSubject = subjects.find((s) => (progress[s.slug]?.stepsDone?.length || 0) < 7);
  const coursePct = maxSteps ? Math.round((totalSteps / maxSteps) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold">Welcome back, {user.name}</h1>
        <div className="flex items-center gap-2">
          {user.role === 'admin' && (
            <a href="/admin" className="btn-secondary btn-sm">Admin panel</a>
          )}
          <button onClick={logout} className="btn-ghost btn-sm">Logout</button>
        </div>
      </div>

      {/* My Roadmap */}
      <div className="card mb-4 border-2 !border-gold/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="font-bold text-lg mb-1">🗺️ My Roadmap — the topic course</h2>
            <p className="text-sm text-gray-600 mb-3">
              {subjectsDone} of {subjects.length || 16} topics complete · {totalSteps} steps done ({coursePct}%)
            </p>
            <div className="h-3 rounded-full bg-gray-100 overflow-hidden max-w-md">
              <div className="h-full rounded-full bg-gold" style={{ width: `${coursePct}%` }} />
            </div>
            {nextSubject && (
              <p className="text-sm mt-3">
                Next up: <b>{nextSubject.name}</b>
                <span className="text-gray-500"> — {(progress[nextSubject.slug]?.stepsDone?.length || 0)}/7 steps</span>
              </p>
            )}
            {subjects.length > 0 && !nextSubject && (
              <p className="text-sm mt-3 font-semibold text-green-700">🎓 You have completed the whole course!</p>
            )}
          </div>
          <a href={nextSubject ? `/course/${nextSubject.slug}` : '/course'} className="btn-primary btn-sm shrink-0">
            {totalSteps === 0 ? 'Start the course' : 'Continue'}
          </a>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-bold text-lg mb-2">Mock tests</h2>
          <p className="text-sm text-gray-600 mb-4">Full four-skill mocks with instant band scores and certificates.</p>
          <a href="/mock" className="btn-primary btn-sm inline-flex">Start mock</a>
        </div>
        <div className="card">
          <h2 className="font-bold text-lg mb-2">Writing practice</h2>
          <p className="text-sm text-gray-600 mb-4">Task 1 &amp; 2 with instant AI feedback on the 4 official criteria.</p>
          <a href="/writing" className="btn-primary btn-sm inline-flex">Practice writing</a>
        </div>

        <div className="card sm:col-span-2">
          <h2 className="font-bold text-lg mb-3">My recent attempts</h2>
          {attempts.length === 0 ? (
            <p className="text-sm text-gray-600">No attempts yet — your test history will appear here.</p>
          ) : (
            <div className="space-y-2">
              {attempts.slice(0, 6).map((a) => (
                <a key={a._id} href={`/mock/${a.test?.slug}/result/${a._id}`}
                  className="flex items-center justify-between rounded-lg bg-paper px-4 py-3 hover:bg-gold/10">
                  <div>
                    <p className="font-semibold text-sm">{a.test?.title || 'Mock test'}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(a.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {a.writing?.status === 'feedback-pending' || a.speaking?.status === 'feedback-pending' ? ' · AI feedback pending' : ''}
                    </p>
                  </div>
                  <span className="font-extrabold text-navy">
                    {bandOf(a) ? `Band ${bandOf(a)}` : '—'}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="card sm:col-span-2">
          <h2 className="font-bold text-lg mb-2">My certificates</h2>
          {certs.length === 0 ? (
            <p className="text-sm text-gray-600">Complete a mock test to earn your first verifiable certificate.</p>
          ) : (
            <div className="space-y-2">
              {certs.map((c) => (
                <div key={c.code} className="flex items-center justify-between rounded-lg bg-paper px-4 py-3">
                  <div>
                    <p className="font-semibold text-sm">{c.testTitle}</p>
                    <p className="text-xs text-gray-500">{c.code} · Band {c.overallBand}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`/certificate/${c.code}`} className="btn-primary btn-sm">View</a>
                    <a className="btn-secondary btn-sm"
                      href={`${API_BASE}/api/v1/certificates/${c.code}/pdf`}>
                      PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
