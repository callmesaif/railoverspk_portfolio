'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const EMPTY_POLL = {
  question: '',
  options:  [{ label: '', votes: 0 }, { label: '', votes: 0 }],
  isActive: true,
};

export default function PollForm({ existing, id }) {
  const router  = useRouter();
  const [form, setForm]   = useState(existing ?? EMPTY_POLL);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  function setQuestion(val) {
    setForm(p => ({ ...p, question: val }));
  }

  function setOption(index, val) {
    setForm(p => {
      const opts = [...p.options];
      opts[index] = { ...opts[index], label: val };
      return { ...p, options: opts };
    });
  }

  function addOption() {
    setForm(p => ({ ...p, options: [...p.options, { label: '', votes: 0 }] }));
  }

  function removeOption(index) {
    if (form.options.length <= 2) return; // minimum 2 options
    setForm(p => ({ ...p, options: p.options.filter((_, i) => i !== index) }));
  }

  function toggleActive() {
    setForm(p => ({ ...p, isActive: !p.isActive }));
  }

  async function handleSave() {
    if (!form.question.trim()) { setError('Question is required.'); return; }
    if (form.options.some(o => !o.label.trim())) { setError('All options must have a label.'); return; }
    setError('');
    setSaving(true);
    try {
      const data = {
        question:  form.question.trim(),
        options:   form.options.map(o => ({ label: o.label.trim(), votes: o.votes || 0 })),
        isActive:  form.isActive,
        updatedAt: serverTimestamp(),
      };

      if (id) {
        await setDoc(doc(db, 'polls', id), data, { merge: true });
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'polls'), data);
      }
      router.push('/admin/polls');
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && <div style={ERROR}>{error}</div>}

      {/* Question */}
      <div>
        <label style={LABEL}>Poll Question *</label>
        <input
          value={form.question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="e.g. Which Pakistan Railways train is your favourite?"
          style={INPUT}
        />
      </div>

      {/* Options */}
      <div>
        <label style={LABEL}>Answer Options * (min 2)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {form.options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={OPT_NUM}>{i + 1}</div>
              <input
                value={opt.label}
                onChange={e => setOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                style={{ ...INPUT, flex: 1 }}
              />
              {/* Votes (read-only on existing) */}
              {existing && (
                <div style={VOTES_BOX}>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Votes</span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#1E90FF' }}>{opt.votes || 0}</span>
                </div>
              )}
              <button
                onClick={() => removeOption(i)}
                disabled={form.options.length <= 2}
                style={REMOVE_BTN}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button onClick={addOption} style={ADD_OPT_BTN}>
          + Add Option
        </button>
      </div>

      {/* Active toggle */}
      <div style={TOGGLE_CARD}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Poll Status</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            {form.isActive ? 'Poll is visible and accepting votes.' : 'Poll is hidden from the public.'}
          </div>
        </div>
        <button onClick={toggleActive} style={TOGGLE_BTN(form.isActive)}>
          <span style={TOGGLE_KNOB(form.isActive)} />
        </button>
      </div>

      {/* Actions */}
      <div style={ACTIONS}>
        <button onClick={() => router.push('/admin/polls')} style={BTN_CANCEL} disabled={saving}>
          Cancel
        </button>
        <button onClick={handleSave} style={BTN_SAVE} disabled={saving}>
          {saving ? 'Saving…' : id ? '✓ Save Changes' : '✓ Create Poll'}
        </button>
      </div>
    </div>
  );
}

const LABEL      = { display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' };
const INPUT      = { background: '#131320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 16px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, outline: 'none', width: '100%', display: 'block' };
const OPT_NUM    = { width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(30,144,255,0.15)', border: '1px solid rgba(30,144,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900, color: '#1E90FF', flexShrink: 0 };
const VOTES_BOX  = { background: '#131320', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '60px', gap: '2px' };
const REMOVE_BTN = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#f97070', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', flexShrink: 0 };
const ADD_OPT_BTN= { marginTop: '10px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', background: 'rgba(30,144,255,0.08)', border: '1px dashed rgba(30,144,255,0.3)', borderRadius: '10px', padding: '11px 20px', cursor: 'pointer', width: '100%' };
const TOGGLE_CARD= { background: '#0c0c12', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' };
const TOGGLE_BTN = (on) => ({ width: '48px', height: '26px', borderRadius: '13px', background: on ? '#1E90FF' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' });
const TOGGLE_KNOB= (on) => ({ position: 'absolute', top: '3px', left: on ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' });
const ACTIONS    = { display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' };
const BTN_CANCEL = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_SAVE   = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', border: 'none', borderRadius: '100px', padding: '11px 24px', cursor: 'pointer' };
const ERROR      = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#f97070', fontWeight: 600 };
