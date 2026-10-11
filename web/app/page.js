const SKILLS = [
  ['🎧', 'Listening', '40 questions, 4 sections — played once, exactly like the real test, with the transcript to review afterwards.'],
  ['📖', 'Reading', '3 academic passages, 40 questions, marked instantly with the official conversion table.'],
  ['✍️', 'Writing', 'Task 1 + Task 2 with AI examiner feedback on all 4 official criteria.'],
  ['🎤', 'Speaking', 'Parts 1, 2 and 3 with your own voice — recorded, transcribed and graded by AI.'],
];

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
            Practice all four IELTS skills with real test-style mocks and a
            topic-by-topic course. Create your free account to start — it takes
            less than a minute, and your results are saved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/register" className="btn-primary btn-lg">Register Free</a>
            <a href="/mock" className="btn-secondary btn-lg !border-white !text-white hover:!bg-white hover:!text-navy">
              See the Mock Tests
            </a>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-12 text-center">
            <div><p className="text-3xl font-extrabold text-gold">4</p><p className="text-sm text-white/70">Skills covered</p></div>
            <div><p className="text-3xl font-extrabold text-gold">0</p><p className="text-sm text-white/70">Rupees charged</p></div>
            <div><p className="text-3xl font-extrabold text-gold">16</p><p className="text-sm text-white/70">Course topics</p></div>
          </div>
        </div>
      </section>

      {/* FOUR SKILLS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-center mb-3">All four skills, one full mock</h2>
        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
          A real IELTS score has four parts. Our full mock tests all four and gives
          you one overall band — plus a verifiable certificate.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SKILLS.map(([icon, t, d]) => (
            <div key={t} className="card">
              <p className="text-3xl mb-3" aria-hidden="true">{icon}</p>
              <h3 className="font-bold mb-1">{t}</h3>
              <p className="text-sm text-gray-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <h2 className="text-3xl font-extrabold text-center mb-10">How it works</h2>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            ['1', 'Register free', 'One quick form — no card, no fees, ever.'],
            ['2', 'Take the mock', 'Test-style interface with real timings for all four skills.'],
            ['3', 'Get your bands', 'Skill-by-skill bands, weak areas, and AI feedback on Writing and Speaking.'],
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

      {/* COURSE STRIP */}
      <section className="bg-navy text-white">
        <div className="max-w-6xl mx-auto px-4 py-14 text-center">
          <h2 className="text-3xl font-extrabold mb-3">Not ready for a full mock? Learn topic by topic.</h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            The free BandMuft course covers the 16 topics IELTS loves most — vocabulary,
            key ideas, reading, listening, writing and speaking, one roadmap at a time.
          </p>
          <a href="/course" className="btn-primary btn-lg">Open the Course</a>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <a href="/register" className="btn-primary btn-lg">Create your free account</a>
        <p className="text-sm text-gray-500 mt-4">Already registered? <a href="/login" className="text-navy font-semibold hover:underline">Login</a></p>
      </section>
    </div>
  );
}
