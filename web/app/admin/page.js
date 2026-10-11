'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, API_BASE } from '@/lib/api';

const SECTIONS = [
  ['overview', '📊', 'Overview'],
  ['users', '👥', 'Users'],
  ['tests', '📝', 'Mock Tests'],
  ['attempts', '🎧', 'Attempts'],
  ['certificates', '🏆', 'Certificates'],
  ['settings', '⚙️', 'Settings'],
];

function StatCard({ label, value, sub }) {
  return (
    <div className="card !p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-4xl font-extrabold text-navy my-1">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export default function Admin() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [section, setSection] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [search, setSearch] = useState('');
  const [tests, setTests] = useState(null);
  const [attempts, setAttempts] = useState(null);
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [recordings, setRecordings] = useState(null);
  const [certs, setCerts] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');

  const loadUsers = useCallback((q) => {
    api.get(`/admin/users${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      .then((d) => setUsers(d.users)).catch((e) => setError(e.message));
  }, []);
  const loadTests = useCallback(() => {
    api.get('/admin/tests').then((d) => setTests(d.tests)).catch((e) => setError(e.message));
  }, []);
  const loadAttempts = useCallback(() => {
    api.get('/admin/attempts').then((d) => setAttempts(d.attempts)).catch((e) => setError(e.message));
    api.get('/admin/recordings').then((d) => setRecordings(d)).catch(() => {});
  }, []);
  const loadCerts = useCallback(() => {
    api.get('/admin/certificates').then((d) => setCerts(d.certificates)).catch((e) => setError(e.message));
  }, []);
  const loadStats = useCallback(() => {
    api.get('/admin/stats').then((d) => setStats(d)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    api.get('/auth/me')
      .then((d) => {
        if (d.user.role !== 'admin') { router.push('/dashboard'); return; }
        setMe(d.user);
        loadStats(); loadUsers(''); loadTests(); loadAttempts(); loadCerts();
      })
      .catch(() => router.push('/login'));
  }, [router, loadStats, loadUsers, loadTests, loadAttempts, loadCerts]);

  function flash(msg) { setNotice(msg); setTimeout(() => setNotice(''), 4000); }

  async function act(id, fn, after) {
    setBusy(id); setError('');
    try { await fn(); if (after) after(); }
    catch (err) { setError(err.message); }
    setBusy('');
  }

  // ── User actions ──
  const toggleRole = (u) => act(u._id, async () => {
    const next = u.role === 'admin' ? 'student' : 'admin';
    if (!confirm(`Change ${u.email} to ${next}?`)) return;
    await api.patch(`/admin/users/${u._id}/role`, { role: next });
    loadUsers(search); flash('Role updated.');
  });
  const changeEmail = (u) => act(u._id, async () => {
    const email = prompt(`New email for ${u.name} (${u.email}):`, u.email);
    if (!email || email === u.email) return;
    await api.patch(`/admin/users/${u._id}/email`, { email });
    loadUsers(search); flash('Email updated. Tell the user to login with the new email.');
  });
  const resetPassword = (u) => act(u._id, async () => {
    const password = prompt(`Set a NEW password for ${u.email} (min 8 characters). The user will be logged out everywhere:`);
    if (!password) return;
    await api.post(`/admin/users/${u._id}/reset-password`, { password });
    flash('Password reset. Share the new password with the user yourself.');
  });
  const toggleBan = (u) => act(u._id, async () => {
    if (!confirm(u.banned ? `Unban ${u.email}?` : `Ban ${u.email}? They will not be able to login. Their data stays safe.`)) return;
    await api.patch(`/admin/users/${u._id}/ban`, { banned: !u.banned });
    loadUsers(search); flash(u.banned ? 'User unbanned.' : 'User banned.');
  });
  const deleteUser = (u) => act(u._id, async () => {
    if (!confirm(`DELETE ${u.email} permanently? Their attempts, progress and recordings will be deleted. Issued certificates stay verifiable. This cannot be undone.`)) return;
    await api.del(`/admin/users/${u._id}`);
    loadUsers(search); loadStats(); flash('User deleted.');
  });

  const togglePublish = (t) => act(t.id, async () => {
    await api.patch(`/admin/tests/${t.id}/publish`, { published: !t.published });
    loadTests(); flash(t.published ? 'Test unpublished.' : 'Test published.');
  });

  const openAttempt = (a) => act(a.id, async () => {
    const d = await api.get(`/admin/attempts/${a.id}`);
    setAttemptDetail(d.attempt);
  });
  const deleteRecording = (r) => act(r.id, async () => {
    if (!confirm('Delete this recording permanently?')) return;
    await api.del(`/admin/recordings/${r.id}`);
    loadAttempts(); loadStats(); flash('Recording deleted.');
  });

  if (!me) return <p className="text-center py-16">Loading…</p>;

  const maxSignups = Math.max(1, ...(stats?.signups7d || []).map((d) => d.count));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sidebar */}
        <aside className="w-full lg:w-60 shrink-0 rounded-2xl bg-navy text-white p-4 lg:sticky lg:top-6">
          <p className="font-extrabold text-lg px-2">BandMuft Admin</p>
          <p className="text-xs text-white/60 px-2 mb-4">{me.email}</p>
          <nav className="flex lg:flex-col gap-1 flex-wrap">
            {SECTIONS.map(([key, icon, label]) => (
              <button key={key} onClick={() => setSection(key)}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold text-left transition-colors ${section === key ? 'bg-gold text-navy' : 'hover:bg-white/10'}`}>
                <span className="mr-2" aria-hidden="true">{icon}</span>{label}
              </button>
            ))}
          </nav>
          <a href="/dashboard" className="block text-xs text-white/60 hover:text-gold px-3 mt-4">← Back to my dashboard</a>
        </aside>

        {/* Main panel */}
        <div className="flex-1 w-full min-w-0">
          {notice && <p className="rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-semibold px-4 py-3 mb-4">{notice}</p>}
          {error && <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-3 mb-4">{error}</p>}

          {section === 'overview' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-5">Overview</h1>
              {!stats ? <p>Loading…</p> : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard label="Total users" value={stats.stats.users} />
                    <StatCard label="Mock tests" value={stats.stats.tests} />
                    <StatCard label="Submitted attempts" value={stats.stats.attempts} />
                    <StatCard label="Certificates issued" value={stats.stats.certificates} />
                  </div>
                  <div className="grid lg:grid-cols-3 gap-4">
                    <div className="card lg:col-span-2">
                      <h2 className="font-bold mb-4">Signups — last 7 days</h2>
                      <div className="flex items-end gap-2 h-32">
                        {stats.signups7d.map((d) => (
                          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-navy">{d.count || ''}</span>
                            <div className="w-full rounded-t-lg bg-gold" style={{ height: `${Math.max(4, (d.count / maxSignups) * 88)}px` }} />
                            <span className="text-[10px] text-gray-500">
                              {new Date(`${d.date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'short' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card">
                      <h2 className="font-bold mb-3">Speaking recordings</h2>
                      <p className="text-3xl font-extrabold text-navy">{stats.recordings.count}</p>
                      <p className="text-sm text-gray-600">using {stats.recordings.sizeMB} MB of database space</p>
                      <button className="btn-secondary btn-sm mt-4" onClick={() => setSection('attempts')}>
                        Manage recordings
                      </button>
                    </div>
                  </div>
                  <div className="card mt-4">
                    <h2 className="font-bold mb-3">Recent activity</h2>
                    {stats.recentActivity.length === 0 ? (
                      <p className="text-sm text-gray-500">No submitted attempts yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {stats.recentActivity.map((a) => (
                          <div key={a.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2">
                            <span><b>{a.user?.name || 'Unknown'}</b> <span className="text-gray-500">({a.user?.email})</span> — {a.test}</span>
                            <span className="font-bold text-navy">{a.overall ? `Band ${Number(a.overall).toFixed(1)}` : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {section === 'users' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-5">Users</h1>
              <form className="flex gap-2 mb-4" onSubmit={(e) => { e.preventDefault(); loadUsers(search); }}>
                <input className="input" placeholder="Search by name or email…"
                  value={search} onChange={(e) => setSearch(e.target.value)} />
                <button className="btn-primary btn-sm shrink-0">Search</button>
              </form>
              {!users ? <p>Loading…</p> : users.length === 0 ? (
                <p className="text-gray-600">No users found.</p>
              ) : (
                <div className="card !p-0 overflow-x-auto">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3">Status</th><th className="px-4 py-3">Joined</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => {
                        const isSelf = u._id === me.id;
                        return (
                          <tr key={u._id} className="border-b border-gray-50">
                            <td className="px-4 py-3">
                              <p className="font-semibold">{u.name}</p>
                              <p className="text-xs text-gray-500">{u.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold rounded-full px-2.5 py-1 ${u.role === 'admin' ? 'bg-navy text-gold' : 'bg-gray-100 text-gray-600'}`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {u.banned
                                ? <span className="text-xs font-bold text-red-600">Banned</span>
                                : <span className="text-xs font-bold text-green-700">Active</span>}
                            </td>
                            <td className="px-4 py-3 text-gray-500">
                              {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-3">
                              {isSelf ? (
                                <span className="text-xs text-gray-400">This is you</span>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  <button className="btn-secondary btn-sm !px-2.5 !py-1 text-xs" disabled={busy === u._id} onClick={() => toggleRole(u)}>
                                    {u.role === 'admin' ? 'Make student' : 'Make admin'}
                                  </button>
                                  <button className="btn-secondary btn-sm !px-2.5 !py-1 text-xs" disabled={busy === u._id} onClick={() => changeEmail(u)}>Email</button>
                                  <button className="btn-secondary btn-sm !px-2.5 !py-1 text-xs" disabled={busy === u._id} onClick={() => resetPassword(u)}>Password</button>
                                  <button className="btn-secondary btn-sm !px-2.5 !py-1 text-xs" disabled={busy === u._id} onClick={() => toggleBan(u)}>
                                    {u.banned ? 'Unban' : 'Ban'}
                                  </button>
                                  <button className="btn-danger btn-sm !px-2.5 !py-1 text-xs" disabled={busy === u._id} onClick={() => deleteUser(u)}>Delete</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">
                Email change and password reset are for account recovery: verify the person's identity first
                (account name, tests taken, approximate bands, certificate ID) before changing anything.
              </p>
            </div>
          )}

          {section === 'tests' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-5">Mock Tests</h1>
              {!tests ? <p>Loading…</p> : (
                <div className="card !p-0 overflow-x-auto">
                  <table className="w-full text-sm min-w-[720px]">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="px-4 py-3">Test</th><th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Questions</th><th className="px-4 py-3">Attempts</th>
                        <th className="px-4 py-3">Avg band</th><th className="px-4 py-3">Published</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tests.map((t) => (
                        <tr key={t.id} className="border-b border-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-semibold">{t.title}</p>
                            <p className="text-xs text-gray-500">/{t.slug} · {(t.skills || []).join(', ')}</p>
                          </td>
                          <td className="px-4 py-3 capitalize">{t.kind}</td>
                          <td className="px-4 py-3">{t.questionCount}</td>
                          <td className="px-4 py-3">{t.attempts}</td>
                          <td className="px-4 py-3 font-bold text-navy">{t.avgBand ?? '—'}</td>
                          <td className="px-4 py-3">
                            <button disabled={busy === t.id} onClick={() => togglePublish(t)}
                              className={`text-xs font-bold rounded-full px-3 py-1.5 ${t.published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                              {t.published ? '● Live' : '○ Hidden'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {section === 'attempts' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-5">Attempts &amp; Recordings</h1>
              {recordings && (
                <div className="card mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm">
                    <b>{recordings.recordings.length}</b> recordings stored · <b>{recordings.totalMB} MB</b> of database space
                    <span className="text-gray-500"> (latest 100 shown — delete old ones to free space)</span>
                  </p>
                </div>
              )}
              {!attempts ? <p>Loading…</p> : attempts.length === 0 ? (
                <p className="text-gray-600">No submitted attempts yet.</p>
              ) : (
                <div className="card !p-0 overflow-x-auto mb-6">
                  <table className="w-full text-sm min-w-[760px]">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="px-4 py-3">Student</th><th className="px-4 py-3">Test</th>
                        <th className="px-4 py-3">L</th><th className="px-4 py-3">R</th>
                        <th className="px-4 py-3">W</th><th className="px-4 py-3">S</th>
                        <th className="px-4 py-3">Overall</th><th className="px-4 py-3">Date</th><th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((a) => (
                        <tr key={a.id} className="border-b border-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-semibold">{a.user?.name || '—'}</p>
                            <p className="text-xs text-gray-500">{a.user?.email}</p>
                          </td>
                          <td className="px-4 py-3">{a.test?.title}</td>
                          <td className="px-4 py-3">{a.listening || '—'}</td>
                          <td className="px-4 py-3">{a.reading || '—'}</td>
                          <td className="px-4 py-3">{a.writing || '—'}</td>
                          <td className="px-4 py-3">{a.speaking || '—'}</td>
                          <td className="px-4 py-3 font-bold text-navy">{a.overall ? Number(a.overall).toFixed(1) : '—'}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''}
                          </td>
                          <td className="px-4 py-3">
                            <button className="btn-secondary btn-sm !px-2.5 !py-1 text-xs" disabled={busy === a.id} onClick={() => openAttempt(a)}>
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {attemptDetail && (
                <div className="card mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-bold">
                      {attemptDetail.user?.name} — {attemptDetail.test?.title}
                    </h2>
                    <button className="btn-ghost btn-sm" onClick={() => setAttemptDetail(null)}>Close</button>
                  </div>
                  {attemptDetail.speaking?.parts?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-bold text-sm mb-2">🎤 Speaking — recordings &amp; transcripts</h3>
                      <div className="space-y-3">
                        {attemptDetail.speaking.parts.map((p) => (
                          <div key={p.part} className="rounded-xl bg-paper p-3">
                            <p className="font-bold text-sm mb-1.5">Part {p.part}</p>
                            {p.recordingId && (
                              <audio controls crossOrigin="use-credentials" className="w-full mb-2"
                                src={`${API_BASE}/api/v1/speaking/recording/${p.recordingId}`} />
                            )}
                            <p className="text-sm text-gray-700 whitespace-pre-line">{p.transcript || '—'}</p>
                          </div>
                        ))}
                      </div>
                      {attemptDetail.speaking.feedback && (
                        <p className="text-sm mt-2">
                          AI band <b>{attemptDetail.speaking.band}</b> — {attemptDetail.speaking.feedback.comments}
                        </p>
                      )}
                    </div>
                  )}
                  {attemptDetail.writing?.tasks?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-sm mb-2">✍️ Writing — band {attemptDetail.writing.band || 'pending'}</h3>
                      {attemptDetail.writing.tasks.map((t) => (
                        <details key={t.taskType} className="mb-2">
                          <summary className="text-sm font-semibold cursor-pointer">
                            {t.taskType === 'task1' ? 'Task 1' : 'Task 2'} — {t.wordCount} words{t.feedback ? ` · Band ${Number(t.feedback.overall).toFixed(1)}` : ' · feedback pending'}
                          </summary>
                          <p className="text-sm text-gray-700 whitespace-pre-line mt-2 bg-paper rounded-lg p-3">{t.text}</p>
                          {t.feedback?.comments && <p className="text-sm text-gray-600 mt-2">{t.feedback.comments}</p>}
                        </details>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {recordings && recordings.recordings.length > 0 && (
                <div className="card !p-0 overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="px-4 py-3">Recording</th><th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Size</th><th className="px-4 py-3">Date</th><th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {recordings.recordings.map((r) => (
                        <tr key={r.id} className="border-b border-gray-50">
                          <td className="px-4 py-3">
                            <audio controls crossOrigin="use-credentials" className="h-9 w-56"
                              src={`${API_BASE}/api/v1/speaking/recording/${r.id}`} />
                            <p className="text-xs text-gray-500 mt-1">{r.context}{r.part ? ` · Part ${r.part}` : ''}</p>
                          </td>
                          <td className="px-4 py-3">{r.user?.name || '—'}<p className="text-xs text-gray-500">{r.user?.email}</p></td>
                          <td className="px-4 py-3">{r.sizeMB} MB</td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <button className="btn-danger btn-sm !px-2.5 !py-1 text-xs" disabled={busy === r.id} onClick={() => deleteRecording(r)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {section === 'certificates' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-5">Certificates</h1>
              {!certs ? <p>Loading…</p> : certs.length === 0 ? (
                <p className="text-gray-600">No certificates issued yet.</p>
              ) : (
                <div className="card !p-0 overflow-x-auto">
                  <table className="w-full text-sm min-w-[720px]">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="px-4 py-3">Code</th><th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Test</th><th className="px-4 py-3">Bands (L·R·W·S)</th>
                        <th className="px-4 py-3">Overall</th><th className="px-4 py-3">Issued</th><th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody>
                      {certs.map((c) => (
                        <tr key={c.code} className="border-b border-gray-50">
                          <td className="px-4 py-3 font-mono text-xs">{c.code}</td>
                          <td className="px-4 py-3 font-semibold">{c.name}</td>
                          <td className="px-4 py-3">{c.testTitle}</td>
                          <td className="px-4 py-3">
                            {[c.listeningBand, c.readingBand, c.writingBand, c.speakingBand].map((b) => b || '—').join(' · ')}
                          </td>
                          <td className="px-4 py-3 font-bold text-navy">{c.overallBand}</td>
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-4 py-3">
                            <a href={`/certificate/${c.code}`} className="btn-secondary btn-sm !px-2.5 !py-1 text-xs">View</a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">
                Certificates stay verifiable even if the student's account is later deleted — that is deliberate,
                so a shared certificate never suddenly looks fake.
              </p>
            </div>
          )}

          {section === 'settings' && (
            <div>
              <h1 className="text-2xl font-extrabold mb-5">Settings</h1>
              <div className="grid gap-4 max-w-2xl">
                <div className="card">
                  <h2 className="font-bold mb-2">How this site is wired</h2>
                  <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                    <li><b>Contact form</b> messages are emailed to the admin address set on the server (CONTACT_TO / ADMIN_EMAIL). Replies go straight to the student's email.</li>
                    <li><b>Test audio</b> lives inside the website itself (web/public/audio) and is served with the site — no Cloudinary, no third-party account.</li>
                    <li><b>Speaking recordings</b> are stored in the database. You can play and delete them from the Attempts section. Current usage: {stats ? `${stats.recordings.count} recordings · ${stats.recordings.sizeMB} MB` : '…'}.</li>
                    <li><b>AI grading</b> uses Google Gemini (current model) for Writing and Speaking feedback. If feedback ever gets stuck on "pending", opening the result again retries it automatically.</li>
                    <li><b>Email verification (OTP)</b> is off by design: new accounts are active immediately. It can be switched back on after a custom sending domain is verified in Resend.</li>
                  </ul>
                </div>
                <div className="card">
                  <h2 className="font-bold mb-2">Account recovery checklist</h2>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal pl-5">
                    <li>The student contacts you through the Contact page (or replies to any BandMuft email).</li>
                    <li>Verify their identity: ask for the account name, which tests they took, their approximate bands, or a certificate ID — and match it here in the panel.</li>
                    <li>In Users: update their email to the real one, then reset their password and share the new password with them.</li>
                    <li>If the identity cannot be verified, do not change anything — the student can register again for free.</li>
                  </ol>
                </div>
                <div className="card">
                  <h2 className="font-bold mb-2">Keeping the database healthy</h2>
                  <p className="text-sm text-gray-700">
                    The free database is shared, so delete old speaking recordings (Attempts section) every few weeks,
                    and remove dummy/fake accounts from the Users section. Everything else — users, attempts,
                    certificates — uses very little space.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
