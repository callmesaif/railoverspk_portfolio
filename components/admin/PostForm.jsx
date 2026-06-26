'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const EMPTY_POST = {
  title:      '',
  content:    '',
  coverImage: '',
  tags:       '',
  date:       new Date().toISOString().slice(0, 10),
  videoUrl:   '',
  published:  false,
};

export default function PostForm({ existing, id }) {
  const router           = useRouter();
  const [form, setForm]  = useState(existing ? { ...existing, tags: (existing.tags || []).join(', ') } : EMPTY_POST);
  const [saving, setSaving]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(10);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_KEY;
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, coverImage: data.data.url }));
        setUploadProgress(100);
      } else {
        setError('Upload failed: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleSave(publish = null) {
    setError('');
    setSaving(true);
    try {
      const data = {
        title:      form.title.trim(),
        content:    form.content.trim(),
        coverImage: form.coverImage.trim(),
        tags:       form.tags.split(',').map(t => t.trim()).filter(Boolean),
        date:       form.date,
        videoUrl:   form.videoUrl.trim(),
        published:  publish !== null ? publish : form.published,
        updatedAt:  serverTimestamp(),
      };

      if (id) {
        await setDoc(doc(db, 'posts', id), data, { merge: true });
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'posts'), data);
      }
      router.push('/admin/posts');
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={WRAP}>
      {error && <div style={ERROR}>{error}</div>}

      <div style={GRID}>
        {/* Left — main fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Post Title *">
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Khyber Mail Business Class Review" style={INPUT} />
          </Field>

          <Field label="Content *">
            <textarea name="content" value={form.content} onChange={handleChange}
              placeholder="Write your full post content here…"
              style={{ ...INPUT, minHeight: '280px', resize: 'vertical' }} />
          </Field>

          <Field label="YouTube Video URL">
            <input name="videoUrl" value={form.videoUrl} onChange={handleChange}
              placeholder="https://youtu.be/..." style={INPUT} />
          </Field>
        </div>

        {/* Right — meta fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Cover Image">
            {form.coverImage && (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px', height: '140px', background: '#131320' }}>
                <img src={form.coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setForm(p => ({ ...p, coverImage: '' }))} style={REMOVE_IMG}>✕</button>
              </div>
            )}
            <label style={UPLOAD_BTN}>
              {uploading ? `Uploading… ${uploadProgress}%` : '↑ Upload Image'}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            <div style={OR_DIV}>or paste URL</div>
            <input name="coverImage" value={form.coverImage} onChange={handleChange}
              placeholder="https://…" style={INPUT} />
          </Field>

          <Field label="Tags (comma separated)">
            <input name="tags" value={form.tags} onChange={handleChange}
              placeholder="Train Review, Lahore, Express" style={INPUT} />
          </Field>

          <Field label="Publish Date">
            <input name="date" type="date" value={form.date} onChange={handleChange} style={INPUT} />
          </Field>

          <Field label="Status">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" name="published" checked={form.published} onChange={handleChange}
                style={{ width: '16px', height: '16px', accentColor: '#1E90FF' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Published (visible on site)</span>
            </label>
          </Field>
        </div>
      </div>

      {/* Actions */}
      <div style={ACTIONS}>
        <button onClick={() => router.push('/admin/posts')} style={BTN_CANCEL} disabled={saving}>
          Cancel
        </button>
        <button onClick={() => handleSave(false)} style={BTN_DRAFT} disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save as Draft'}
        </button>
        <button onClick={() => handleSave(true)} style={BTN_PUBLISH} disabled={saving || uploading}>
          {saving ? 'Publishing…' : '✓ Publish Post'}
        </button>
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

const WRAP       = { display: 'flex', flexDirection: 'column', gap: '2rem' };
const GRID       = { display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'start' };
const LABEL      = { display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' };
const INPUT      = { width: '100%', background: '#131320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 16px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, outline: 'none', display: 'block' };
const ERROR      = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#f97070', fontWeight: 600 };
const ACTIONS    = { display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' };
const BTN_CANCEL = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_DRAFT  = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_PUBLISH= { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', border: 'none', borderRadius: '100px', padding: '11px 24px', cursor: 'pointer' };
const UPLOAD_BTN = { display: 'block', textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', background: 'rgba(30,144,255,0.08)', border: '1px dashed rgba(30,144,255,0.3)', borderRadius: '12px', padding: '14px', cursor: 'pointer', marginBottom: '10px' };
const OR_DIV     = { fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: '8px 0', letterSpacing: '0.1em', textTransform: 'uppercase' };
const REMOVE_IMG = { position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
