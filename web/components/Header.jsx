'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

// Header teen states mein chalta hai:
//  - loading: auth buttons ki jagah khali (flash nahi hota)
//  - logged out: Login (plain link) + Register Free (gold button)
//  - logged in: naam wala chip (dashboard) + Logout; admin ko Admin link bhi
export default function Header({ brand }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    api.get('/auth/me')
      .then((d) => { if (alive) setUser(d.user); })
      .catch(() => { if (alive) setUser(null); });
    return () => { alive = false; };
  }, [pathname]);

  async function logout() {
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    setUser(null);
    router.push('/');
    router.refresh();
  }

  return (
    <header className="bg-navy text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3 flex-wrap">
        <a href="/" className="text-2xl font-extrabold tracking-wide">
          {brand}
          <span className="block text-[11px] font-medium text-gold tracking-normal">
            Free IELTS Mock Tests
          </span>
        </a>
        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium flex-wrap">
          <a href="/mock" className="hover:text-gold">Mock Tests</a>
          <a href="/course" className="hover:text-gold">Course</a>
          <a href="/band-calculator" className="hover:text-gold hidden sm:inline">Band Calculator</a>
          <a href="/guides" className="hover:text-gold hidden sm:inline">Guides</a>
          {user === undefined && <span className="w-40 h-8" aria-hidden="true" />}
          {user === null && (
            <>
              <a href="/login" className="hover:text-gold font-semibold">Login</a>
              <a href="/register" className="btn-primary btn-sm">Register Free</a>
            </>
          )}
          {user && (
            <>
              {user.role === 'admin' && (
                <a href="/admin" className="hover:text-gold">Admin</a>
              )}
              <a href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 font-semibold">
                <span aria-hidden="true">👤</span> {user.name}
              </a>
              <button onClick={logout} className="hover:text-gold font-semibold">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
