'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try { await api.post('/auth/forgot-password', { email }); } catch { /* same message */ }
    setBusy(false); setDone(true);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-extrabold mb-1">Forgot password</h1>
        {done ? (
          <p className="text-sm text-gray-600 mt-4">
            If this email is registered, a reset link was sent (valid 30 minutes).
          </p>
        ) : (
          <form onSubmit={submit} className="mt-4">
            <Input label="Email" type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button block disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</Button>
          </form>
        )}
        <div className="mt-6 rounded-lg bg-paper border border-gray-200 px-4 py-3">
          <p className="text-sm font-semibold mb-1">No access to that email?</p>
          <p className="text-sm text-gray-600">
            If you registered with an email you cannot open, we cannot send a reset
            link there. <a href="/contact" className="text-navy font-semibold hover:underline">Contact the admin</a> —
            after verifying your identity, the admin can update your email and reset
            your password manually.
          </p>
        </div>
      </div>
    </div>
  );
}
