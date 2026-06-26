'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function AdminLoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router                  = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/admin');
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={PAGE}>
      <div style={CARD}>
        {/* Logo */}
        <div style={LOGO}>
          <span style={DOT} />
          RAILOVERSPK
        </div>
        <div style={SUBTITLE}>Admin Panel</div>

        <h1 style={HEADING}>Sign In</h1>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={LABEL}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@railoverspk.com"
              style={INPUT}
            />
          </div>
          <div>
            <label style={LABEL}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={INPUT}
            />
          </div>

          {error && (
            <div style={ERROR_BOX}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...SUBMIT,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>
      </div>
    </div>
  );
}

const PAGE = {
  minHeight: '100vh',
  background: '#050508',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Inter', sans-serif",
  padding: '2rem',
};
const CARD = {
  width: '100%',
  maxWidth: '400px',
  background: '#0c0c12',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '24px',
  padding: '2.5rem',
};
const LOGO = {
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: '1.4rem',
  letterSpacing: '0.1em',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '4px',
};
const DOT = {
  width: '7px', height: '7px',
  borderRadius: '50%', background: '#1E90FF', flexShrink: 0,
};
const SUBTITLE = {
  fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em',
  textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '2rem',
};
const HEADING = {
  fontFamily: "'Bebas Neue', sans-serif",
  fontSize: '2.5rem', textTransform: 'uppercase',
  color: '#fff', marginBottom: '1.75rem', lineHeight: 1,
};
const LABEL = {
  display: 'block', fontSize: '10px', fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.4)', marginBottom: '8px',
};
const INPUT = {
  width: '100%', background: '#131320',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px', padding: '13px 16px',
  color: '#fff', fontFamily: "'Inter', sans-serif",
  fontSize: '13px', fontWeight: 500, outline: 'none',
};
const ERROR_BOX = {
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.25)',
  borderRadius: '10px', padding: '12px 16px',
  fontSize: '12px', fontWeight: 600,
  color: '#f97070',
};
const SUBMIT = {
  background: '#1E90FF', color: '#fff',
  border: 'none', borderRadius: '100px',
  padding: '14px', fontFamily: "'Inter', sans-serif",
  fontSize: '11px', fontWeight: 900,
  letterSpacing: '0.16em', textTransform: 'uppercase',
  marginTop: '4px',
};
