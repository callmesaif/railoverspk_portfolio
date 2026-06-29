import Link from 'next/link';

export const metadata = { title: '404 — Page Not Found | RaiLoversPK' };

export default function NotFound() {
  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(6rem, 20vw, 14rem)', lineHeight: 1, color: 'var(--accent)', marginBottom: '0' }}>
          404
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.5rem, 5vw, 3rem)', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text)' }}>
          Track Not Found
        </div>
        <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '2.5rem', maxWidth: '360px', lineHeight: 1.7 }}>
          Looks like this train left the station. The page you're looking for doesn't exist.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#fff', background: 'var(--accent)', padding: '14px 28px', borderRadius: '100px', textDecoration: 'none' }}>
            Back to Home
          </Link>
          <Link href="/reviews" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', padding: '14px 22px', borderRadius: '100px', border: '1px solid var(--border2)', textDecoration: 'none' }}>
            View Reviews
          </Link>
        </div>
      </div>
    </main>
  );
}
