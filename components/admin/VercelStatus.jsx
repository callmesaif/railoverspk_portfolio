'use client';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase-auth';

export default function VercelStatus() {
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchStatus() {
    setLoading(true);
    setError('');
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Sign in as an administrator to view deployments.');

      const token = await user.getIdToken();
      const res = await fetch('/api/admin/deployments', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Unable to load deployment status.');
      }

      setDeployments(Array.isArray(data.deployments) ? data.deployments : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch deployment status.');
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 20000);
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
        return { label: state || 'Unknown', color: '#888', bg: 'rgba(255,255,255,0.05)' };
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
          disabled={loading}
          style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: loading ? 'wait' : 'pointer', fontSize: '12px', fontWeight: 700 }}
        >
          {loading ? 'Fetching...' : '🔄 Refresh'}
        </button>
      </div>

      {error && <p role="alert" style={{ color: '#f97070', fontSize: '12px', marginBottom: '12px' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!loading && !error && deployments.length === 0 && (
          <p style={{ color: 'var(--muted)', fontSize: '12px' }}>No recent deployments found.</p>
        )}
        {deployments.map(dep => {
          const badge = getBadge(dep.state);
          return (
            <div key={dep.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg)', borderRadius: '10px', border: '1px solid var(--border2)' }}>
              <div style={{ maxWidth: '70%' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {dep.commitMessage || 'Manual Deployment'}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--muted)' }}>
                  {dep.branch || 'main'} · {dep.createdAt ? new Date(dep.createdAt).toLocaleString() : 'Date unavailable'}
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
