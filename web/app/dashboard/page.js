'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    api.get('/auth/me')
      .then((d) => { setUser(d.user); return api.get('/certificates/mine'); })
      .then((d) => setCerts(d.certificates))
      .catch(() => router.push('/login'));
  }, [router]);

  async function logout() {
    await api.post('/auth/logout');
    router.push('/');
  }

  if (!user) return <p className="text-center py-16">Loading…</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold">Welcome back, {user.name}</h1>
        <button onClick={logout} className="btn-ghost btn-sm">Logout</button>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-bold text-lg mb-2">Mock tests</h2>
          <p className="text-sm text-gray-600 mb-4">Full Listening + Reading mocks with instant band scores.</p>
          <a href="/mock" className="btn-primary btn-sm inline-flex">Start mock</a>
        </div>
        <div className="card">
          <h2 className="font-bold text-lg mb-2">Writing practice</h2>
          <p className="text-sm text-gray-600 mb-4">Task 1 & 2 with instant AI feedback on the 4 official criteria.</p>
          <a href="/writing" className="btn-primary btn-sm inline-flex">Practice writing</a>
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
                  <a className="btn-secondary btn-sm"
                    href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/certificates/${c.code}/pdf`}>
                    PDF
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
