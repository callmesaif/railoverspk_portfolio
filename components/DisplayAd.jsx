'use client';
import { useEffect, useRef } from 'react';

export default function DisplayAd({ adKey, width, height }) {
  const bannerRef = useRef(null);

  useEffect(() => {
    if (bannerRef.current && !bannerRef.current.firstChild) {
      const confScript = document.createElement('script');
      confScript.type = 'text/javascript';
      confScript.innerHTML = `
        atOptions = {
          'key' : '${adKey}',
          'format' : 'iframe',
          'height' : ${height},
          'width' : ${width},
          'params' : {}
        };
      `;
      
      const invokeScript = document.createElement('script');
      invokeScript.type = 'text/javascript';
      invokeScript.async = true;
      invokeScript.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;
      
      bannerRef.current.appendChild(confScript);
      bannerRef.current.appendChild(invokeScript);
    }
  }, [adKey, width, height]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0', overflow: 'hidden' }}>
      <div ref={bannerRef} style={{ width: `${width}px`, height: `${height}px` }}></div>
    </div>
  );
}