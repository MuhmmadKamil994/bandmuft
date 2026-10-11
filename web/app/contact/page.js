'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.post('/contact', form);
      setDone(true);
    } catch (err) { setError(err.message); }
    setBusy(false);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-extrabold mb-2">Contact Us</h1>
      <p className="text-gray-600 mb-8">
        Questions, problems with your account, certificate issues — send us a message
        and we will get back to you.
      </p>

      <div className="grid gap-4 mb-8">
        <div className="card">
          <h2 className="font-bold mb-2">What can we help with?</h2>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
            <li><b>Forgot your password</b> and cannot access your email — the admin can verify your identity and reset it manually.</li>
            <li><b>Registered with the wrong email</b> — the admin can update your account email.</li>
            <li><b>Certificate problems</b> — a wrong name, a missing certificate, or a verification issue.</li>
            <li><b>Test problems</b> — audio not playing, a result that looks wrong, or anything else on the site.</li>
          </ul>
        </div>
        <div className="card">
          <h2 className="font-bold mb-2">Good to know</h2>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
            <li>We usually reply <b>within 24 hours</b>.</li>
            <li>Use an email address you can actually read — our reply goes there.</li>
            <li>We will <b>never</b> ask for your password. If anyone does, it is not us.</li>
          </ul>
        </div>
      </div>

      <div className="card">
        <h2 className="font-bold text-lg mb-4">Send a message</h2>
        {done ? (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-4 text-center">
            <p className="font-bold text-green-800 mb-1">Message sent ✓</p>
            <p className="text-sm text-gray-600">Thank you for writing to us. We usually reply within 24 hours — please check your inbox (and spam folder).</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <Input label="Your name" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Your email (for our reply)" type="email" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <label className="label">Your message</label>
            <textarea className="input min-h-36 mb-4" rows={6} required minLength={10}
              placeholder="Describe your problem. If it is about your account, include your account name and the email you registered with."
              value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            {error && <p className="text-sm text-red-600 mb-4 font-semibold">{error}</p>}
            <Button block disabled={busy}>{busy ? 'Sending…' : 'Send message'}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
