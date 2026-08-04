'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const STATUS_CONFIG = {
  operational: { label: 'Operational', color: '#3fca7a', bg: 'rgba(63,202,122,0.12)', icon: '🟢' },
  suspended:   { label: 'Suspended',   color: '#f97070', bg: 'rgba(239,68,68,0.12)',  icon: '🔴' },
  delayed:     { label: 'Delayed',     color: '#ffb432', bg: 'rgba(255,180,50,0.12)', icon: '🟡' },
  maintenance: { label: 'Maintenance', color: '#1E90FF', bg: 'rgba(30,144,255,0.12)', icon: '🔧' },
};

export default function TrainStatusBanner() {
  const [trains,      setTrains]      = useState([]);
  const [modalOpen,   setModalOpen]   = useState(false);
  const [filter,      setFilter]      = useState('all');
  const [dismissed,   setDismissed]   = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'train_status'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => {
        // Suspended pehle, phir delayed, maintenance, operational
        const order = { suspended: 0, delayed: 1, maintenance: 2, operational: 3 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      });
      setTrains(data);
    });
    return unsub;
  }, []);

  // Body scroll lock jab modal open ho
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalOpen]);

  if (trains.length === 0 || dismissed) return null;

  const suspendedCount  = trains.filter(t => t.status === 'suspended').length;
  const delayedCount    = trains.filter(t => t.status === 'delayed').length;
  const maintenanceCount= trains.filter(t => t.status === 'maintenance').length;

  const filtered = filter === 'all' ? trains : trains.filter(t => t.status === filter);

  const FILTER_TABS = [
    { key: 'all',         label: `All (${trains.length})`                   },
    { key: 'suspended',   label: `🔴 Suspended (${suspendedCount})`         },
    { key: 'delayed',     label: `🟡 Delayed (${delayedCount})`             },
    { key: 'maintenance', label: `🔧 Maintenance (${maintenanceCount})`     },
    { key: 'operational', label: `🟢 Operational (${trains.filter(t => t.status === 'operational').length})` },
  ];

  return (
    <>
      {/* ── Banner ── */}
      <div style={{
        background: suspendedCount > 0
          ? 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))'
          : 'linear-gradient(135deg, rgba(255,180,50,0.15), rgba(255,180,50,0.05))',
        borderBottom: suspendedCount > 0
          ? '1px solid rgba(239,68,68,0.25)'
          : '1px solid rgba(255,180,50,0.25)',
        padding: '10px 0',
      }}>
        <div className="container" style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '16px' }}>🚦</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
              Train Status Update:
            </span>
            {suspendedCount > 0 && (
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#f97070' }}>
                {suspendedCount} train{suspendedCount > 1 ? 's' : ''} suspended
              </span>
            )}
            {delayedCount > 0 && (
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffb432' }}>
                · {delayedCount} delayed
              </span>
            )}
            {maintenanceCount > 0 && (
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1E90FF' }}>
                · {maintenanceCount} under maintenance
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em',
                textTransform: 'uppercase', color: '#fff',
                background: suspendedCount > 0 ? '#f97070' : '#ffb432',
                border: 'none', borderRadius: '100px',
                padding: '8px 18px', cursor: 'pointer',
              }}
            >
              View All →
            </button>
            <button
              onClick={() => setDismissed(true)}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                fontSize: '16px', cursor: 'pointer', padding: '4px',
              }}
            >✕</button>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div
          onClick={() => setModalOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 998,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg2)', border: '1px solid var(--border)',
              borderRadius: '24px', width: '100%', maxWidth: '640px',
              maxHeight: '85vh', display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '4px' }}>
                  Live Updates
                </div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', textTransform: 'uppercase', color: 'var(--text)', lineHeight: 1 }}>
                  🚦 Train Status Dashboard
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--muted)', borderRadius: '50%', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >✕</button>
            </div>

            {/* Filter Tabs */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  style={{
                    fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '6px 14px',
                    borderRadius: '100px', cursor: 'pointer', border: 'none',
                    background: filter === tab.key ? 'var(--accent)' : 'var(--bg3)',
                    color: filter === tab.key ? '#fff' : 'var(--muted)',
                    outline: filter === tab.key ? 'none' : '1px solid var(--border2)',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Train List */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '1rem 1.5rem' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                  No trains in this category.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filtered.map(train => {
                    const cfg = STATUS_CONFIG[train.status] || STATUS_CONFIG.operational;
                    return (
                      <div key={train.id} style={{
                        background: cfg.bg,
                        border: `1px solid ${cfg.color}33`,
                        borderRadius: '14px', padding: '14px 18px',
                        display: 'flex', alignItems: 'center', gap: '14px',
                      }}>
                        <div style={{ fontSize: '24px', flexShrink: 0 }}>{cfg.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>
                            {train.name}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {train.route}
                          </div>
                          {train.reason && (
                            <div style={{ fontSize: '11px', color: cfg.color, marginTop: '4px', fontWeight: 600 }}>
                              ℹ {train.reason}
                            </div>
                          )}
                        </div>
                        <span style={{
                          fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em',
                          textTransform: 'uppercase', padding: '4px 12px',
                          borderRadius: '100px', flexShrink: 0,
                          background: cfg.color + '22', color: cfg.color,
                          border: `1px solid ${cfg.color}44`,
                        }}>
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--muted)', textAlign: 'center' }}>
              Data updated in real-time by RaiLoversPK team
            </div>
          </div>
        </div>
      )}
    </>
  );
}