'use client';

import { useRef, useEffect, useState, useMemo } from 'react';

export default function ParticleScene({ active, galleryUrls = [], age }) {
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [active]);

  const src = useMemo(() => {
    const params = new URLSearchParams();
    if (galleryUrls.length > 0) {
      params.set('photos', galleryUrls.join(','));
    }
    if (age) {
      params.set('age', String(age));
    }
    const qs = params.toString();
    return `/scene.html${qs ? '?' + qs : ''}`;
  }, [galleryUrls, age]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-20" style={{ backgroundColor: '#030308' }}>
      {loaded && (
        <iframe
          ref={iframeRef}
          src={src}
          className="w-full h-full border-none"
          style={{ pointerEvents: 'auto' }}
          allow="camera"
          title="particle scene"
        />
      )}
    </div>
  );
}
