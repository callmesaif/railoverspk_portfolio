'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Nav from '@/components/Nav';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const STATUS_CONFIG = {
  operational: { label: 'Operational', color: '#3fca7a', icon: '🟢' },
  suspended:   { label: 'Suspended',   color: '#f97070', icon: '🔴' },
  delayed:     { label: 'Delayed',     color: '#ffb432', icon: '🟡' },
  maintenance: { label: 'Maintenance', color: '#1E90FF', icon: '🔧' },
};

const DAY_SHORT = ['sun','mon','tue','wed','thu','fri','sat'];
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function TrainsPage() {
  const [trains,     setTrains]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [dayFilter,  setDayFilter]  = useState('today');
  const [mounted,    setMounted]    = useState(false);
  const [alerts,     setAlerts]     = useState([]);

  // Prevent SSR mismatch
  useEffect(() => { setMounted(true); }, []);

  const todayKey  = DAY_SHORT[new Date().getDay()];
  const todayName = DAY_NAMES[new Date().getDay()];

  useEffect(() => {
    // Load daily alerts
    const aq    = query(collection(db, 'daily_reports'), orderBy('createdAt', 'desc'));
    const unsub2 = onSnapshot(aq, snap => {
      const today = new Date().toISOString().split('T')[0];
      setAlerts(snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(r => r.active && (!r.validUntil || r.validUntil >= today))
      );
    });

    const q     = query(collection(db, 'trains'), where('published', '==', true));
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setTrains(data);
      setLoading(false);
    }, err => {
      console.error('Trains fetch error:', err);
      setLoading(false);
    });
    return () => { unsub(); unsub2(); };
  }, []);

  const types = useMemo(() => {
    const set = new Set(trains.map(t => t.type).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [trains]);

  const filtered = useMemo(() => {
    const activeDay = dayFilter === 'today' ? todayKey : dayFilter;
    return trains.filter(t => {
      const q           = search.toLowerCase();
      const matchSearch = !q ||
        t.name?.toLowerCase().includes(q) ||
        t.number?.toLowerCase().includes(q) ||
        t.origin?.toLowerCase().includes(q) ||
        t.destination?.toLowerCase().includes(q);
      const matchType = typeFilter === 'All' || t.type === typeFilter;
      const schedule  = t.weeklySchedule || {};
      const matchDay  = dayFilter === 'all' || schedule[activeDay] !== false;
      return matchSearch && matchType && matchDay;
    });
  }, [trains, search, typeFilter, dayFilter, todayKey]);

  if (!mounted) return null;

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav />

      {/* Header */}
      <div className="container" style={{ padding: '4rem 2.5rem 2rem' }}>
        <div className="eyebrow"><span className="eyebrow-line" />Pakistan Railways</div>
        <h1 className="font-display" style={{ fontSize: 'clamp(2.5rem,9vw,7rem)', lineHeight: 0.9, textTransform: 'uppercase', marginBottom: '1rem' }}>
          TRAIN <span style={{ color: 'var(--accent)' }}>SCHEDULE</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--muted)', maxWidth: '520px', lineHeight: 1.7 }}>
          Complete route, timings, and fare information for Pakistan Railways trains.
        </p>
      </div>


      {/* Service Alerts Banner */}
      {alerts.length > 0 && (
        <div className="container" style={{ padding: '0 2.5rem 1.5rem' }}>
          {alerts.map(alert => {
            const COLOR = {
              suspended: '#f97070', delayed: '#ffb432',
              diverted: '#a78bfa', maintenance: '#1E90FF', restored: '#3fca7a',
            }[alert.alertType] || '#ffb432';
            const ICON = {
              suspended: '🔴', delayed: '🟡', diverted: '🔀',
              maintenance: '🔧', restored: '🟢',
            }[alert.alertType] || '⚠️';
            return (
              <div key={alert.id} style={{
                background: COLOR + '11',
                border: `1px solid ${COLOR}44`,
                borderLeft: `4px solid ${COLOR}`,
                borderRadius: '14px',
                padding: '14px 18px',
                marginBottom: '10px',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{ICON}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                        {alert.affectedTrainNum ? `#${alert.affectedTrainNum} ` : ''}{alert.affectedTrainName}
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 900, padding: '2px 8px', borderRadius: '100px', background: COLOR + '22', color: COLOR, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {alert.alertType}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: alert.alternativeTrains?.length ? '8px' : 0 }}>
                      {alert.reason}{alert.details ? ` — ${alert.details}` : ''}
                    </div>
                    {alert.alternativeTrains?.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>ALTERNATIVES:</span>
                        {alert.alternativeTrains.map(t => (
                          <span key={t.id} style={{ fontSize: '11px', fontWeight: 700, color: '#3fca7a', background: 'rgba(63,202,122,0.1)', border: '1px solid rgba(63,202,122,0.25)', padding: '2px 10px', borderRadius: '100px' }}>
                            🚆 {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}>{alert.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="container" style={{ padding: '0 2.5rem 2rem' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '100px', padding: '13px 20px', maxWidth: '520px', marginBottom: '1rem' }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--accent)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search train name, number, or route…"
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'Inter', sans-serif", fontSize: '14px', flex: 1 }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '13px' }}>✕</button>
          )}
        </div>

        {/* Day filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <button onClick={() => setDayFilter('today')} style={dayFilter === 'today' ? FILTER_ACTIVE : FILTER_BTN}>
            📅 Today ({todayName})
          </button>
          <button onClick={() => setDayFilter('all')} style={dayFilter === 'all' ? FILTER_ACTIVE : FILTER_BTN}>
            All Days
          </button>
          {['mon','tue','wed','thu','fri','sat','sun'].map(d => (
            <button key={d} onClick={() => setDayFilter(d)} style={dayFilter === d ? FILTER_ACTIVE : FILTER_BTN}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={typeFilter === t ? FILTER_ACTIVE : FILTER_BTN}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Train List */}
      <div className="container" style={{ padding: '0 2.5rem 5rem' }}>
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '100px', background: 'var(--bg2)', borderRadius: '16px', border: '1px solid var(--border)', opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', fontSize: '14px', color: 'var(--muted)', border: '1px dashed var(--border2)', borderRadius: '20px' }}>
            No trains found.
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(train => {
              const cfg       = STATUS_CONFIG[train.status] || STATUS_CONFIG.operational;
              const activeDay = dayFilter === 'today' ? todayKey : dayFilter === 'all' ? todayKey : dayFilter;
              const schedule  = train.weeklySchedule || {};
              const runsToday = schedule[activeDay] !== false;
              const firstStop = train.stops?.[0];
              const lastStop  = train.stops?.[train.stops.length - 1];

              return (
                <Link key={train.id} href={`/trains/${train.id}`} style={CARD}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
                >
                  {/* Cover image */}
                  {train.coverImage && (
                    <div style={{ width: '100px', height: '70px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: 'var(--bg3)' }}>
                      <img src={train.coverImage} alt={train.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      {train.number && <span style={{ fontSize: '11px', fontWeight: 900, color: 'var(--accent)' }}>#{train.number}</span>}
                      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)' }}>{train.name}</span>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px', background: cfg.color + '22', color: cfg.color }}>
                        {cfg.icon} {cfg.label}
                      </span>
                      <span style={{
                        fontSize: '9px', fontWeight: 900, padding: '2px 8px', borderRadius: '100px',
                        background: runsToday ? 'rgba(63,202,122,0.15)' : 'rgba(239,68,68,0.15)',
                        color: runsToday ? '#3fca7a' : '#f97070',
                      }}>
                        {runsToday ? '🟢 Running' : '🔴 Not Running'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{train.origin}</span>
                      <span>→</span>
                      <span style={{ fontWeight: 600, color: 'var(--text)' }}>{train.destination}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--muted)', flexWrap: 'wrap' }}>
                      {firstStop?.departure && <span>🕐 Departs: <strong style={{ color: 'var(--text)' }}>{firstStop.departure}</strong></span>}
                      {lastStop?.arrival   && <span>🏁 Arrives: <strong style={{ color: 'var(--text)' }}>{lastStop.arrival}</strong></span>}
                      {train.totalDuration && <span>⏱ {train.totalDuration}</span>}
                      {train.totalDistance && <span>📍 {train.totalDistance}</span>}
                      {train.frequency     && <span>🔄 {train.frequency}</span>}
                    </div>
                  </div>

                  {/* Fares */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    {(train.fares || []).slice(0, 2).map((f, i) => (
                      <div key={i} style={{ marginBottom: '4px' }}>
                        <div style={{ fontSize: '9px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{f.class}</div>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: 'var(--accent)', fontStyle: 'italic' }}>{f.price}</div>
                      </div>
                    ))}
                    <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent)', marginTop: '6px' }}>View Details →</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

const FILTER_BTN    = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '7px 14px', borderRadius: '100px', cursor: 'pointer', border: 'none', background: 'var(--bg2)', color: 'var(--muted)', outline: '1px solid var(--border2)', transition: 'all 0.2s' };
const FILTER_ACTIVE = { ...FILTER_BTN, background: 'var(--accent)', color: '#fff', outline: 'none' };
const CARD          = { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none', color: 'var(--text)', transition: 'border-color 0.2s, transform 0.2s' };