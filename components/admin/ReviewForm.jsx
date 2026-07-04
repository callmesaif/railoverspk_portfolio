'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const EMPTY = {
  name:        '',
  route:       '',
  coverImage:  '',
  images:      [], // gallery images
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

  const [name,        setName]        = useState(existing?.name        ?? '');
  const [route,       setRoute]       = useState(existing?.route       ?? '');
  const [coverImage,  setCoverImage]  = useState(existing?.coverImage  ?? '');
  const [images,      setImages]      = useState(existing?.images      ?? []);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUrl,    setVideoUrl]    = useState(existing?.videoUrl    ?? '');
  const [punctuality, setPunctuality] = useState(existing?.scores?.punctuality ?? 0);
  const [cleanliness, setCleanliness] = useState(existing?.scores?.cleanliness ?? 0);
  const [comfort,     setComfort]     = useState(existing?.scores?.comfort     ?? 0);
  const [food,        setFood]        = useState(existing?.scores?.food        ?? 0);
  const [fares,       setFares]       = useState(existing?.fares       ?? [{ class: '', price: '' }]);
  const [summary,     setSummary]     = useState(existing?.summary     ?? '');
  const [published,   setPublished]   = useState(existing?.published   ?? false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  // Fares
  function setFare(i, key, val) {
    setFares(prev => { const next = [...prev]; next[i] = { ...next[i], [key]: val }; return next; });
  }
  function addFare()    { setFares(prev => [...prev, { class: '', price: '' }]); }
  function removeFare(i){ setFares(prev => prev.filter((_, idx) => idx !== i)); }

  // Gallery images
  function addImage() {
    const url = newImageUrl.trim();
    if (!url) return;
    setImages(prev => [...prev, url]);
    setNewImageUrl('');
  }
  function removeImage(i) { setImages(prev => prev.filter((_, idx) => idx !== i)); }

  async function handleSave(pub = null) {
    if (!name.trim()) { setError('Train name is required.'); return; }
    setError(''); setSaving(true);
    try {
      const data = {
        name:       name.trim(),
        route:      route.trim(),
        coverImage: coverImage.trim(),
        images:     images.filter(Boolean),
        videoUrl:   videoUrl.trim(),
        scores: { punctuality: Number(punctuality), cleanliness: Number(cleanliness), comfort: Number(comfort), food: Number(food) },
        fares:      fares.filter(f => f.class && f.price),
        summary:    summary.trim(),
        published:  pub !== null ? pub : published,
        updatedAt:  serverTimestamp(),
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

  const SCORES = [
    { label: '⏱ Punctuality', val: punctuality, set: setPunctuality },
    { label: '🧹 Cleanliness', val: cleanliness, set: setCleanliness },
    { label: '💺 Comfort',     val: comfort,     set: setComfort     },
    { label: '🍱 Food',        val: food,        set: setFood        },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && <div style={ERROR}>{error}</div>}

      <div className="rl-form-grid">
        {/* ── LEFT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Field label="Train Name *">
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tezgam Express" style={INPUT} />
          </Field>

          <Field label="Route *">
            <input type="text" value={route} onChange={e => setRoute(e.target.value)} placeholder="e.g. Karachi — Lahore" style={INPUT} />
          </Field>

          <Field label="Summary / Review">
            <textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Write a full review of the journey..." style={{ ...INPUT, minHeight: '160px', resize: 'vertical' }} />
          </Field>

          {/* Scores */}
          <Field label="Ratings (out of 5)">
            <div className="rl-score-grid">
              {SCORES.map(({ label, val, set }) => (
                <div key={label}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{label}</div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => set(n)} style={{
                        width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                        cursor: 'pointer', fontSize: '16px',
                        background: n <= val ? 'var(--accent-dim)' : '#131320',
                        color: n <= val ? '#1E90FF' : 'rgba(255,255,255,0.2)',
                      }}>★</button>
                    ))}
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1E90FF', lineHeight: '32px', marginLeft: '4px' }}>{val}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </Field>
        </div>

        {/* ── RIGHT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Field label="Cover Image URL">
            {coverImage && (
              <div style={{ position: 'relative', height: '120px', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
                <img src={coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => setCoverImage('')} style={REMOVE_IMG}>✕</button>
              </div>
            )}
            <input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://i.ibb.co/… cover image URL" style={INPUT} />
          </Field>

          {/* Gallery images */}
          <Field label="Gallery Images (optional)">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
              {images.map((img, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <img src={img} alt="" style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0, background: '#131320' }} />
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{img}</span>
                  <button type="button" onClick={() => removeImage(i)} style={{ ...REMOVE_IMG_INLINE }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImage())}
                placeholder="Paste image URL and click Add"
                style={{ ...INPUT, flex: 1 }}
              />
              <button type="button" onClick={addImage} style={ADD_BTN}>Add</button>
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '6px' }}>
              Upload to ImgBB → paste URL here. Press Enter or click Add.
            </div>
          </Field>

          <Field label="YouTube Video URL">
            <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtu.be/…" style={INPUT} />
          </Field>

          {/* Fares */}
          <Field label="Fares / Classes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {fares.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input type="text" value={f.class} onChange={e => setFare(i, 'class', e.target.value)} placeholder="AC Business" style={{ ...INPUT, flex: 1 }} />
                  <input type="text" value={f.price} onChange={e => setFare(i, 'price', e.target.value)} placeholder="PKR 4,200" style={{ ...INPUT, flex: 1 }} />
                  <button type="button" onClick={() => removeFare(i)} style={REMOVE_IMG_INLINE}>✕</button>
                </div>
              ))}
              <button type="button" onClick={addFare} style={ADD_BTN_FULL}>+ Add Class</button>
            </div>
          </Field>

          <Field label="Status">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#1E90FF' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Published (visible on site)</span>
            </label>
          </Field>
        </div>
      </div>

      {/* Actions */}
      <div style={ACTIONS}>
        <button type="button" onClick={() => router.push('/admin/reviews')} style={BTN_CANCEL} disabled={saving}>Cancel</button>
        <button type="button" onClick={() => handleSave(false)} style={BTN_DRAFT}   disabled={saving}>{saving ? 'Saving…' : 'Save Draft'}</button>
        <button type="button" onClick={() => handleSave(true)}  style={BTN_PUBLISH} disabled={saving}>{saving ? 'Publishing…' : '✓ Publish'}</button>
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

const INPUT        = { width: '100%', background: '#131320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 16px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, outline: 'none', display: 'block' };
const LABEL        = { display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' };
const ERROR        = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#f97070', fontWeight: 600 };
const ACTIONS      = { display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' };
const BTN_CANCEL   = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_DRAFT    = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_PUBLISH  = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', border: 'none', borderRadius: '100px', padding: '11px 24px', cursor: 'pointer' };
const REMOVE_IMG   = { position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px' };
const REMOVE_IMG_INLINE = { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#f97070', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', flexShrink: 0 };
const ADD_BTN      = { fontSize: '11px', fontWeight: 700, background: 'rgba(30,144,255,0.15)', border: '1px solid rgba(30,144,255,0.3)', color: '#1E90FF', borderRadius: '10px', padding: '0 16px', cursor: 'pointer', flexShrink: 0, height: '46px' };
const ADD_BTN_FULL = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', background: 'rgba(30,144,255,0.08)', border: '1px dashed rgba(30,144,255,0.3)', borderRadius: '10px', padding: '11px', cursor: 'pointer', width: '100%' };
