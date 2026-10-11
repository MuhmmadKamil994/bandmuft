'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.post('/auth/register', form);
      // OTP off hai — register par seedha login ho jata hai
      router.push('/dashboard');
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-extrabold mb-1">Create free account</h1>
        <p className="text-sm text-gray-600 mb-6">Free forever at launch. No card required.</p>
        <form onSubmit={submit}>
          <Input label="Full name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Password (min 8 characters)" type="password" required minLength={8}
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <Button block disabled={busy}>{busy ? 'Creating…' : 'Create account'}</Button>
        </form>
        <p className="mt-4 text-sm text-center">
          Already have an account? <a href="/login" className="text-navy font-semibold hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}
