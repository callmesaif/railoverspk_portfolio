'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Casual copy-protection for public pages only.
 * Skips /admin routes so you can still edit content, right-click,
 * and copy-paste freely in your own admin panel.
 *
 * NOTE: This deters average visitors only — not a real security
 * measure. Determined users can always bypass via browser settings.
 */
export default function CopyProtection() {
  const pathname = usePathname();
  const isAdmin  = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return; // never restrict yourself in admin panel

    function handleContextMenu(e) {
      e.preventDefault();
    }

    function handleKeyDown(e) {
      const key = e.key?.toLowerCase();

      if (e.key === 'F12') { e.preventDefault(); return; }
      if (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) { e.preventDefault(); return; }
      if (e.ctrlKey && key === 'u') { e.preventDefault(); return; }
      if (e.ctrlKey && key === 's') { e.preventDefault(); return; }
      if (e.ctrlKey && (key === 'c' || key === 'x')) { e.preventDefault(); return; }
    }

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdmin]);

  if (isAdmin) return null; // no CSS restrictions in admin either

  return (
    <style jsx global>{`
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
      img {
        -webkit-user-drag: none;
        pointer-events: none;
      }
      a img, button img, [onclick] img {
        pointer-events: auto;
      }
    `}</style>
  );
}
