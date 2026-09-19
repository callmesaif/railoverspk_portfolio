'use client';
import { useEffect, useState } from 'react';
import {
  collection, onSnapshot, addDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy, where, getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

const ALERT_TYPES = [
  { value: 'suspended',   label: '🔴 Suspended',         color: '#f97070' },
  { value: 'delayed',     label: '🟡 Delayed',            color: '#ffb432' },
  { value: 'diverted',    label: '🔀 Diverted',           color: '#a78bfa' },
  { value: 'maintenance', label: '🔧 Maintenance',        color: '#1E90FF' },
  { value: 'restored',    label: '🟢 Service Restored',   color: '#3fca7a' },
];

const REASONS = [
  'Track maintenance',
  'Engine failure',
  'Flood / track damage',
  'Fog / weather conditions',
  'Operational reasons',
  'Staff shortage',
  'Signal failure',
  'Collision / accident',
  'Other (see details)',
];

export default function AdminReports() {
  const [trains,   setTrains]   = useState([]);
  const [reports,  setReports]  = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error,    setError]    = useState('');

  // Form state
  const [affectedTrain,    setAffectedTrain]    = useState('');
  const [alertType,        setAlertType]        = useState('suspended');
  const [reason,           setReason]           = useState('');
  const [customReason,     setCustomReason]      = useState('');
  const [details,          setDetails]          = useState('');
  const [alternativeTrains, setAlternativeTrains] = useState(['']);
  const [validUntil,       setValidUntil]       = useState('');

  // Load trains
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'trains'), where('published', '==', true)),
      snap => setTrains(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.name || '').localeCompare(b.name || '')))
    );
    return unsub;
  }, []);

  // Load reports
  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, 'daily_reports'), orderBy('createdAt', 'desc')),
      snap => setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  function addAlternative()    { setAlternativeTrains(p => [...p, '']); }
  function removeAlternative(i){ setAlternativeTrains(p => p.filter((_, idx) => idx !== i)); }
  function updateAlternative(i, val) {
    setAlternativeTrains(p => { const n = [...p]; n[i] = val; return n; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!affectedTrain) { setError('Affected train select karo.'); return; }

    const finalReason = reason === 'Other (see details)' ? customReason : reason;
    if (!finalReason.trim()) { setError('Reason likhna zaruri hai.'); return; }

    setSaving(true);
    try {
      const train = trains.find(t => t.id === affectedTrain);
      const alts  = alternativeTrains.map(id => {
        const t = trains.find(x => x.id === id);
        return t ? { id: t.id, name: t.name, number: t.number } : null;
      }).filter(Boolean);

      await addDoc(collection(db, 'daily_reports'), {
        affectedTrainId:   affectedTrain,
        affectedTrainName: train?.name || '',
        affectedTrainNum:  train?.number || '',
        alertType,
        reason:            finalReason.trim(),
        details:           details.trim(),
        alternativeTrains: alts,
        validUntil:        validUntil || null,
        active:            true,
        createdAt:         serverTimestamp(),
        date:              new Date().toISOString().split('T')[0],
      });

      // Reset form
      setAffectedTrain(''); setAlertType('suspended');
      setReason(''); setCustomReason(''); setDetails('');
      setAlternativeTrains(['']); setValidUntil('');
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setDeleting(id);
    try { await deleteDoc(doc(db, 'daily_reports', id)); }
    catch (err) { console.error(err); }
    finally { setDeleting(null); }
  }

  const alertConfig = (type) => ALERT_TYPES.find(a => a.value === type) || ALERT_TYPES[0];

  return (
    <main style={PAGE}>
      {/* Header */}
      <div style={HEADER}>
        <div>
          <div style={EYEBROW}>Operations</div>
          <h1 style={HEADING}>Daily Service Reports</h1>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} style={FORM_WRAP}>
        <div style={SECTION_LABEL}>+ New Alert</div>

        {error && <div style={ERROR}>{error}</div>}

        {/* Row 1: Train + Alert type */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Affected Train *">
            <select value={affectedTrain} onChange={e => setAffectedTrain(e.target.value)} style={INPUT}>
              <option value="">— Select train —</option>
              {trains.map(t => (
                <option key={t.id} value={t.id}>
                  {t.number ? `#${t.number} ` : ''}{t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Alert Type *">
            <select value={alertType} onChange={e => setAlertType(e.target.value)} style={INPUT}>
              {ALERT_TYPES.map(a => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Row 2: Reason */}
        <Field label="Reason *">
          <select value={reason} onChange={e => setReason(e.target.value)} style={INPUT}>
            <option value="">— Select reason —</option>
            {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>

        {reason === 'Other (see details)' && (
          <Field label="Custom Reason">
            <input
              value={customReason}
              onChange={e => setCustomReason(e.target.value)}
              placeholder="Reason likhein…"
              style={INPUT}
            />
          </Field>
        )}

        {/* Details */}
        <Field label="Additional Details (optional)">
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            placeholder="e.g. Karakoram Express suspend — passengers ko Pak Business aur Karachi Express mein adjust kiya ja raha hai..."
            rows={3}
            style={{ ...INPUT, resize: 'vertical', borderRadius: '10px', lineHeight: 1.6 }}
          />
        </Field>

        {/* Alternative Trains */}
        <Field label="Alternative Trains (passengers adjust karein)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alternativeTrains.map((val, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px' }}>
                <select value={val} onChange={e => updateAlternative(i, e.target.value)} style={{ ...INPUT, flex: 1 }}>
                  <option value="">— Select train —</option>
                  {trains.filter(t => t.id !== affectedTrain).map(t => (
                    <option key={t.id} value={t.id}>
                      {t.number ? `#${t.number} ` : ''}{t.name}
                    </option>
                  ))}
                </select>
                {alternativeTrains.length > 1 && (
                  <button type="button" onClick={() => removeAlternative(i)} style={REMOVE_BTN}>✕</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addAlternative} style={ADD_BTN}>+ Add Alternative</button>
          </div>
        </Field>

        {/* Valid Until */}
        <Field label="Valid Until (optional)">
          <input
            type="date"
            value={validUntil}
            onChange={e => setValidUntil(e.target.value)}
            style={INPUT}
          />
        </Field>

        <button type="submit" disabled={saving} style={saving ? { ...SUBMIT_BTN, opacity: 0.6 } : SUBMIT_BTN}>
          {saving ? 'Publishing…' : '📢 Publish Alert'}
        </button>
      </form>

      {/* ── Active Reports ── */}
      <div style={{ marginTop: '2.5rem' }}>
        <div style={SECTION_LABEL}>Active Alerts ({reports.length})</div>

        {reports.length === 0 && (
          <div style={EMPTY}>Aaj koi alerts nahi hain. ✅</div>
        )}

        {reports.map(r => {
          const cfg = alertConfig(r.alertType);
          return (
            <div key={r.id} style={{ ...REPORT_CARD, borderLeft: `3px solid ${cfg.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  {/* Train name + badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                      {r.affectedTrainNum ? `#${r.affectedTrainNum} ` : ''}{r.affectedTrainName}
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 900, padding: '3px 10px', borderRadius: '100px', background: cfg.color + '22', color: cfg.color, border: `1px solid ${cfg.color}44` }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                      {r.date} {r.createdAt?.toDate ? '· ' + r.createdAt.toDate().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  {/* Reason */}
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                    📌 {r.reason}
                  </div>

                  {/* Details */}
                  {r.details && (
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', lineHeight: 1.6 }}>
                      {r.details}
                    </div>
                  )}

                  {/* Alternative trains */}
                  {r.alternativeTrains?.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Alternatives:</span>
                      {r.alternativeTrains.map(t => (
                        <span key={t.id} style={{ fontSize: '11px', fontWeight: 700, color: '#3fca7a', background: 'rgba(63,202,122,0.1)', border: '1px solid rgba(63,202,122,0.25)', padding: '3px 10px', borderRadius: '100px' }}>
                          🚆 {t.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Valid until */}
                  {r.validUntil && (
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
                      ⏳ Valid until: {r.validUntil}
                    </div>
                  )}
                </div>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                  style={deleting === r.id ? { ...DEL_BTN, opacity: 0.5 } : DEL_BTN}
                >
                  {deleting === r.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
    </div>
  );
}

const PAGE         = { padding: '2.5rem', fontFamily: "'Inter', sans-serif", color: '#fff', maxWidth: '900px' };
const HEADER       = { marginBottom: '2rem' };
const EYEBROW      = { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '6px' };
const HEADING      = { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', textTransform: 'uppercase', lineHeight: 1, marginBottom: '4px' };
const FORM_WRAP    = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '14px' };
const SECTION_LABEL= { fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '4px' };
const LABEL        = { display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' };
const INPUT        = { width: '100%', background: '#131320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', outline: 'none', display: 'block', boxSizing: 'border-box' };
const ERROR        = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: '#f97070', fontWeight: 600 };
const SUBMIT_BTN   = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', border: 'none', borderRadius: '100px', padding: '13px 28px', cursor: 'pointer', alignSelf: 'flex-start' };
const ADD_BTN      = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1E90FF', background: 'rgba(30,144,255,0.08)', border: '1px dashed rgba(30,144,255,0.3)', borderRadius: '10px', padding: '9px', cursor: 'pointer', width: '100%' };
const REMOVE_BTN   = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#f97070', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', flexShrink: 0 };
const REPORT_CARD  = { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '12px' };
const DEL_BTN      = { fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'rgba(249,112,112,0.12)', color: '#f97070', border: '1px solid rgba(249,112,112,0.25)', padding: '5px 12px', borderRadius: '100px', cursor: 'pointer', flexShrink: 0 };
const EMPTY        = { padding: '2.5rem', textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.3)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px' };