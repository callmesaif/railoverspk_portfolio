'use client';
import { useEffect, useState } from 'react';

const COLORS = { suspended: '#f97070', delayed: '#ffb432', diverted: '#a78bfa', maintenance: '#1E90FF', restored: '#3fca7a' };
const ICONS  = { suspended: '🔴', delayed: '🟡', diverted: '🔀', maintenance: '🔧', restored: '🟢' };

/**
 * Full-width alert strip at the very top of the homepage.
 * Reads /api/alerts (CDN-cached for a minute), so no Firebase SDK is loaded for it.
 */
export default function ServiceAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch('/api/alerts')
        .then(r => (r.ok ? r.json() : { alerts: [] }))
        .then(d => { if (alive) setAlerts(d.alerts || []); })
        .catch(() => {});
    load();
    const t = setInterval(load, 120000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div style={{ background: '#0c0005', borderBottom: '1px solid rgba(249,112,112,0.2)' }}>
      {alerts.map(alert => {
        const COLOR = COLORS[alert.alertType] || '#ffb432';
        const ICON  = ICONS[alert.alertType]  || '⚠️';
        return (
          <div key={alert.id} style={{
            borderBottom: `1px solid ${COLOR}22`,
            borderLeft: `4px solid ${COLOR}`,
            background: COLOR + '0a',
            padding: '12px 20px',
          }}>
            <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', padding: '0' }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{ICON}</span>
              <span style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: COLOR, flexShrink: 0 }}>
                {alert.alertType}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {alert.affectedTrainNum ? `#${alert.affectedTrainNum} ` : ''}{alert.affectedTrainName}
              </span>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', flex: 1 }}>
                {alert.reason}{alert.details ? ` — ${alert.details}` : ''}
              </span>
              {alert.alternativeTrains?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 700 }}>ALT:</span>
                  {alert.alternativeTrains.map(t => (
                    <span key={t.id} style={{ fontSize: '11px', fontWeight: 700, color: '#3fca7a', background: 'rgba(63,202,122,0.1)', border: '1px solid rgba(63,202,122,0.25)', padding: '2px 9px', borderRadius: '100px' }}>
                      🚆 {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
