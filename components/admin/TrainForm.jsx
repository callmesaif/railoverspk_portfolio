'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TRAIN_TYPES = ['Express', 'Mail', 'Local', 'Speical', 'Freight'];
const STATUS_OPTIONS = [
  { value: 'operational', label: '🟢 Operational' },
  { value: 'suspended',   label: '🔴 Suspended'   },
  { value: 'delayed',     label: '🟡 Delayed'      },
  { value: 'maintenance', label: '🔧 Maintenance'  },
];
const DAYS = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];
const DEFAULT_SCHEDULE = {
  mon: true, tue: true, wed: true,
  thu: true, fri: true, sat: true, sun: true,
};
const EMPTY_STOP = { station: '', arrival: '', departure: '', day: 1 };
const EMPTY_FARE = { class: '', price: '' };

export default function TrainForm({ existing, id }) {
  const router = useRouter();

  const [name,           setName]           = useState(existing?.name           ?? '');
  const [number,         setNumber]         = useState(existing?.number         ?? '');
  const [type,           setType]           = useState(existing?.type           ?? 'Express');
  const [status,         setStatus]         = useState(existing?.status         ?? 'operational');
  const [coverImage,     setCoverImage]     = useState(existing?.coverImage     ?? '');
  const [origin,         setOrigin]         = useState(existing?.origin         ?? '');
  const [destination,    setDestination]    = useState(existing?.destination    ?? '');
  const [totalDistance,  setTotalDistance]  = useState(existing?.totalDistance  ?? '');
  const [totalDuration,  setTotalDuration]  = useState(existing?.totalDuration  ?? '');
  const [frequency,      setFrequency]      = useState(existing?.frequency      ?? 'Daily');
  const [weeklySchedule, setWeeklySchedule] = useState(existing?.weeklySchedule ?? { ...DEFAULT_SCHEDULE });
  const [stops,          setStops]          = useState(existing?.stops          ?? [{ ...EMPTY_STOP }]);
  const [fares,          setFares]          = useState(existing?.fares          ?? [{ ...EMPTY_FARE }]);
  const [published,      setPublished]      = useState(existing?.published      ?? false);
  const [uploading,      setUploading]      = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [error,          setError]          = useState('');

  // Image upload
  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res  = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) setCoverImage(data.data.url);
      else setError('Image upload failed');
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  // Stops handlers
  function updateStop(i, key, val) {
    setStops(prev => { const n = [...prev]; n[i] = { ...n[i], [key]: val }; return n; });
  }
  function addStop()        { setStops(prev => [...prev, { ...EMPTY_STOP }]); }
  function removeStop(i)    { setStops(prev => prev.filter((_, idx) => idx !== i)); }
  function moveStop(i, dir) {
    setStops(prev => {
      const n = [...prev];
      const j = i + dir;
      if (j < 0 || j >= n.length) return n;
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  }

  // Fares handlers
  function updateFare(i, key, val) {
    setFares(prev => { const n = [...prev]; n[i] = { ...n[i], [key]: val }; return n; });
  }
  function addFare()     { setFares(prev => [...prev, { ...EMPTY_FARE }]); }
  function removeFare(i) { setFares(prev => prev.filter((_, idx) => idx !== i)); }

  // Weekly schedule toggle
  function toggleDay(day) {
    setWeeklySchedule(p => ({ ...p, [day]: !p[day] }));
  }

  async function handleSave(pub = null) {
    if (!name.trim())   { setError('Train name required.');  return; }
    if (!origin.trim()) { setError('Origin required.');      return; }
    if (!destination.trim()) { setError('Destination required.'); return; }
    setError(''); setSaving(true);
    try {
      const data = {
        name:           name.trim(),
        number:         number.trim(),
        type,
        status,
        coverImage:     coverImage.trim(),
        origin:         origin.trim(),
        destination:    destination.trim(),
        totalDistance:  totalDistance.trim(),
        totalDuration:  totalDuration.trim(),
        frequency:      frequency.trim(),
        weeklySchedule,
        stops:          stops.filter(s => s.station.trim()),
        fares:          fares.filter(f => f.class && f.price),
        published:      pub !== null ? pub : published,
        updatedAt:      serverTimestamp(),
      };
      if (id) {
        await setDoc(doc(db, 'trains', id), data, { merge: true });
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'trains'), data);
      }
      router.push('/admin/trains');
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  const todayKey = ['sun','mon','tue','wed','thu','fri','sat'][new Date().getDay()];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && <div style={ERROR}>{error}</div>}

      {/* ── Section 1: Basic Info ── */}
      <Section title="Basic Information">
        <div className="rl-form-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Train Name *">
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Karakoram Express" style={INPUT} />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Train Number">
                <input value={number} onChange={e => setNumber(e.target.value)}
                  placeholder="e.g. 1" style={INPUT} />
              </Field>
              <Field label="Type">
                <select value={type} onChange={e => setType(e.target.value)} style={INPUT}>
                  {TRAIN_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Status">
              <select value={status} onChange={e => setStatus(e.target.value)} style={INPUT}>
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Cover Image">
              {coverImage && (
                <div style={{ position: 'relative', height: '120px', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px', background: '#131320' }}>
                  <img src={coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => setCoverImage('')} style={REMOVE_IMG}>✕</button>
                </div>
              )}
              <label style={UPLOAD_BTN}>
                {uploading ? 'Uploading…' : '↑ Upload Image'}
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
              <div style={OR_DIV}>or paste URL</div>
              <input value={coverImage} onChange={e => setCoverImage(e.target.value)}
                placeholder="https://i.ibb.co/…" style={INPUT} />
            </Field>
            <Field label="Publish">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#1E90FF' }} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Published (visible on site)</span>
              </label>
            </Field>
          </div>
        </div>
      </Section>

      {/* ── Section 2: Route ── */}
      <Section title="Route Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <Field label="Origin *">
            <input value={origin} onChange={e => setOrigin(e.target.value)}
              placeholder="e.g. Karachi Cantt (KHI)" style={INPUT} />
          </Field>
          <Field label="Destination *">
            <input value={destination} onChange={e => setDestination(e.target.value)}
              placeholder="e.g. Lahore (LHR)" style={INPUT} />
          </Field>
          <Field label="Total Distance">
            <input value={totalDistance} onChange={e => setTotalDistance(e.target.value)}
              placeholder="e.g. 1286 km" style={INPUT} />
          </Field>
          <Field label="Total Duration">
            <input value={totalDuration} onChange={e => setTotalDuration(e.target.value)}
              placeholder="e.g. 15 hours" style={INPUT} />
          </Field>
        </div>

        {/* Stops */}
        <label style={LABEL}>Stations & Timings</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 60px 60px', gap: '8px' }}>
            {['Station', 'Arrival', 'Departure', 'Day', ''].map((h, i) => (
              <div key={i} style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '0 4px' }}>{h}</div>
            ))}
          </div>
          {stops.map((stop, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 60px 60px', gap: '8px', alignItems: 'center' }}>
              <input value={stop.station} onChange={e => updateStop(i, 'station', e.target.value)}
                placeholder="Station name" style={INPUT} />
              <input value={stop.arrival} onChange={e => updateStop(i, 'arrival', e.target.value)}
                placeholder="--:--" style={INPUT} />
              <input value={stop.departure} onChange={e => updateStop(i, 'departure', e.target.value)}
                placeholder="--:--" style={INPUT} />
              <input type="number" min="1" max="5" value={stop.day} onChange={e => updateStop(i, 'day', parseInt(e.target.value))}
                style={{ ...INPUT, textAlign: 'center' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button type="button" onClick={() => moveStop(i, -1)} disabled={i === 0}
                  style={ICON_BTN}>↑</button>
                <button type="button" onClick={() => removeStop(i)} disabled={stops.length === 1}
                  style={{ ...ICON_BTN, color: '#f97070' }}>✕</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addStop} style={ADD_BTN_FULL}>+ Add Station</button>
      </Section>

      {/* ── Section 3: Fares ── */}
      <Section title="Fares & Classes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
          {fares.map((fare, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input value={fare.class} onChange={e => updateFare(i, 'class', e.target.value)}
                placeholder="Class (e.g. AC Business)" style={{ ...INPUT, flex: 1 }} />
              <input value={fare.price} onChange={e => updateFare(i, 'price', e.target.value)}
                placeholder="Price (e.g. PKR 4,500)" style={{ ...INPUT, flex: 1 }} />
              <button type="button" onClick={() => removeFare(i)} disabled={fares.length === 1}
                style={REMOVE_INLINE}>✕</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addFare} style={ADD_BTN_FULL}>+ Add Class</button>
      </Section>

      {/* ── Section 4: Schedule ── */}
      <Section title="Weekly Schedule">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <Field label="Frequency">
            <input value={frequency} onChange={e => setFrequency(e.target.value)}
              placeholder="e.g. Daily, Mon-Sat, Weekly" style={INPUT} />
          </Field>
        </div>
        <label style={LABEL}>Konse din chalti hai?</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {DAYS.map(({ key, label }) => {
            const isOn    = weeklySchedule[key];
            const isToday = key === todayKey;
            return (
              <button key={key} type="button" onClick={() => toggleDay(key)} style={{
                width: '52px', height: '52px', borderRadius: '12px', cursor: 'pointer',
                border: isToday ? '2px solid #fff' : '1px solid transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '2px',
                background: isOn ? 'rgba(63,202,122,0.2)' : 'rgba(239,68,68,0.15)',
                transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                <span style={{ fontSize: '14px' }}>{isOn ? '🟢' : '🔴'}</span>
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '8px' }}>
          💡 White border = Aaj ka din
        </div>
      </Section>

      {/* ── Actions ── */}
      <div style={ACTIONS}>
        <button type="button" onClick={() => router.push('/admin/trains')} style={BTN_CANCEL} disabled={saving}>Cancel</button>
        <button type="button" onClick={() => handleSave(false)} style={BTN_DRAFT} disabled={saving}>
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button type="button" onClick={() => handleSave(true)} style={BTN_PUBLISH} disabled={saving}>
          {saving ? 'Publishing…' : '✓ Publish'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#0c0c12', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.5rem' }}>
      <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#1E90FF', marginBottom: '1rem' }}>
        {title}
      </div>
      {children}
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

const LABEL       = { display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '6px' };
const INPUT       = { width: '100%', background: '#131320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '11px 14px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', outline: 'none', display: 'block' };
const ERROR       = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#f97070', fontWeight: 600 };
const ACTIONS     = { display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' };
const BTN_CANCEL  = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_DRAFT   = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_PUBLISH = { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', border: 'none', borderRadius: '100px', padding: '11px 24px', cursor: 'pointer' };
const REMOVE_IMG  = { position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px' };
const UPLOAD_BTN  = { display: 'block', textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', background: 'rgba(30,144,255,0.08)', border: '1px dashed rgba(30,144,255,0.3)', borderRadius: '12px', padding: '14px', cursor: 'pointer', marginBottom: '10px' };
const OR_DIV      = { fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: '8px 0', letterSpacing: '0.1em', textTransform: 'uppercase' };
const ADD_BTN_FULL= { width: '100%', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', background: 'rgba(30,144,255,0.08)', border: '1px dashed rgba(30,144,255,0.3)', borderRadius: '10px', padding: '11px', cursor: 'pointer' };
const REMOVE_INLINE={ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#f97070', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', flexShrink: 0 };
const ICON_BTN    = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: 'rgba(255,255,255,0.5)', padding: '4px', cursor: 'pointer', fontSize: '11px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' };