// components/admin/PostForm.jsx

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import RichTextEditor from '@/components/admin/RichTextEditor';

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
  const router = useRouter();

  const [title,      setTitle]      = useState(existing?.title      ?? '');
  const [content,    setContent]    = useState(existing?.content    ?? '');
  const [coverImage, setCoverImage] = useState(existing?.coverImage ?? '');
  const [tags,       setTags]       = useState(existing ? (existing.tags || []).join(', ') : '');
  const [date,       setDate]       = useState(existing?.date       ?? new Date().toISOString().slice(0, 10));
  const [videoUrl,   setVideoUrl]   = useState(existing?.videoUrl   ?? '');
  const [published,  setPublished]  = useState(existing?.published  ?? false);
  const [saving,     setSaving]     = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [uploadPct,  setUploadPct]  = useState(0);
  const [error,      setError]      = useState('');
  const [storyMsg,   setStoryMsg]   = useState(''); // ← story status message

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadPct(10);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res  = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setCoverImage(data.data.url);
        setUploadPct(100);
      } else {
        setError('Upload failed: ' + (data.error?.message || 'Unknown'));
      }
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setUploading(false); setUploadPct(0);
    }
  }

  // ── Auto Story Creator ──────────────────────────────────────
  async function createAutoStory(postTitle, postCoverImage, postVideoUrl) {
    try {
      // Agar cover image nahi hai toh story mat banao
      if (!postCoverImage && !postVideoUrl) return;

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

      // Video URL se YouTube thumbnail banao agar video hai
      function getYtThumb(url) {
        if (!url) return null;
        const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (short) return `https://img.youtube.com/vi/${short[1]}/hqdefault.jpg`;
        const long = url.match(/[?&v=\/embed\/]([a-zA-Z0-9_-]{11})/);
        if (long) return `https://img.youtube.com/vi/${long[1]}/hqdefault.jpg`;
        return null;
      }

      const ytThumb = getYtThumb(postVideoUrl);
      const storyThumb = postCoverImage || ytThumb;

      // Cloudinary video URL nahi hai toh story mein video nahi hogi
      // Story sirf image-based rahegi blog posts ke liye
      await addDoc(collection(db, 'stories'), {
        videoUrl:     postVideoUrl || '',   // agar YouTube link hai toh empty rahega (Cloudinary chahiye video ke liye)
        thumbnailUrl: storyThumb || '',
        caption:      `📝 New Post: ${postTitle}`,
        authorName:   'RaiLoversPK',
        source:       'auto-blog',          // identify karne ke liye ke auto bani hai
        published:    true,
        createdAt:    serverTimestamp(),
        expiresAt:    Timestamp.fromDate(expiresAt),
      });

      setStoryMsg('✓ Story auto-created!');
      setTimeout(() => setStoryMsg(''), 3000);
    } catch (err) {
      console.error('Auto story failed:', err);
      // Story fail hone se post save nahi rukegi
    }
  }
  // ────────────────────────────────────────────────────────────

  async function handleSave(pub = null) {
    if (!title.trim()) { setError('Title is required.'); return; }
    setError(''); setSaving(true);

    const isPublishing = pub === true;
    const wasAlreadyPublished = existing?.published === true;

    try {
      const data = {
        title:      title.trim(),
        content,
        coverImage: coverImage.trim(),
        tags:       tags.split(',').map(t => t.trim()).filter(Boolean),
        date,
        videoUrl:   videoUrl.trim(),
        published:  pub !== null ? pub : published,
        updatedAt:  serverTimestamp(),
      };

      if (id) {
        await setDoc(doc(db, 'posts', id), data, { merge: true });
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'posts'), data);
      }

      // ── Auto story: sirf tab banao jab pehli baar publish ho ──
      if (isPublishing && !wasAlreadyPublished) {
        await createAutoStory(title.trim(), coverImage.trim(), videoUrl.trim());
      }

      router.push('/admin/posts');
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {error && <div style={ERROR}>{error}</div>}

      {/* Story auto-create success message */}
      {storyMsg && (
        <div style={{
          background: 'rgba(63,202,122,0.1)',
          border: '1px solid rgba(63,202,122,0.25)',
          borderRadius: '12px',
          padding: '12px 18px',
          fontSize: '13px',
          color: '#3fca7a',
          fontWeight: 600,
        }}>
          🚂 {storyMsg}
        </div>
      )}

      <div className="rl-form-grid">

        {/* ── LEFT — main content ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Field label="Post Title *">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Khyber Mail Business Class Review"
              style={INPUT}
            />
          </Field>

          <Field label="Content *">
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write your full post content here — use the toolbar for formatting…"
            />
          </Field>

          <Field label="YouTube Video URL">
            <input
              type="text"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://youtu.be/…"
              style={INPUT}
            />
          </Field>
        </div>

        {/* ── RIGHT — meta ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <Field label="Cover Image">
            {coverImage && (
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px', height: '140px', background: '#131320' }}>
                <img src={coverImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => setCoverImage('')} style={REMOVE_IMG}>✕</button>
              </div>
            )}
            <label style={UPLOAD_BTN}>
              {uploading ? `Uploading… ${uploadPct}%` : '↑ Upload Image'}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            <div style={OR_DIV}>or paste URL</div>
            <input
              type="text"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="https://i.ibb.co/…"
              style={INPUT}
            />
          </Field>

          <Field label="Tags (comma separated)">
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="Train Review, Lahore, Express"
              style={INPUT}
            />
          </Field>

          <Field label="Publish Date">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={INPUT} />
          </Field>

          {/* Auto Story Info */}
          <div style={{
            background: 'rgba(30,144,255,0.06)',
            border: '1px solid rgba(30,144,255,0.2)',
            borderRadius: '12px',
            padding: '14px 16px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)',
            lineHeight: 1.6,
          }}>
            🚂 <strong style={{ color: '#1E90FF' }}>Auto Story:</strong> Jab aap pehli baar post publish karenge, ek story automatically 24 hours ke liye create ho jayegi.
          </div>

          <Field label="Status">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={published}
                onChange={e => setPublished(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#1E90FF' }}
              />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Published (visible on site)</span>
            </label>
          </Field>
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={ACTIONS}>
        <button type="button" onClick={() => router.push('/admin/posts')} style={BTN_CANCEL} disabled={saving}>
          Cancel
        </button>
        <button type="button" onClick={() => handleSave(false)} style={BTN_DRAFT} disabled={saving || uploading}>
          {saving ? 'Saving…' : 'Save as Draft'}
        </button>
        <button type="button" onClick={() => handleSave(true)} style={BTN_PUBLISH} disabled={saving || uploading}>
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

const LABEL      = { display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' };
const INPUT      = { width: '100%', background: '#131320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 16px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, outline: 'none', display: 'block' };
const ERROR      = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#f97070', fontWeight: 600 };
const ACTIONS    = { display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)' };
const BTN_CANCEL = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_DRAFT  = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_PUBLISH= { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', border: 'none', borderRadius: '100px', padding: '11px 24px', cursor: 'pointer' };
const REMOVE_IMG = { position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const UPLOAD_BTN = { display: 'block', textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1E90FF', background: 'rgba(30,144,255,0.08)', border: '1px dashed rgba(30,144,255,0.3)', borderRadius: '12px', padding: '14px', cursor: 'pointer', marginBottom: '10px' };
const OR_DIV     = { fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', textAlign: 'center', margin: '8px 0', letterSpacing: '0.1em', textTransform: 'uppercase' };