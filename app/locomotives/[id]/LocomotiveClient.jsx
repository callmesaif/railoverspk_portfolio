'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import ShareButton from '@/components/ShareButton';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function LocomotiveClient({ params }) {
  const { id }           = use(params);
  const [loco, setLoco]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'locomotives', id)).then(snap => {
      if (snap.exists()) setLoco({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav /><div style={LOADING}>Loading locomotive…</div>
    </main>
  );

  if (!loco) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <div style={LOADING}>Not found. <Link href="/locomotives" style={{ color: 'var(--accent)' }}>← All Locomotives</Link></div>
    </main>
  );

  const shareUrl = `https://therails.pk/locomotives/${loco.id}`;

  const SPECS = [
    { label: 'Model Number',  value: loco.model        },
    { label: 'Manufacturer',  value: loco.manufacturer  },
    { label: 'Horsepower',    value: loco.horsepower    },
    { label: 'Year Built',    value: loco.yearBuilt     },
    { label: 'Depot',         value: loco.depot         },
  ].filter(s => s.value);

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {loco.coverImage && (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', maxHeight: '60vh', overflow: 'hidden', background: 'var(--bg2)' }}>
          <img src={loco.coverImage} alt={loco.name} fetchPriority="high" decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7, display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,8,0.1) 0%, rgba(5,5,8,0.55) 60%, var(--bg) 100%)' }} />
        </div>
      )}

      <div className="container" style={{ maxWidth: '780px', padding: loco.coverImage ? '0 1.5rem 5rem' : '4rem 1.5rem 5rem', marginTop: loco.coverImage ? '-80px' : 0, position: 'relative', zIndex: 2 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <Link href="/locomotives" style={BACK_LINK}>← All Locomotives</Link>
          <ShareButton url={shareUrl} title={loco.name} compact />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <span style={loco.status === 'active' ? BADGE_ACTIVE : BADGE_RETIRED}>
            {loco.status === 'active' ? '🟢 Active in Service' : '🔴 Retired'}
          </span>
        </div>

        <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem,7vw,5rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '2rem' }}>
          {loco.name}
        </h1>

        <div style={DIVIDER} />

        {/* Specs */}
        {SPECS.length > 0 && (
          <>
            <div style={SEC_LABEL}>Specifications</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {SPECS.map(({ label, value }, i) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: i < SPECS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)' }}>{label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>{value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Description */}
        {loco.description && (
          <>
            <div style={SEC_LABEL}>About This Locomotive</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '15px', lineHeight: 1.85, color: 'rgba(255,255,255,0.72)' }}>
                {loco.description.split('\n').map((p, i) =>
                  p.trim() ? <p key={i} style={{ marginBottom: '1rem' }}>{p}</p> : <br key={i} />
                )}
              </div>
            </div>
          </>
        )}

        <div style={DIVIDER} />

        <Link href="/locomotives" style={BTN_BACK}>← All Locomotives</Link>
      </div>
    </main>
  );
}

const SEC_LABEL      = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' };
const DIVIDER        = { height: '1px', background: 'var(--border)', margin: '2rem 0' };
const BACK_LINK      = { display: 'inline-flex', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none' };
const BTN_BACK       = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', padding: '11px 20px', borderRadius: '100px', border: '1px solid var(--border2)' };
const BADGE_ACTIVE   = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(63,202,122,0.12)', color: '#3fca7a', border: '1px solid rgba(63,202,122,0.25)', padding: '5px 14px', borderRadius: '100px' };
const BADGE_RETIRED  = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(239,68,68,0.1)', color: '#f97070', border: '1px solid rgba(239,68,68,0.2)', padding: '5px 14px', borderRadius: '100px' };
const LOADING        = { padding: '5rem 2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '14px', fontFamily: "'Inter', sans-serif" };
