'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Mounts `children` only when the placeholder is about to scroll into view.
 * Until then it reserves `minHeight` so the page below doesn't jump when the content arrives.
 * Used for below-the-fold sections: their code, data and images load when needed, not at page load.
 */
export default function LazyOnView({ children, minHeight = 300, rootMargin = '200px' }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return undefined;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setShow(true); return undefined; }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setShow(true); io.disconnect(); }
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return <div ref={ref} style={show ? undefined : { minHeight }}>{show ? children : null}</div>;
}
