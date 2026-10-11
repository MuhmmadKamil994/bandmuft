import './globals.css';
import Header from '@/components/Header';

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
        <Header brand={BRAND} />
        <main>{children}</main>
        <footer className="bg-navy-dark text-white/70 text-sm mt-16">
          <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-white text-lg font-extrabold">{BRAND}</p>
              <p className="text-xs mt-2 max-w-xs">
                Free IELTS practice — full mock tests, a topic-by-topic course,
                and verifiable certificates. Free forever at launch.
              </p>
            </div>
            <div>
              <p className="text-white font-bold mb-3">Explore</p>
              <ul className="space-y-2">
                <li><a href="/mock" className="hover:text-gold">Mock Tests</a></li>
                <li><a href="/course" className="hover:text-gold">Course</a></li>
                <li><a href="/band-calculator" className="hover:text-gold">Band Calculator</a></li>
                <li><a href="/guides" className="hover:text-gold">Guides</a></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-3">Account &amp; Help</p>
              <ul className="space-y-2">
                <li><a href="/register" className="hover:text-gold">Register Free</a></li>
                <li><a href="/login" className="hover:text-gold">Login</a></li>
                <li><a href="/dashboard" className="hover:text-gold">Dashboard</a></li>
                <li><a href="/verify-certificate" className="hover:text-gold">Verify Certificate</a></li>
                <li><a href="/contact" className="hover:text-gold">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10">
            <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row gap-3 justify-between">
              <p>© {new Date().getFullYear()} {BRAND}.</p>
              <p className="text-xs max-w-md">
                Practice platform only — not affiliated with or endorsed by IELTS,
                British Council, IDP or Cambridge. Mock scores are not official results.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
