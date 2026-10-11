'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.post('/auth/login', form);
      router.push('/dashboard');
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-extrabold mb-1">Welcome back</h1>
        <p className="text-sm text-gray-600 mb-6">Login to continue your IELTS prep.</p>
        <form onSubmit={submit}>
          <Input label="Email" type="email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password" type="password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <Button block disabled={busy}>{busy ? 'Logging in…' : 'Login'}</Button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <a href="/forgot-password" className="text-navy font-semibold hover:underline">Forgot password?</a>
          <a href="/register" className="text-navy font-semibold hover:underline">Create account</a>
        </div>
        <p className="text-xs text-gray-500 mt-5 text-center">
          Locked out or registered with the wrong email?{' '}
          <a href="/contact" className="text-navy font-semibold hover:underline">Contact the admin</a>{' '}
          for help with your account.
        </p>
      </div>
    </div>
  );
}
