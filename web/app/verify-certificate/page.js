'use client';
import { Suspense, useEffect, useState } from 'react';
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

  async function check(e, given) {
    e?.preventDefault();
    const c = (given ?? code).trim();
    if (!c) return;
    setBusy(true); setError(''); setCert(null);
    try {
      const d = await api.get(`/certificates/verify/${c}`);
      setCert(d.certificate);
    } catch { setError('Certificate not found. Please check the code and try again.'); }
    setBusy(false);
  }

  // QR scan se aane par (?code=...) khud check kar do
  useEffect(() => {
    const c = params.get('code');
    if (c) check(null, c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bands = cert ? [
    ['Listening', cert.listeningBand], ['Reading', cert.readingBand],
    ['Writing', cert.writingBand], ['Speaking', cert.speakingBand],
  ].filter(([, v]) => v) : [];

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="rounded-t-3xl bg-navy text-white px-6 py-8 text-center">
        <p className="text-gold font-extrabold tracking-widest text-sm mb-1">BANDMUFT</p>
        <h1 className="text-3xl font-extrabold">Verify Certificate</h1>
        <p className="text-white/75 text-sm mt-2">
          Enter the certificate ID printed on the certificate — or scan its QR code — to confirm it is genuine.
        </p>
      </div>
      <div className="card !rounded-t-none">
        <form onSubmit={check}>
          <Input label="Certificate ID (e.g. BM-2026-A1B2C3)" required
            value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          {error && <p className="text-sm text-red-600 mb-4 font-semibold">{error}</p>}
          <Button block disabled={busy}>{busy ? 'Checking…' : 'Verify'}</Button>
        </form>
      </div>

      {cert && (
        <div className="card mt-6 text-center !p-0 overflow-hidden">
          <div className="bg-green-600 text-white py-5 px-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-white text-green-600 flex items-center justify-center text-3xl font-extrabold mb-2">✓</div>
            <p className="font-extrabold text-lg">Verified — Genuine Certificate</p>
            <p className="text-white/85 text-sm">This certificate was issued by BandMuft.</p>
          </div>
          <div className="px-6 py-6">
            <p className="text-2xl font-extrabold">{cert.name}</p>
            <p className="text-sm text-gray-600 mt-1">{cert.testTitle}</p>
            <p className="text-sm text-gray-500 mt-4">Overall Band</p>
            <p className="text-6xl font-extrabold text-navy">{cert.overallBand}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              {bands.map(([k, v]) => (
                <div key={k} className="rounded-xl bg-paper py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{k}</p>
                  <p className="text-2xl font-extrabold text-navy">{v}</p>
                </div>
              ))}
            </div>
            <div className="text-left text-sm mt-6 space-y-1.5 border-t pt-4">
              <p className="flex justify-between"><span className="text-gray-500">Certificate ID</span><b>{cert.code}</b></p>
              <p className="flex justify-between"><span className="text-gray-500">Date issued</span><b>{new Date(cert.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</b></p>
              <p className="flex justify-between"><span className="text-gray-500">Test</span><b>{cert.testTitle}</b></p>
            </div>
            <p className="text-xs text-gray-400 mt-5">
              BandMuft certificates are mock-test assessments, not official IELTS results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Verify() {
  return <Suspense><VerifyForm /></Suspense>;
}
