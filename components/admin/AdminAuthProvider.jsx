'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext(null);

export function useAdmin() {
  return useContext(AuthContext);
}

export function AdminAuthProvider({ children }) {
  const [user, setUser]       = useState(undefined); // undefined = loading
  const router                = useRouter();
  const pathname              = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      if (!u && pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
    });
    return unsub;
  }, [pathname, router]);

  // Still checking auth
  if (user === undefined) {
    return (
      <div style={LOADING_STYLE}>
        <span style={DOT_STYLE} />
        Authenticating…
      </div>
    );
  }

  // Not logged in and not on login page — redirect handled above
  if (!user && pathname !== '/admin/login') return null;

  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

const LOADING_STYLE = {
  minHeight: '100vh',
  background: '#050508',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)',
  fontFamily: "'Inter', sans-serif",
};
const DOT_STYLE = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: '#1E90FF',
  display: 'inline-block',
  animation: 'pulse 1.2s ease-in-out infinite',
};
