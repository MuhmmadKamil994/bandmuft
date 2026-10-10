'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function VerifyForm() {
  const params = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [cert, setCert] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function check(e) {
    e?.preventDefault();
    setBusy(true); setError(''); setCert(null);
    try {
      const d = await api.get(`/certificates/verify/${code.trim()}`);
      setCert(d.certificate);
    } catch (err) { setError('Certificate not found. Check the code and try again.'); }
    setBusy(false);
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h1 className="text-2xl font-extrabold mb-1">Verify Certificate</h1>
        <p className="text-sm text-gray-600 mb-6">Enter the certificate ID to check it is genuine.</p>
        <form onSubmit={check}>
          <Input label="Certificate ID (e.g. BM-2026-A1B2C3)" required
            value={code} onChange={(e) => setCode(e.target.value)} />
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <Button block disabled={busy}>{busy ? 'Checking…' : 'Verify'}</Button>
        </form>
        {cert && (
          <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-5 text-center">
            <p className="text-green-700 font-bold mb-3">✓ Genuine BandMuft certificate</p>
            <p className="text-2xl font-extrabold">{cert.name}</p>
            <p className="text-sm text-gray-600 mt-1">{cert.testTitle}</p>
            <p className="text-4xl font-extrabold text-navy my-3">{cert.overallBand}</p>
            <p className="text-sm text-gray-600">
              Listening {cert.listeningBand} · Reading {cert.readingBand}
            </p>
            <p className="text-xs text-gray-500 mt-3">
              Issued {new Date(cert.createdAt).toLocaleDateString()} · Mock assessment, not an official IELTS result.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Verify() {
  return <Suspense><VerifyForm /></Suspense>;
}
