'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

export default function Admin() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  useEffect(() => {
    api.get('/auth/me')
      .then((d) => {
        if (d.user.role !== 'admin') throw new Error('Not allowed');
        setMe(d.user);
        return Promise.all([api.get('/admin/stats'), api.get('/admin/users')]);
      })
      .then(([s, u]) => { setStats(s.stats); setUsers(u.users); })
      .catch((err) => setError(err.message || 'Not allowed'));
  }, []);

  async function toggleRole(u) {
    const next = u.role === 'admin' ? 'student' : 'admin';
    if (!confirm(`${u.email} ko ${next} banana hai?`)) return;
    setBusy(u._id); setError('');
    try {
      const d = await api.post(`/admin/users/${u._id}/role`, { role: next });
      setUsers((list) => list.map((x) => (x._id === u._id ? { ...x, role: d.user.role } : x)));
    } catch (err) { setError(err.message); }
    setBusy('');
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card text-center">
          <h1 className="text-2xl font-extrabold mb-2">Not allowed</h1>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  if (!me) return <p className="text-center py-16">Loading…</p>;

  const cards = stats ? [
    { label: 'Users', value: stats.users },
    { label: 'Mock tests', value: stats.tests },
    { label: 'Attempts', value: stats.attempts },
    { label: 'Certificates', value: stats.certificates },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2">Admin Panel</h1>
      <p className="text-gray-600 mb-8">Logged in as {me.email}</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="card text-center">
            <p className="text-3xl font-extrabold text-navy">{c.value}</p>
            <p className="text-sm text-gray-600">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-bold text-lg mb-4">Users ({users ? users.length : '…'})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Verified</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {(users || []).map((u) => (
                <tr key={u._id} className="border-b last:border-0">
                  <td className="py-2 pr-4 font-medium">{u.name}</td>
                  <td className="py-2 pr-4 text-gray-600">{u.email}</td>
                  <td className="py-2 pr-4">{u.isVerified ? '✓' : '—'}</td>
                  <td className="py-2 pr-4">
                    <span className={`inline-block text-xs font-bold rounded-full px-2 py-0.5 ${u.role === 'admin' ? 'bg-navy text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => toggleRole(u)}
                      disabled={busy === u._id || u._id === me._id}
                      className="text-navy font-semibold hover:underline disabled:opacity-40 disabled:no-underline text-xs"
                    >
                      {busy === u._id ? '…' : u.role === 'admin' ? 'Make student' : 'Make admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}
