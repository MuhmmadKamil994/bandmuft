'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.post('/auth/reset-password', { token, password });
      router.push('/login');
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card text-center">
          <p className="text-red-600 font-semibold">Invalid reset link. Request a new one.</p>
          <a href="/forgot-password" className="btn-secondary btn-sm mt-4 inline-flex">Back</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-extrabold mb-1">Set new password</h1>
        <p className="text-sm text-gray-600 mb-6">This link works once and expires in 30 minutes.</p>
        <form onSubmit={submit}>
          <Input label="New password (min 8 characters)" type="password" required minLength={8}
            value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <Button block disabled={busy}>{busy ? 'Saving…' : 'Set new password'}</Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return <Suspense><ResetForm /></Suspense>;
}
