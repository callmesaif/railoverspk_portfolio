'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LatestVlogs() {
  const [vlogs,   setVlogs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    async function fetchVlogs() {
      try {
        const API_KEY    = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
        const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

        // Pehle channel ka uploads playlist ID lao
        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
        );
        const channelData = await channelRes.json();
        const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

        if (!uploadsPlaylistId) throw new Error('Playlist not found');

        // Recent 30 videos fetch karo
        const videosRes = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=30&key=${API_KEY}`
        );
        const videosData = await videosRes.json();

        // Video IDs nikalo stats aur duration ke liye
        const videoIds = videosData.items
          ?.map(item => item.snippet?.resourceId?.videoId)
          .filter(Boolean)
          .join(',');

        if (!videoIds) {
          setVlogs([]);
          return;
        }

        // Duration aur stats fetch karo
        const statsRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${API_KEY}`
        );
        const statsData = await statsRes.json();

        // Filter: Strictly Landscape Vlogs (> 20 mins & NO shorts)
        const filteredAndSorted = videosData.items
          ?.map(item => {
            const videoId = item.snippet?.resourceId?.videoId;
            const details = statsData.items?.find(s => s.id === videoId);
            return {
              id:          videoId,
              title:       item.snippet?.title,
              description: item.snippet?.description,
              thumbnail:   item.snippet?.thumbnails?.maxres?.url ||
                           item.snippet?.thumbnails?.high?.url ||
                           item.snippet?.thumbnails?.medium?.url,
              publishedAt: item.snippet?.publishedAt,
              views:       details?.statistics?.viewCount,
              duration:    details?.contentDetails?.duration,
            };
          })
          .filter(v => {
            const durationInSec = getDurationInSeconds(v.duration);
            const isShortTag = /#shorts/i.test(v.title || '') || /#shorts/i.test(v.description || '');
            
            return v.id && v.title && durationInSec > 1200 && !isShortTag;
          })
          .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
          .slice(0, 4); // Sirf 4 most recent vlogs

        setVlogs(filteredAndSorted || []);
      } catch (err) {
        console.error('YouTube fetch error:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchVlogs();
  }, []);

  function getDurationInSeconds(iso) {
    if (!iso) return 0;
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const h = parseInt(match[1] || 0, 10);
    const m = parseInt(match[2] || 0, 10);
    const s = parseInt(match[3] || 0, 10);
    return h * 3600 + m * 60 + s;
  }

  function formatViews(views) {
    if (!views) return '';
    const n = parseInt(views);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M views';
    if (n >= 1000)    return (n / 1000).toFixed(1) + 'K views';
    return n + ' views';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatDuration(iso) {
    if (!iso) return '';
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '';
    const h = parseInt(match[1] || 0);
    const m = parseInt(match[2] || 0);
    const s = parseInt(match[3] || 0);
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
  }

  // Loading skeleton — 4 boxes
  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{
          background: 'var(--bg2)', borderRadius: '16px',
          overflow: 'hidden', border: '1px solid var(--border)',
        }}>
          <div style={{ aspectRatio: '16/9', background: 'var(--bg3)' }} />
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '14px', background: 'var(--bg3)', borderRadius: '4px', width: '80%' }} />
            <div style={{ height: '12px', background: 'var(--bg3)', borderRadius: '4px', width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  );

  if (error || vlogs.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
      {vlogs.map((vlog, i) => (
        <Link
          key={vlog.id}
          href={`https://www.youtube.com/watch?v=${vlog.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden',
            textDecoration: 'none',
            color: 'var(--text)',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.25s, border-color 0.25s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(255,0,0,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          {/* Strict 16:9 Landscape Frame */}
          <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: 'var(--bg3)' }}>
            {vlog.thumbnail && (
              <img
                src={vlog.thumbnail}
                alt={vlog.title}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
            }} />

            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'rgba(255,0,0,0.9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(255,0,0,0.4)',
              transition: 'transform 0.2s',
            }}>
              <svg width="18" height="18" viewBox="0 0 16 16" fill="white">
                <path d="M5 3l9 5-9 5V3z" />
              </svg>
            </div>

            {vlog.duration && (
              <span style={{
                position: 'absolute', bottom: '8px', right: '8px',
                fontSize: '11px', fontWeight: 700,
                background: 'rgba(0,0,0,0.85)',
                color: '#fff', padding: '2px 8px', borderRadius: '4px',
              }}>
                {formatDuration(vlog.duration)}
              </span>
            )}

            {i === 0 && (
              <span style={{
                position: 'absolute', top: '10px', left: '10px',
                fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em',
                textTransform: 'uppercase',
                background: 'var(--accent)', color: '#fff',
                padding: '4px 10px', borderRadius: '100px',
              }}>
                Latest
              </span>
            )}
          </div>

          <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <h3 style={{
              fontSize: '14px', fontWeight: 700, lineHeight: 1.4,
              color: 'var(--text)',
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {vlog.title}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 'auto' }}>
              {vlog.views && (
                <span style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>
                  👁 {formatViews(vlog.views)}
                </span>
              )}
              {vlog.publishedAt && (
                <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  · {formatDate(vlog.publishedAt)}
                </span>
              )}
              <span style={{
                marginLeft: 'auto', fontSize: '10px', fontWeight: 700,
                color: '#f97070', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
                </svg>
                YouTube
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}