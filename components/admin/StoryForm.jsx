'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export default function StoryForm() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [videoUrl,     setVideoUrl]     = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [caption,      setCaption]      = useState('');
  const [uploading,    setUploading]    = useState(false);
  const [uploadPct,    setUploadPct]    = useState(0);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');

  async function handleVideoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic size guard — keep stories short & light (10MB cap for speed)
    if (file.size > 10 * 1024 * 1024) {
      setError('Video too large — keep it under 10MB for fast loading. Trim your clip shorter.');
      return;
    }

    setError('');
    setUploading(true);
    setUploadPct(5);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('resource_type', 'video');

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`);

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          setUploadPct(Math.round((evt.loaded / evt.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          setVideoUrl(data.secure_url);
          // Cloudinary auto-generates a thumbnail by swapping .mp4 → .jpg
          setThumbnailUrl(data.secure_url.replace(/\.\w+$/, '.jpg'));
        } else {
          setError('Upload failed. Check your Cloudinary preset settings.');
        }
        setUploading(false);
      };

      xhr.onerror = () => {
        setError('Upload failed — network error.');
        setUploading(false);
      };

      xhr.send(formData);
    } catch (err) {
      setError('Upload failed: ' + err.message);
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!videoUrl) { setError('Please upload a video first.'); return; }
    if (!caption.trim()) { setError('Add a short caption.'); return; }

    setError('');
    setSaving(true);
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24 hours

      await addDoc(collection(db, 'stories'), {
        videoUrl,
        thumbnailUrl,
        caption: caption.trim(),
        // authorName/authorId reserved for future public submissions —
        // for now all stories are admin-posted
        authorName: 'RaiLoversPK',
        source: 'admin',
        published: true,
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      });

      router.push('/admin/stories');
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '480px' }}>
      {error && <div style={ERROR}>{error}</div>}

      {/* Video preview / upload */}
      <div>
        <label style={LABEL}>Story Video * (max 10MB, keep it short — 5-15 sec ideal)</label>

        {videoUrl ? (
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', background: '#000', aspectRatio: '9/16', maxWidth: '240px' }}>
            <video src={videoUrl} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => { setVideoUrl(''); setThumbnailUrl(''); }}
              style={REMOVE_BTN}
            >
              ✕ Remove
            </button>
          </div>
        ) : (
          <label style={UPLOAD_BOX}>
            {uploading ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E90FF', marginBottom: '8px' }}>
                  Uploading… {uploadPct}%
                </div>
                <div style={{ width: '160px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${uploadPct}%`, height: '100%', background: '#1E90FF', transition: 'width 0.2s' }} />
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🎬</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E90FF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Upload Video
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>
                  MP4 recommended · vertical 9:16 looks best
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
          </label>
        )}
      </div>

      {/* Caption */}
      <div>
        <label style={LABEL}>Caption *</label>
        <input
          type="text"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="e.g. Leaving Lahore station right now! 🚂"
          maxLength={100}
          style={INPUT}
        />
        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', textAlign: 'right' }}>
          {caption.length}/100
        </div>
      </div>

      {/* Info */}
      <div style={{ background: 'rgba(30,144,255,0.06)', border: '1px solid rgba(30,144,255,0.2)', borderRadius: '12px', padding: '14px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
        ⏱ This story will automatically disappear from the site <strong style={{ color: '#1E90FF' }}>24 hours</strong> after posting — just like Instagram Stories.
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button type="button" onClick={() => router.push('/admin/stories')} style={BTN_CANCEL} disabled={saving}>
          Cancel
        </button>
        <button type="button" onClick={handleSave} style={BTN_PUBLISH} disabled={saving || uploading || !videoUrl}>
          {saving ? 'Posting…' : '✓ Post Story'}
        </button>
      </div>
    </div>
  );
}

const LABEL      = { display: 'block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' };
const INPUT      = { width: '100%', background: '#131320', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '13px 16px', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500, outline: 'none' };
const ERROR      = { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', fontSize: '13px', color: '#f97070', fontWeight: 600 };
const UPLOAD_BOX = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', width: '100%', aspectRatio: '9/16', maxWidth: '240px', background: 'rgba(30,144,255,0.05)', border: '1.5px dashed rgba(30,144,255,0.3)', borderRadius: '16px', cursor: 'pointer', padding: '20px' };
const REMOVE_BTN = { position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', borderRadius: '100px', padding: '6px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' };
const BTN_CANCEL = { fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '11px 20px', cursor: 'pointer' };
const BTN_PUBLISH= { fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: '#1E90FF', border: 'none', borderRadius: '100px', padding: '11px 24px', cursor: 'pointer' };
