import { NextResponse } from 'next/server';
import { rateLimit, getCache, setCache } from '@/lib/api-helpers';

const API_KEY    = process.env.YOUTUBE_API_KEY;       // server-only, not NEXT_PUBLIC
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;
const CACHE_TTL  = 15 * 60 * 1000; // 15 minutes

export async function GET(req) {
  if (!rateLimit(req, 30, 60_000))
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  if (!API_KEY || !CHANNEL_ID)
    return NextResponse.json({ error: 'YouTube not configured' }, { status: 500 });

  // Serve from cache if available
  const cached = getCache('youtube_vlogs');
  if (cached) return NextResponse.json({ videos: cached });

  try {
    // 1. Get uploads playlist ID
    const chRes  = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    );
    const chData = await chRes.json();
    const playlistId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!playlistId) throw new Error('Playlist not found');

    // 2. Get latest 50 videos
    const plRes  = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`
    );
    const plData = await plRes.json();

    const videoIds = plData.items
      ?.map(i => i.snippet?.resourceId?.videoId)
      .filter(Boolean)
      .join(',');

    if (!videoIds) return NextResponse.json({ videos: [] });

    // 3. Get stats + duration
    const stRes  = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${API_KEY}`
    );
    const stData = await stRes.json();

    // 4. Build + filter (no Shorts, min 3 min)
    const videos = plData.items
      ?.map(item => {
        const id      = item.snippet?.resourceId?.videoId;
        const details = stData.items?.find(s => s.id === id);
        return {
          id,
          title:       item.snippet?.title,
          description: item.snippet?.description,
          thumbnail:
            item.snippet?.thumbnails?.maxres?.url ||
            item.snippet?.thumbnails?.high?.url   ||
            item.snippet?.thumbnails?.medium?.url,
          publishedAt: item.snippet?.publishedAt,
          views:       details?.statistics?.viewCount,
          duration:    details?.contentDetails?.duration,
        };
      })
      .filter(v => {
        if (!v.id || !v.title) return false;
        const isShort = /#shorts/i.test(v.title) || /#shorts/i.test(v.description || '');
        const secs    = parseDuration(v.duration);
        return !isShort && secs > 180; // 3 min+
      })
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 4);

    setCache('youtube_vlogs', videos, CACHE_TTL);
    return NextResponse.json({ videos });

  } catch (error) {
    console.error('[/api/youtube]', error);
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 });
  }
}

function parseDuration(iso) {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + (+(m[3] || 0));
}
