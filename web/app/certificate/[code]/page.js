'use client';
import { useEffect, useState } from 'react';
import { api, API_BASE } from '@/lib/api';

// Design C — Dark Premium (screen version). PDF bhi bilkul yahi design hai.
export default function CertificateView({ params }) {
  const code = (params.code || '').toUpperCase();
  const [cert, setCert] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/certificates/${code}`).then((d) => setCert(d.certificate)).catch((e) => setError(e.message));
  }, [code]);

  if (error) return <p className="text-center py-16 text-red-600 font-semibold">{error}</p>;
  if (!cert) return <p className="text-center py-16">Loading certificate…</p>;

  const bands = [
    ['LISTENING', cert.listeningBand], ['READING', cert.readingBand],
    ['WRITING', cert.writingBand], ['SPEAKING', cert.speakingBand],
  ].filter(([, v]) => v);
  const date = new Date(cert.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="rounded-3xl p-2 shadow-2xl" style={{ background: '#071733' }}>
        <div className="rounded-3xl px-6 py-10 sm:px-12 text-center relative overflow-hidden"
          style={{ background: '#0B2149', border: '2px solid #C9A227', outline: '1px solid #C9A227', outlineOffset: '-10px' }}>
          <p className="tracking-[0.35em] font-serif font-bold text-2xl sm:text-3xl" style={{ color: '#E8C766' }}>BANDMUFT</p>
          <p className="text-[11px] tracking-[0.3em] mt-1" style={{ color: '#A9B6CC' }}>FREE IELTS PRACTICE PLATFORM</p>
          <div className="mx-auto my-5 h-px w-56" style={{ background: '#C9A227' }} />
          <h1 className="font-serif font-bold text-3xl sm:text-4xl" style={{ color: '#F7EFDC' }}>Certificate of Achievement</h1>
          <p className="mt-4 text-sm" style={{ color: '#A9B6CC' }}>This certificate is proudly presented to</p>
          <p className="font-serif italic text-3xl sm:text-4xl my-2" style={{ color: '#E8C766' }}>{cert.name}</p>
          <p className="text-sm max-w-lg mx-auto" style={{ color: '#A9B6CC' }}>
            for successfully completing <span style={{ color: '#F7EFDC' }}>{cert.testTitle}</span> with an Overall Band Score of
          </p>
          <p className="font-serif font-bold text-6xl my-3" style={{ color: '#E8C766' }}>{cert.overallBand}</p>

          <div className="flex flex-wrap justify-center gap-3 my-6">
            {bands.map(([label, val]) => (
              <div key={label} className="w-28 py-3" style={{ border: '1px solid #C9A227' }}>
                <p className="text-[10px] font-bold tracking-widest" style={{ color: '#A9B6CC' }}>{label}</p>
                <p className="font-serif font-bold text-2xl" style={{ color: '#F7EFDC' }}>{val}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8 text-left">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full flex flex-col items-center justify-center shrink-0"
                style={{ background: '#C9A227', border: '2px solid #071733', boxShadow: '0 0 0 3px #C9A227' }}>
                <span className="font-serif font-bold" style={{ color: '#071733' }}>BM</span>
                <span className="text-[7px] font-bold tracking-widest" style={{ color: '#071733' }}>VERIFIED</span>
              </div>
              <div className="text-xs" style={{ color: '#A9B6CC' }}>
                <p>Certificate ID: <span style={{ color: '#F7EFDC' }}>{cert.code}</span></p>
                <p>Issued: <span style={{ color: '#F7EFDC' }}>{date}</span></p>
              </div>
            </div>
            <div className="text-center">
              <p className="font-serif italic text-lg" style={{ color: '#E8C766' }}>BandMuft Assessment Board</p>
              <div className="h-px w-48 mx-auto my-1" style={{ background: '#C9A227' }} />
              <p className="text-[10px] tracking-widest" style={{ color: '#A9B6CC' }}>ASSESSMENT BOARD</p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-1.5 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${API_BASE}/api/v1/certificates/${cert.code}/qr`} alt={`QR code to verify ${cert.code}`} width={76} height={76} />
              </div>
              <p className="text-[10px] mt-1" style={{ color: '#A9B6CC' }}>Scan to verify</p>
            </div>
          </div>

          <p className="text-[10px] mt-8" style={{ color: '#7787A0' }}>
            Practice assessment only — not an official IELTS result. Not affiliated with British Council, IDP or Cambridge.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mt-8">
        <a className="btn-primary btn-sm" href={`${API_BASE}/api/v1/certificates/${cert.code}/pdf`}>Download PDF</a>
        <a className="btn-secondary btn-sm" href={`/verify-certificate?code=${cert.code}`}>Open verify page</a>
        <a className="btn-ghost btn-sm" href="/dashboard">Back to dashboard</a>
      </div>
    </div>
  );
}
