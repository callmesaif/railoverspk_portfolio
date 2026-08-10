'use client';
import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const STATUS_CONFIG = {
  operational: { label: 'Operational', color: '#3fca7a', icon: '🟢' },
  suspended:   { label: 'Suspended',   color: '#f97070', icon: '🔴' },
  delayed:     { label: 'Delayed',     color: '#ffb432', icon: '🟡' },
  maintenance: { label: 'Maintenance', color: '#1E90FF', icon: '🔧' },
};

const DAY_SHORT  = ['sun','mon','tue','wed','thu','fri','sat'];
const DAY_LABELS = { mon:'Mon', tue:'Tue', wed:'Wed', thu:'Thu', fri:'Fri', sat:'Sat', sun:'Sun' };

export default function TrainClient({ params }) {
  const { id }             = use(params);
  const [train, setTrain]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, 'trains', id)).then(snap => {
      if (snap.exists()) setTrain({ id: snap.id, ...snap.data() });
      setLoading(false);
    });
  }, [id]);

  if (loading) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <div style={LOADING}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        Loading train info…
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </main>
  );

  if (!train) return (
    <main style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Nav />
      <div style={LOADING}>Not found. <Link href="/trains" style={{ color: 'var(--accent)' }}>← All Trains</Link></div>
    </main>
  );

  const cfg      = STATUS_CONFIG[train.status] || STATUS_CONFIG.operational;
  const todayKey = DAY_SHORT[new Date().getDay()];
  const schedule = train.weeklySchedule || {};

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {/* Cover */}
      {train.coverImage && (
        <div style={{ width: '100%', aspectRatio: '16/9', maxHeight: '50vh', overflow: 'hidden', background: 'var(--bg2)', position: 'relative' }}>
          <img src={train.coverImage} alt={train.name} fetchPriority="high"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--bg) 100%)' }} />
        </div>
      )}

      <div className="container" style={{ maxWidth: '900px', padding: train.coverImage ? '0 1.5rem 5rem' : '4rem 1.5rem 5rem', marginTop: train.coverImage ? '-80px' : 0, position: 'relative', zIndex: 2 }}>

        <Link href="/trains" style={BACK_LINK}>← All Trains</Link>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div>
            {train.number && <div style={{ fontSize: '12px', fontWeight: 900, color: 'var(--accent)', letterSpacing: '0.14em', marginBottom: '6px' }}>TRAIN #{train.number}</div>}
            <h1 className="font-display" style={{ fontSize: 'clamp(2rem,7vw,5rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '10px' }}>
              {train.name}
            </h1>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', background: cfg.color + '22', color: cfg.color, border: `1px solid ${cfg.color}44` }}>
                {cfg.icon} {cfg.label}
              </span>
              {train.type && <span style={{ fontSize: '10px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px', background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>{train.type}</span>}
            </div>
          </div>
        </div>

        <div style={DIVIDER} />

        {/* Route Summary */}
        <div style={SEC_LABEL}>Route Overview</div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>From</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>{train.origin}</div>
              {train.stops?.[0]?.departure && <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700 }}>🕐 {train.stops[0].departure}</div>}
            </div>
            <div style={{ flex: 1, height: '2px', background: 'var(--accent)', borderRadius: '1px', minWidth: '40px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg2)', padding: '0 8px', fontSize: '16px' }}>🚆</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>To</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>{train.destination}</div>
              {train.stops?.[train.stops.length - 1]?.arrival && <div style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700 }}>🏁 {train.stops[train.stops.length - 1].arrival}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            {train.totalDuration && <div style={INFO_CHIP}>⏱ <strong>{train.totalDuration}</strong></div>}
            {train.totalDistance && <div style={INFO_CHIP}>📍 <strong>{train.totalDistance}</strong></div>}
            {train.frequency     && <div style={INFO_CHIP}>🔄 <strong>{train.frequency}</strong></div>}
            {train.stops?.length  && <div style={INFO_CHIP}>🛑 <strong>{train.stops.length} stops</strong></div>}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div style={SEC_LABEL}>Weekly Schedule</div>
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.entries(DAY_LABELS).map(([key, label]) => {
              const runs    = schedule[key] !== false;
              const isToday = key === todayKey;
              return (
                <div key={key} style={{
                  flex: '1', minWidth: '44px', padding: '8px 4px', borderRadius: '12px',
                  textAlign: 'center',
                  background: runs ? 'rgba(63,202,122,0.12)' : 'rgba(239,68,68,0.08)',
                  border: isToday
                    ? `2px solid ${runs ? '#3fca7a' : '#f97070'}`
                    : '1px solid transparent',
                }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
                  <div style={{ fontSize: '16px' }}>{runs ? '🟢' : '🔴'}</div>
                  {isToday && <div style={{ fontSize: '8px', color: runs ? '#3fca7a' : '#f97070', marginTop: '2px', fontWeight: 700 }}>Today</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stops Timeline */}
        {train.stops?.length > 0 && (
          <>
            <div style={SEC_LABEL}>Station Timings</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem', marginBottom: '2rem' }}>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 60px', gap: '8px', padding: '0 8px 10px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                {['Station', 'Arrival', 'Departure', 'Day'].map(h => (
                  <div key={h} style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)' }}>{h}</div>
                ))}
              </div>
              {train.stops.map((stop, i) => {
                const isFirst = i === 0;
                const isLast  = i === train.stops.length - 1;
                return (
                  <div key={i} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 60px', gap: '8px',
                    padding: '10px 8px', borderBottom: i < train.stops.length - 1 ? '1px solid var(--border)' : 'none',
                    background: (isFirst || isLast) ? 'rgba(30,144,255,0.05)' : 'transparent',
                    borderRadius: '8px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                        background: (isFirst || isLast) ? 'var(--accent)' : 'var(--border2)',
                      }} />
                      <span style={{ fontSize: '13px', fontWeight: (isFirst || isLast) ? 700 : 500, color: 'var(--text)' }}>
                        {stop.station}
                        {(isFirst || isLast) && <span style={{ fontSize: '9px', color: 'var(--accent)', marginLeft: '6px', fontWeight: 900 }}>{isFirst ? 'ORIGIN' : 'DEST'}</span>}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: stop.arrival && stop.arrival !== '--' ? 'var(--text)' : 'var(--muted)' }}>
                      {stop.arrival || '--'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: stop.departure && stop.departure !== '--' ? 'var(--accent)' : 'var(--muted)' }}>
                      {stop.departure || '--'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
                      Day {stop.day || 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Fares */}
        {train.fares?.length > 0 && (
          <>
            <div style={SEC_LABEL}>Fares & Classes</div>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem', marginBottom: '2rem' }}>
              {train.fares.map((fare, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 8px',
                  borderBottom: i < train.fares.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>
                    {fare.class}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, fontStyle: 'italic', color: 'var(--accent)' }}>
                    {fare.price}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div style={DIVIDER} />

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/trains" style={BTN_BACK}>← All Trains</Link>
          <a href="https://booking.pakrail.gov.pk" target="_blank" rel="noopener noreferrer" style={BTN_BOOK}>
            Book Ticket ↗
          </a>
        </div>
      </div>
    </main>
  );
}

const SEC_LABEL = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' };
const DIVIDER   = { height: '1px', background: 'var(--border)', margin: '2rem 0' };
const BACK_LINK = { display: 'inline-flex', fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', marginBottom: '1.5rem' };
const BTN_BACK  = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', textDecoration: 'none', padding: '11px 20px', borderRadius: '100px', border: '1px solid var(--border2)' };
const BTN_BOOK  = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: 'var(--accent)', textDecoration: 'none', padding: '11px 22px', borderRadius: '100px' };
const LOADING   = { padding: '5rem 2.5rem', textAlign: 'center', color: 'var(--muted)', fontSize: '14px' };
const INFO_CHIP = { fontSize: '12px', color: 'var(--muted)', display: 'flex', gap: '5px', alignItems: 'center' };