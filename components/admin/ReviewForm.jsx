'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const EMPTY = {
  name:        '',
  route:       '',
  coverImage:  '',
  videoUrl:    '',
  punctuality: 0,
  cleanliness: 0,
  comfort:     0,
  food:        0,
  fares:       [{ class: '', price: '' }],
  summary:     '',
  published:   false,
};

export default function ReviewForm({ existing, id }) {
  const router = useRouter();
  const [form, setForm]     = useState(existing ?? EMPTY);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  function set(key, val) {
    setForm(p => ({ ...p, [key]: val }));
  }

  function setFare(i, key, val) {
    setForm(p => {
      const fares = [...p.fares];
      fares[i] = { ...fares[i], [key]: val };
      return { ...p, fares };
    });
  }
  function addFare()    { setForm(p => ({ ...p, fares: [...p.fares, { class: '', price: '' }] })); }
  function removeFare(i){ setForm(p => ({ ...p, fares: p.fares.filter((_, idx) => idx !== i) })); }

  async function handleSave(pub = null) {
    if (!form.name.trim()) { setError('Train name is required.'); return; }
    setError(''); setSaving(true);
    try {
      const data = {
        name:        form.name.trim(),
        route:       form.route.trim(),
        coverImage:  form.coverImage.trim(),
        videoUrl:    form.videoUrl.trim(),
        scores: {
          punctuality: Number(form.punctuality),
          cleanliness: Number(form.cleanliness),
          comfort:     Number(form.comfort),
          food:        Number(form.food),
        },
        fares:       form.fares.filter(f => f.class && f.price),
        summary:     form.summary.trim(),
        published:   pub !== null ? pub : form.published,
        updatedAt:   serverTimestamp(),
      };
      if (id) {
        await setDoc(doc(db, 'reviews', id), data, { merge: true });
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'reviews'), data);
      }
      router.push('/admin/reviews');
    } catch (e) {
      setError('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && <div style={ERROR}>{error}</div>}

      <div style={GRID}>
        {/* ── LEFT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Field label="Train Name *">
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Tezgam Express" style={INPUT} />
          </Field>

          <Field label="Route *">
            <input value={form.route} onChange={e => set('route', e.target.value)}
              placeholder="e.g. Karachi — Lahore" style={INPUT} />
          </Field>

          <Field label="Summary / Review">
            <textarea value={form.summary} onChange={e => set('summary', e.target.value)}
              placeholder="Write a short review or summary of the journey…"
              style={{ ...INPUT, minHeight: '160px', resize: 'vertical' }} />
          </Field>

          {/* ── SCORES ── */}
          <Field label="Ratings (out of 5)">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { key: 'punctuality', label: '⏱ Punctuality' },
                { key: 'cleanliness', label: '🧹 Cleanliness' },
                { key: 'comfort',     label: '💺 Comfort'     },
                { key: 'food',        label: '🍱 Food'        },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div style={SUBLABEL}>{label}</div>
                  {/* Star picker */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button"
                        onClick={() => set(key, n)}
                        style={{
                          width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                          cursor: 'pointer', fontSize: '16px',
                          background: n <= form[key] ? 'var(--accent-dim)' : '#131320',
                          color: n <= form[key] ? '#1E90FF' : 'rgba(255,255,255,0.2)',
                          transition: 'all 0.15s',
                        }}>
                        ★
                      </button>
                    ))}
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E90FF', marginLeft: '6px', lineHeight: '32px' }}>
                      {form[key]}/5
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Field>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Field label="Cover Image URL">
            {form.coverImage && (
              <div style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px', background: '#131320' }}>
                <img src={form.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => set('coverImage', '')} style={REMOVE_IMG}>✕</button>
              </div>
            )}
            <input value={form.coverImage} onChange={e => set('coverImage', e.target.value)}
              placeholder="https://i.ibb.co/… or paste ImgBB URL" style={INPUT} />
          </Field>

          <Field label="YouTube Video URL">
            <input value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)}
              placeholder="https://youtu.be/…" style={INPUT} />
          </Field>

          {/* ── FARES ── */}
          <Field label="Fares / Classes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {form.fares.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input value={f.class} onChange={e => setFare(i, 'class', e.target.value)}
                    placeholder="Class (e.g. AC Business)" style={{ ...INPUT, flex: 1 }} />
                  <input value={f.price} onChange={e => setFare(i, 'price', e.target.value)}
                    placeholder="PKR 4,200" style={{ ...INPUT, flex: 1 }} />
                  <button onClick={() => removeFare(i)} style={REMOVE_BTN}>✕</button>
                </div>
              ))}
              <button onClick={addFare} style={ADD_BTN}>+ Add Class</button>
            </div>
          </Field>

          <Field label="Status">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.published}
                onChange={e => set('published', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#1E90FF' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Published (visible on site)</span>
            </label>
          </Field>
        </div>
      </div>

      {/* ── ACTIONS ── */}
      <div style={ACTIONS}>
        <button onClick={() => router.push('/admin/reviews')} style={BTN_CANCEL} disabled={saving}>Cancel</button>
        <button onClick={() => handleSave(false)} style={BTN_DRAFT}   disabled={saving}>{saving ? 'Saving…' : 'Save Draft'}</button>
        <button onClick={() => handleSave(true)}  style={BTN_PUBLISH} disabled={saving}>{saving ? 'Publishing…' : '✓ Publish'}</button>
      </div>
    </div>
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

const GRID       = { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', alignItems: 'start' };
const LABEL      = { display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' };
const SUBLABEL   = { fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em' };
const INPUT      = { width: '100%', background: '#131320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 16px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, outline: 'none', display: 'block' };
const ERROR      = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#f97070', fontWeight: 600 };
const ACTIONS    = { display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' };
const BTN_CANCEL = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_DRAFT  = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_PUBLISH= { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', border: 'none', borderRadius: '100px', padding: '11px 24px', cursor: 'pointer' };
const REMOVE_IMG = { position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', fontSize: '12px' };
const REMOVE_BTN = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#f97070', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', flexShrink: 0 };
const ADD_BTN    = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', background: 'rgba(30,144,255,0.08)', border: '1px dashed rgba(30,144,255,0.3)', borderRadius: '10px', padding: '11px', cursor: 'pointer', width: '100%', marginTop: '4px' };
