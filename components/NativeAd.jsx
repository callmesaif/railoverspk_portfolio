'use client';
import { useEffect, useRef } from 'react';

export default function NativeAd() {
  const adRef = useRef(null);

  useEffect(() => {
    if (adRef.current && !adRef.current.firstChild) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = 'https://pl28362508.effectivecpmnetwork.com/135d9080577862d37eb360cfd6b790f5/invoke.js';
      
      adRef.current.appendChild(script);
    }
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '2rem 0' }}>
      <div id="container-135d9080577862d37eb360cfd6b790f5" ref={adRef}></div>
    </div>
  );
}