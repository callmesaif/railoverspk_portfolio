'use client';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const STATUS_OPTIONS = [
  { value: 'operational', label: '🟢 Operational', color: '#3fca7a' },
  { value: 'suspended',   label: '🔴 Suspended',   color: '#f97070' },
  { value: 'delayed',     label: '🟡 Delayed',     color: '#ffb432' },
  { value: 'maintenance', label: '🔧 Maintenance', color: '#1E90FF' },
];

export default function TrainStatusManager() {
  const [trains,   setTrains]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');
  const [form,     setForm]     = useState({
    name: '', route: '', status: 'operational', reason: ''
  });
  const [editId,   setEditId]   = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'train_status'), snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      setTrains(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  function resetForm() {
    setForm({ name: '', route: '', status: 'operational', reason: '' });
    setEditId(null);
    setError('');
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Train name required.'); return; }
    if (!form.route.trim()) { setError('Route required.'); return; }
    setError(''); setSaving(true);
    try {
      const data = {
        name:      form.name.trim(),
        route:     form.route.trim(),
        status:    form.status,
        reason:    form.reason.trim(),
        updatedAt: serverTimestamp(),
      };
      if (editId) {
        await updateDoc(doc(db, 'train_status', editId), data);
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'train_status'), data);
      }
      resetForm();
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(train) {
    setForm({
      name:   train.name,
      route:  train.route,
      status: train.status,
      reason: train.reason || '',
    });
    setEditId(train.id);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this train status?')) return;
    await deleteDoc(doc(db, 'train_status', id));
  }

  const getStatusStyle = (status) => {
    const s = STATUS_OPTIONS.find(o => o.value === status);
    return s ? s.color : '#fff';
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: '#fff' }}>

      {/* ── Form ── */}
      <div style={{ background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '1rem' }}>
          {editId ? '✎ Edit Train Status' : '+ Add Train Status'}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px', padding: '10px 14px', fontSize: '12px', color: '#f97070', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={LABEL}>Train Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Karakoram Express" style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>Route *</label>
            <input value={form.route} onChange={e => setForm(p => ({ ...p, route: e.target.value }))}
              placeholder="e.g. Karachi → Lahore" style={INPUT} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={LABEL}>Status *</label>
            <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={INPUT}>
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={LABEL}>Reason (optional)</label>
            <input value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}
              placeholder="e.g. Track maintenance work" style={INPUT} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {editId && (
            <button onClick={resetForm} style={BTN_CANCEL}>Cancel</button>
          )}
          <button onClick={handleSave} disabled={saving} style={BTN_SAVE}>
            {saving ? 'Saving…' : editId ? '✓ Update' : '+ Add Train'}
          </button>
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div style={EMPTY}>Loading…</div>
      ) : trains.length === 0 ? (
        <div style={EMPTY}>No trains added yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {trains.map(t => (
            <div key={t.id} style={CARD}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{t.name}</span>
                  <span style={{
                    fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
                    padding: '3px 10px', borderRadius: '100px',
                    background: getStatusStyle(t.status) + '22',
                    color: getStatusStyle(t.status),
                    border: `1px solid ${getStatusStyle(t.status)}44`,
                  }}>
                    {STATUS_OPTIONS.find(o => o.value === t.status)?.label || t.status}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{t.route}</div>
                {t.reason && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>ℹ {t.reason}</div>}
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button onClick={() => handleEdit(t)} style={BTN_EDIT}>Edit</button>
                <button onClick={() => handleDelete(t.id)} style={BTN_DELETE}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const LABEL      = { display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' };
const INPUT      = { width: '100%', background: '#131320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', outline: 'none', display: 'block' };
const CARD       = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' };
const BTN_SAVE   = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', border: 'none', borderRadius: '100px', padding: '10px 22px', cursor: 'pointer' };
const BTN_CANCEL = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '10px 18px', cursor: 'pointer' };
const BTN_EDIT   = { fontSize: '10px', fontWeight: 700, color: '#1E90FF', padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(30,144,255,0.25)', background: 'rgba(30,144,255,0.08)', cursor: 'pointer' };
const BTN_DELETE = { fontSize: '10px', fontWeight: 700, color: '#f97070', padding: '7px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer' };
const EMPTY      = { padding: '2rem', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 };