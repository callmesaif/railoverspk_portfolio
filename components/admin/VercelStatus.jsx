'use client';
import { useEffect, useState } from 'react';

export default function VercelStatus() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/deployments');
      const data = await res.json();
      if (data.deployments) {
        setDeployments(data.deployments);
      }
    } catch (err) {
      console.error('Failed to fetch Vercel status:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 20000); // Har 20 seconds baad Auto Refresh
    return () => clearInterval(interval);
  }, []);

  function getBadge(state) {
    switch (state) {
      case 'READY':
        return { label: '● Ready / Live', color: '#3fca7a', bg: 'rgba(63,202,122,0.1)' };
      case 'BUILDING':
      case 'INITIALIZING':
        return { label: '⏳ Building...', color: '#1E90FF', bg: 'rgba(30,144,255,0.1)' };
      case 'ERROR':
        return { label: '✕ Build Failed', color: '#f97070', bg: 'rgba(239,68,68,0.1)' };
      case 'CANCELED':
        return { label: '⊘ Canceled', color: '#888', bg: 'rgba(255,255,255,0.05)' };
      default:
        return { label: state, color: '#888', bg: 'rgba(255,255,255,0.05)' };
    }
  }

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          🚀 Vercel Deployments Status
        </h3>
        <button 
          onClick={fetchStatus} 
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
        >
          {loading ? 'Fetching...' : '🔄 Refresh'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {deployments.map(dep => {
          const badge = getBadge(dep.state);
          const commitMsg = dep.meta?.githubCommitMessage || 'Manual Deployment';
          const branch = dep.meta?.githubCommitRef || 'main';

          return (
            <div key={dep.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border2)' }}>
              <div style={{ maxWidth: '70%' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {commitMsg}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  {branch} · {new Date(dep.created).toLocaleString()}
                </div>
              </div>

              <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '100px', background: badge.bg, color: badge.color, flexShrink: 0 }}>
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}