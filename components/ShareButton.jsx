'use client';
import { useState, useEffect, useRef } from 'react';

export default function ShareButton({ url, title, compact = false }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const encodedUrl   = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const SHARE_LINKS = [
    {
      label: 'WhatsApp',
      color: '#25D366',
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.5-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4 0-.5C10.1 9 9.6 7.8 9.4 7.3c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3 4.8 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 2-1.4.2-.7.2-1.2.1-1.4-.1-.1-.2-.2-.5-.4z"/>
          <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.4 5.1L2 22l5.1-1.3C8.5 21.5 10.2 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3.1.8.8-3-.2-.3C4.3 14.9 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z"/>
        </svg>
      ),
    },
    {
      label: 'Facebook',
      color: '#1877F2',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7C18.3 21.1 22 17 22 12z"/>
        </svg>
      ),
    },
    {
      label: 'Twitter / X',
      color: '#000000',
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'var(--muted)', background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: '100px', padding: compact ? '9px 16px' : '11px 20px',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/><line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>
        </svg>
        Share
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', right: 0, zIndex: 50,
          background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px',
          padding: '8px', minWidth: '190px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
        }}>
          {SHARE_LINKS.map(({ label, color, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
                color: 'var(--text)', fontSize: '13px', fontWeight: 600,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ color, display: 'flex', alignItems: 'center' }}>{icon}</span>
              {label}
            </a>
          ))}

          <div style={{ height: '1px', background: 'var(--border)', margin: '6px 4px' }} />

          <button
            onClick={copyLink}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '10px 12px', borderRadius: '10px', border: 'none',
              background: 'transparent', color: copied ? '#3fca7a' : 'var(--text)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              )}
            </span>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  );
}
