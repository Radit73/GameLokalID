import { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const blobRefs = useRef([]);
  const initialPositions = [
    { x: -80, y: -40 },
    { x: 120, y: -80 },
    { x: -100, y: 140 },
    { x: 160, y: 180 },
  ];

  useEffect(() => {
    let rafId;
    let lastScroll = window.pageYOffset || 0;

    const animate = () => {
      const currentScroll = window.pageYOffset || 0;
      const delta = currentScroll - lastScroll;
      lastScroll = currentScroll;

      blobRefs.current.forEach((blob, index) => {
        if (!blob) return;
        const base = initialPositions[index] || { x: 0, y: 0 };
        const xOffset = Math.sin(currentScroll / 180 + index * 0.5) * 140;
        const yOffset = Math.cos(currentScroll / 140 + index * 0.3) * 60 + delta * 0.25;
        const x = base.x + xOffset;
        const y = base.y + yOffset;
        blob.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className="animated-bg" aria-hidden="true">
      <div className="animated-bg__grid" />
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          ref={(node) => {
            blobRefs.current[index] = node;
          }}
          className={`animated-bg__blob animated-bg__blob--${index + 1}`}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;
