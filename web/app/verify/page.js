'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function OtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);

  async function verify(e) {
    e.preventDefault();
    const clean = code.trim();
    if (!/^\d{6}$/.test(clean)) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }
    setBusy(true); setError('');
    try {
      await api.post('/auth/verify-otp', { email, code: clean });
      router.push('/dashboard');
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  async function resend() {
    setError(''); setResent(false);
    try {
      await api.post('/auth/resend-otp', { email });
      setResent(true);
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-extrabold mb-1">Verify your email</h1>
        <p className="text-sm text-gray-600 mb-6">
          Enter the 6-digit code sent to{' '}
          <span className="font-semibold">{email || 'your email'}</span>.
        </p>
        <form onSubmit={verify}>
          <Input label="Verification code" required inputMode="numeric" maxLength={6}
            placeholder="123456"
            value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} />
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          {resent && <p className="text-sm text-green-600 mb-4">A new code was sent to your email.</p>}
          <Button block disabled={busy}>{busy ? 'Verifying…' : 'Verify'}</Button>
        </form>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Didn&apos;t get the code?{' '}
          <button onClick={resend} className="font-semibold text-navy hover:underline">Resend</button>
        </p>
      </div>
    </div>
  );
}

export default function Verify() {
  return <Suspense><OtpForm /></Suspense>;
}
