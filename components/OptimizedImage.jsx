'use client';
import Image from 'next/image';

/* Hosts next.config.js → images.remotePatterns allows. Anything else falls back to a plain <img>
   (so a cover hosted somewhere new never breaks, it just isn't optimised). */
const OPTIMISABLE = ['i.ytimg.com', 'img.youtube.com', 'images.unsplash.com', 'firebasestorage.googleapis.com', 'i.ibb.co', 'ibb.co'];

function canOptimise(src) {
  if (!src || typeof src !== 'string') return false;
  if (src.startsWith('/')) return true; // files in /public
  try { return OPTIMISABLE.includes(new URL(src).hostname); } catch { return false; }
}

/**
 * Fills its parent — the parent must be `position: relative` and have a height / aspect-ratio.
 * Pass `sizes` (how wide the image really shows) so phones don't download desktop-sized files.
 */
export default function OptimizedImage({ src, alt = '', sizes, priority = false, style, ...rest }) {
  if (canOptimise(src)) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={{ objectFit: 'cover', ...style }} {...rest} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }}
    />
  );
}
