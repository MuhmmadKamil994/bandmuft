import './globals.css';

export const metadata = {
  title: 'BandMuft — Free IELTS Mock Tests',
  description: 'Free IELTS Listening, Reading, Writing and Speaking mock tests with instant band scores. 100% free, no hidden charges.',
};

// BRAND — naam aik jagah. Final naam aate hi sirf yahan badlo.
export const BRAND = 'BandMuft';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="bg-navy text-white">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-2xl font-extrabold tracking-wide">
              {BRAND}
              <span className="block text-[11px] font-medium text-gold tracking-normal">
                Free IELTS Mock Tests
              </span>
            </a>
            <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium">
              <a href="/mock" className="hover:text-gold">Mock Test</a>
              <a href="/band-calculator" className="hover:text-gold">Band Calculator</a>
              <a href="/guides" className="hover:text-gold">Guides</a>
              <a href="/login" className="btn-secondary btn-sm !border-white !text-white hover:!bg-white hover:!text-navy">
                Login
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-navy-dark text-white/70 text-sm mt-16">
          <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row gap-4 justify-between">
            <p>© {new Date().getFullYear()} {BRAND}. Free forever at launch.</p>
            <p className="text-xs max-w-md">
              Practice platform only — not affiliated with or endorsed by IELTS,
              British Council, IDP or Cambridge. Mock scores are not official results.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
