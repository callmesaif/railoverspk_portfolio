'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const STORY_DURATION = 60000; // 60 seconds

export default function StoryViewer({ stories, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedRef = useRef(false);

  const story = stories[idx];

  const goNext = useCallback(() => {
    if (idx < stories.length - 1) {
      setIdx(i => i + 1);
    } else {
      onClose();
    }
  }, [idx, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (idx > 0) setIdx(i => i - 1);
  }, [idx]);

  useEffect(() => {
    setProgress(0);
    startTimeRef.current = Date.now();
    pausedRef.current = false;

    // Sirf video ho tab play karo
    if (videoRef.current && story?.videoUrl) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      videoRef.current.play().catch(() => {});
    }

    function tick() {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        goNext();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [idx, goNext, story?.videoUrl]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev, onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handlePress() {
    pausedRef.current = true;
    if (videoRef.current) videoRef.current.pause();
  }

  function handleRelease() {
    pausedRef.current = false;
    if (videoRef.current && story?.videoUrl) {
      videoRef.current.play().catch(() => {});
    }
  }

  if (!story) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'relative',
        width: 'min(100vw, calc(100vh * 9 / 16))',
        height: '100vh',
        background: '#000',
        overflow: 'hidden',
      }}>

        {/* Progress bars */}
        <div style={{
          position: 'absolute', top: '10px', left: '10px', right: '10px',
          zIndex: 10, display: 'flex', gap: '4px',
        }}>
          {stories.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: '2.5px',
              background: 'rgba(255,255,255,0.3)',
              borderRadius: '2px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', background: '#fff', borderRadius: '2px',
                width: i < idx ? '100%' : i === idx ? `${progress}%` : '0%',
                transition: i === idx ? 'none' : 'width 0.2s',
              }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={{
          position: 'absolute', top: '24px', left: '16px', right: '16px',
          zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              overflow: 'hidden', background: '#333', flexShrink: 0,
            }}>
              {story.thumbnailUrl && (
                <img src={story.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
              {story.authorName || 'RaiLoversPK'}
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: '#fff',
            fontSize: '22px', cursor: 'pointer', padding: '4px',
          }}>✕</button>
        </div>

        {/* ── Video ya Image ── */}
        {story.videoUrl ? (
          <video
            ref={videoRef}
            src={story.videoUrl}
            autoPlay
            playsInline
            onEnded={goNext}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : story.thumbnailUrl ? (
          <img
            src={story.thumbnailUrl}
            alt={story.caption || ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'var(--bg2)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '4rem',
          }}>🚂</div>
        )}

        {/* Caption */}
        {story.caption && (
          <div style={{
            position: 'absolute', bottom: '24px', left: '16px', right: '16px',
            zIndex: 10, fontSize: '14px', fontWeight: 600, color: '#fff',
            textShadow: '0 1px 4px rgba(0,0,0,0.6)', lineHeight: 1.4,
            background: 'rgba(0,0,0,0.4)',
            padding: '10px 14px', borderRadius: '12px',
            backdropFilter: 'blur(4px)',
          }}>
            {story.caption}
          </div>
        )}

        {/* Tap zones */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
          <div
            style={{ flex: '0 0 30%', cursor: 'pointer' }}
            onClick={goPrev}
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
          />
          <div
            style={{ flex: '0 0 40%', cursor: 'pointer' }}
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
          />
          <div
            style={{ flex: '0 0 30%', cursor: 'pointer' }}
            onClick={goNext}
            onMouseDown={handlePress}
            onMouseUp={handleRelease}
            onTouchStart={handlePress}
            onTouchEnd={handleRelease}
          />
        </div>
      </div>
    </div>
  );
}