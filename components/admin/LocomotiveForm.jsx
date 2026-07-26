'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function LocomotiveForm({ existing, id }) {
  const router = useRouter();

  const [name,         setName]         = useState(existing?.name         ?? '');
  const [model,        setModel]        = useState(existing?.model        ?? '');
  const [manufacturer, setManufacturer] = useState(existing?.manufacturer ?? '');
  const [horsepower,   setHorsepower]   = useState(existing?.horsepower   ?? '');
  const [yearBuilt,    setYearBuilt]    = useState(existing?.yearBuilt    ?? '');
  const [status,       setStatus]       = useState(existing?.status       ?? 'active');
  const [depot,        setDepot]        = useState(existing?.depot       ?? '');
  const [description,  setDescription]  = useState(existing?.description ?? '');
  const [coverImage,   setCoverImage]   = useState(existing?.coverImage  ?? '');
  const [published,    setPublished]    = useState(existing?.published   ?? false);

  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState('');

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadPct(10);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res  = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setCoverImage(data.data.url);
        setUploadPct(100);
      } else {
        setError('Upload failed: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  }

  async function handleSave(pub = null) {
    if (!name.trim()) { setError('Locomotive name is required.'); return; }
    setError('');
    setSaving(true);
    try {
      const data = {
        name:         name.trim(),
        model:        model.trim(),
        manufacturer: manufacturer.trim(),
        horsepower:   horsepower.trim(),
        yearBuilt:    yearBuilt.trim(),
        status,
        depot:        depot.trim(),
        description:  description.trim(),
        coverImage:   coverImage.trim(),
        published:    pub !== null ? pub : published,
        updatedAt:    serverTimestamp(),
      };
      if (id) {
        await setDoc(doc(db, 'locomotives', id), data, { merge: true });
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'locomotives'), data);
      }
      router.push('/admin/locomotives');
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && <div style={ERROR}>{error}</div>}

      <div className="rl-form-grid">
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Locomotive Name *">
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. GEU-40" style={INPUT} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Model Number">
              <input type="text" value={model} onChange={e => setModel(e.target.value)}
                placeholder="e.g. GE U20C" style={INPUT} />
            </Field>
            <Field label="Manufacturer">
              <input type="text" value={manufacturer} onChange={e => setManufacturer(e.target.value)}
                placeholder="e.g. General Electric" style={INPUT} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Horsepower">
              <input type="text" value={horsepower} onChange={e => setHorsepower(e.target.value)}
                placeholder="e.g. 2000 HP" style={INPUT} />
            </Field>
            <Field label="Year Built">
              <input type="text" value={yearBuilt} onChange={e => setYearBuilt(e.target.value)}
                placeholder="e.g. 1994" style={INPUT} />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="History, notable service, interesting facts..."
              style={{ ...INPUT, minHeight: '160px', resize: 'vertical' }} />
          </Field>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Cover Image">
            {coverImage && (
              <div style={{ position: 'relative', height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px', background: '#131320' }}>
                <img src={coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => setCoverImage('')} style={REMOVE_IMG}>✕</button>
              </div>
            )}
            <label style={UPLOAD_BTN}>
              {uploading ? `Uploading… ${uploadPct}%` : '↑ Upload Image'}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            <div style={OR_DIV}>or paste URL</div>
            <input type="text" value={coverImage} onChange={e => setCoverImage(e.target.value)}
              placeholder="https://i.ibb.co/…" style={INPUT} />
          </Field>

          <Field label="Status">
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={() => setStatus('active')}
                style={{ ...STATUS_BTN, ...(status === 'active' ? STATUS_ACTIVE : {}) }}>
                🟢 Active
              </button>
              <button type="button" onClick={() => setStatus('retired')}
                style={{ ...STATUS_BTN, ...(status === 'retired' ? STATUS_RETIRED : {}) }}>
                🔴 Retired
              </button>
            </div>
          </Field>

          <Field label="Depot / Current Location">
            <input type="text" value={depot} onChange={e => setDepot(e.target.value)}
              placeholder="e.g. Lahore Loco Shed" style={INPUT} />
          </Field>

          <Field label="Publish Status">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#1E90FF' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Published (visible on site)</span>
            </label>
          </Field>
        </div>
      </div>

      <div style={ACTIONS}>
        <button type="button" onClick={() => router.push('/admin/locomotives')} style={BTN_CANCEL} disabled={saving}>Cancel</button>
        <button type="button" onClick={() => handleSave(false)} style={BTN_DRAFT} disabled={saving || uploading}>{saving ? 'Saving…' : 'Save Draft'}</button>
        <button type="button" onClick={() => handleSave(true)} style={BTN_PUBLISH} disabled={saving || uploading}>{saving ? 'Publishing…' : '✓ Publish'}</button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <div><label style={LABEL}>{label}</label>{children}</div>;
}

const LABEL       = { display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' };
const INPUT       = { width: '100%', background: '#131320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 16px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, outline: 'none', display: 'block' };
const ERROR       = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#f97070', fontWeight: 600 };
const ACTIONS     = { display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' };
const BTN_CANCEL  = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_DRAFT   = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_PUBLISH = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', border: 'none', borderRadius: '100px', padding: '11px 24px', cursor: 'pointer' };
const REMOVE_IMG  = { position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px' };
const UPLOAD_BTN  = { display: 'block', textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', background: 'rgba(30,144,255,0.08)', border: '1px dashed rgba(30,144,255,0.3)', borderRadius: '12px', padding: '14px', cursor: 'pointer', marginBottom: '10px' };
const OR_DIV       = { fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: '8px 0', letterSpacing: '0.1em', textTransform: 'uppercase' };
const STATUS_BTN   = { flex: 1, fontSize: '12px', fontWeight: 700, padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: '#131320', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' };
const STATUS_ACTIVE = { background: 'rgba(63,202,122,0.15)', border: '1px solid rgba(63,202,122,0.4)', color: '#3fca7a' };
const STATUS_RETIRED= { background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f97070' };
