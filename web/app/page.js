export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
          <p className="inline-block text-xs font-bold tracking-widest uppercase text-navy bg-gold rounded-full px-4 py-1.5 mb-6">
            100% Free — No hidden charges
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-4">
            Free IELTS Mock Tests.<br />
            <span className="text-gold">Instant Band Scores.</span>
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Practice Listening, Reading, Writing and Speaking with real test-style
            mocks. Get your band score in seconds — free, no signup needed for
            your first test.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/mock" className="btn-primary btn-lg">Start Free Mock Test</a>
            <a href="/band-calculator" className="btn-secondary btn-lg !border-white !text-white hover:!bg-white hover:!text-navy">
              Band Calculator
            </a>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-12 text-center">
            <div><p className="text-3xl font-extrabold text-gold">4</p><p className="text-sm text-white/70">Skills covered</p></div>
            <div><p className="text-3xl font-extrabold text-gold">0</p><p className="text-sm text-white/70">Rupees charged</p></div>
            <div><p className="text-3xl font-extrabold text-gold">~2s</p><p className="text-sm text-white/70">Band result time</p></div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-center mb-10">How it works</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            ['1', 'Take the mock', 'Test-style interface, real timer. No signup for your first test.'],
            ['2', 'Instant band score', 'Server-side marking. Your overall + skill-wise band in seconds.'],
            ['3', 'See weak areas', 'Know exactly where you lose marks, with tips to fix each.'],
            ['4', 'Get certified', 'Earn a verifiable mock-test certificate to share.'],
          ].map(([n, t, d]) => (
            <div key={n} className="card text-center">
              <p className="w-10 h-10 mx-auto rounded-full bg-navy text-gold font-extrabold flex items-center justify-center mb-3">{n}</p>
              <h3 className="font-bold mb-1">{t}</h3>
              <p className="text-sm text-gray-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 pb-16 text-center">
        <a href="/mock" className="btn-primary btn-lg">Start your free mock now</a>
      </section>
    </div>
  );
}
