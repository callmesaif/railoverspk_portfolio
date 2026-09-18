'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function TrainSearchBox() {
  const router = useRouter();
  const [origin,      setOrigin]      = useState('');
  const [destination, setDestination] = useState('');
  const [stations,    setStations]    = useState([]);
  const [origSug,     setOrigSug]     = useState([]);
  const [destSug,     setDestSug]     = useState([]);
  const [showOrig,    setShowOrig]    = useState(false);
  const [showDest,    setShowDest]    = useState(false);
  const origRef = useRef(null);
  const destRef = useRef(null);

  // Firestore se saari stations fetch karo
  useEffect(() => {
    async function fetchStations() {
      try {
        const q    = query(collection(db, 'trains'), where('published', '==', true));
        const snap = await getDocs(q);
        const set  = new Set();
        snap.docs.forEach(d => {
          const data = d.data();
          if (data.origin)      set.add(data.origin);
          if (data.destination) set.add(data.destination);
          (data.stops || []).forEach(s => {
            if (s.station) set.add(s.station);
          });
        });
        setStations(Array.from(set).sort());
      } catch (err) {
        console.error('Stations fetch error:', err);
      }
    }
    fetchStations();
  }, []);

  // Outside click close karo
  useEffect(() => {
    function handleClick(e) {
      if (origRef.current && !origRef.current.contains(e.target)) setShowOrig(false);
      if (destRef.current && !destRef.current.contains(e.target)) setShowDest(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function filterSuggestions(val) {
    if (!val.trim()) return [];
    return stations.filter(s => s.toLowerCase().includes(val.toLowerCase())).slice(0, 6);
  }

  function handleOrigChange(val) {
    setOrigin(val);
    setOrigSug(filterSuggestions(val));
    setShowOrig(true);
  }

  function handleDestChange(val) {
    setDestination(val);
    setDestSug(filterSuggestions(val));
    setShowDest(true);
  }

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (origin.trim())      params.set('from', origin.trim());
    if (destination.trim()) params.set('to', destination.trim());
    router.push(`/trains?${params.toString()}`);
  }

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '1.5rem',
      maxWidth: '680px',
    }}>
      {/* Title */}
      <div style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1rem' }}>
        🔍 Train Dhundo
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

        {/* Origin */}
        <div ref={origRef} style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
          <label style={LABEL}>From</label>
          <div style={INPUT_WRAP}>
            <span style={{ fontSize: '16px' }}>🚉</span>
            <input
              value={origin}
              onChange={e => handleOrigChange(e.target.value)}
              onFocus={() => { setOrigSug(filterSuggestions(origin)); setShowOrig(true); }}
              placeholder="Origin station..."
              style={INPUT}
            />
            {origin && (
              <button onClick={() => { setOrigin(''); setOrigSug([]); }} style={CLEAR}>✕</button>
            )}
          </div>
          {showOrig && origSug.length > 0 && (
            <div style={DROPDOWN}>
              {origSug.map(s => (
                <button key={s} onClick={() => { setOrigin(s); setShowOrig(false); }} style={DROP_ITEM}>
                  📍 {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          title="Swap"
          style={{
            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
            background: 'var(--bg3)', border: '1px solid var(--border2)',
            color: 'var(--accent)', cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginTop: '20px', transition: 'transform 0.3s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'rotate(180deg)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        >
          ⇄
        </button>

        {/* Destination */}
        <div ref={destRef} style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
          <label style={LABEL}>To</label>
          <div style={INPUT_WRAP}>
            <span style={{ fontSize: '16px' }}>🏁</span>
            <input
              value={destination}
              onChange={e => handleDestChange(e.target.value)}
              onFocus={() => { setDestSug(filterSuggestions(destination)); setShowDest(true); }}
              placeholder="Destination station..."
              style={INPUT}
            />
            {destination && (
              <button onClick={() => { setDestination(''); setDestSug([]); }} style={CLEAR}>✕</button>
            )}
          </div>
          {showDest && destSug.length > 0 && (
            <div style={DROPDOWN}>
              {destSug.map(s => (
                <button key={s} onClick={() => { setDestination(s); setShowDest(false); }} style={DROP_ITEM}>
                  📍 {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          style={{
            height: '48px', padding: '0 28px', borderRadius: '100px',
            background: 'var(--accent)', border: 'none', color: '#fff',
            fontSize: '12px', fontWeight: 900, letterSpacing: '0.14em',
            textTransform: 'uppercase', cursor: 'pointer',
            marginTop: '20px', flexShrink: 0,
            transition: 'opacity 0.2s',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Search
        </button>
      </div>
    </div>
  );
}

const LABEL     = { display: 'block', fontSize: '9px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '6px' };
const INPUT_WRAP= { display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '12px', padding: '10px 14px' };
const INPUT     = { flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 500 };
const CLEAR     = { background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '12px', padding: '0', flexShrink: 0 };
const DROPDOWN  = { position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' };
const DROP_ITEM = { width: '100%', padding: '10px 14px', background: 'none', border: 'none', borderBottom: '1px solid var(--border)', color: 'var(--text)', fontFamily: "'Inter', sans-serif", fontSize: '13px', textAlign: 'left', cursor: 'pointer', display: 'block' };