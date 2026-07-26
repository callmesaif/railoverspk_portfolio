'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminLocomotivesPage() {
  const [locos,   setLocos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'locomotives'), snap => {
      setLocos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleDelete(id) {
    if (!confirm('Delete this locomotive?')) return;
    await deleteDoc(doc(db, 'locomotives', id));
  }

  async function togglePublish(id, current) {
    await updateDoc(doc(db, 'locomotives', id), { published: !current });
  }

  const filtered = locos.filter(l =>
    l.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.model?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main style={PAGE}>
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Fleet</div>
          <h1 style={HEADING}>Locomotives</h1>
        </div>
        <Link href="/admin/locomotives/new" style={BTN_PRIMARY}>+ New Locomotive</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or model…" style={SEARCH} />
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {filtered.length} locomotive{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? <div style={EMPTY}>Loading…</div>
        : filtered.length === 0 ? (
          <div style={EMPTY}>No locomotives yet. <Link href="/admin/locomotives/new" style={{ color: '#1E90FF' }}>Add one →</Link></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(l => (
              <div key={l.id} style={CARD}>
                {l.coverImage && (
                  <div style={{ width: '80px', height: '60px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, background: '#131320' }}>
                    <img src={l.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>{l.name}</span>
                    <span style={l.published ? BADGE_LIVE : BADGE_DRAFT}>{l.published ? 'Published' : 'Draft'}</span>
                    <span style={l.status === 'active' ? BADGE_ACTIVE : BADGE_RETIRED}>
                      {l.status === 'active' ? '🟢 Active' : '🔴 Retired'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                    {l.model || '—'} {l.manufacturer && `· ${l.manufacturer}`} {l.depot && `· ${l.depot}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                  <button onClick={() => togglePublish(l.id, l.published)} style={l.published ? BTN_UNPUBLISH : BTN_PUB_SM}>
                    {l.published ? 'Unpublish' : 'Publish'}
                  </button>
                  <Link href={`/admin/locomotives/${l.id}`} style={BTN_EDIT}>Edit</Link>
                  <button onClick={() => handleDelete(l.id)} style={BTN_DELETE}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
    </main>
  );
}

const PAGE        = { padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '1000px' };
const HEADER      = { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' };
const EYEBROW     = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING     = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1 };
const BTN_PRIMARY = { display: 'inline-flex', alignItems: 'center', fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', padding: '11px 20px', borderRadius: '100px', textDecoration: 'none' };
const SEARCH       = { flex: 1, background: '#0c0c12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', outline: 'none' };
const CARD          = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' };
const BADGE_LIVE    = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(63,202,122,0.15)', color: '#3fca7a', border: '1px solid rgba(63,202,122,0.25)', padding: '3px 9px', borderRadius: '100px' };
const BADGE_DRAFT   = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', padding: '3px 9px', borderRadius: '100px' };
const BADGE_ACTIVE  = { fontSize: '9px', fontWeight: 700, background: 'rgba(63,202,122,0.1)', color: '#3fca7a', padding: '3px 9px', borderRadius: '100px' };
const BADGE_RETIRED = { fontSize: '9px', fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#f97070', padding: '3px 9px', borderRadius: '100px' };
const BTN_EDIT      = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1E90FF', textDecoration: 'none', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(30,144,255,0.25)', background: 'rgba(30,144,255,0.08)' };
const BTN_PUB_SM    = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#3fca7a', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(63,202,122,0.25)', background: 'rgba(63,202,122,0.08)', cursor: 'pointer' };
const BTN_UNPUBLISH = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', cursor: 'pointer' };
const BTN_DELETE    = { fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f97070', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer' };
const EMPTY         = { padding: '3rem', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 };
