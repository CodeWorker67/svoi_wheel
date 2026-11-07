import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const COLORS = ['#ffb347', '#38bdf8', '#f472b6', '#4ade80', '#fbbf24', '#f97316', '#a78bfa', '#fff7ed'];

function buildConfetti(seed) {
  return Array.from({ length: 48 }, (_, i) => {
    const n = seed * 991 + i * 137;
    return {
      id: `${seed}-c-${i}`,
      left: `${(n * 19) % 98 + 1}%`,
      delay: `${(i % 14) * 0.08}s`,
      duration: `${2.4 + (i % 4) * 0.3}s`,
      w: 8 + (i % 4) * 3,
      h: 12 + (i % 3) * 4,
      color: COLORS[(n + i) % COLORS.length],
      drift: `${((n % 50) - 25) * 6}px`,
    };
  });
}

function buildSparks(seed) {
  return Array.from({ length: 32 }, (_, i) => {
    const angle = (360 / 32) * i;
    const dist = 75 + ((seed + i * 11) % 85);
    return {
      id: `${seed}-s-${i}`,
      angle,
      dist,
      delay: `${0.55 * (i % 2) + (i % 7) * 0.04}s`,
      size: 9 + (i % 3) * 4,
      color: COLORS[(seed + i) % COLORS.length],
    };
  });
}

export default function IphoneWinCelebration({ playKey }) {
  const [portalHost, setPortalHost] = useState(null);

  useEffect(() => {
    setPortalHost(document.body);
  }, []);

  const confetti = useMemo(() => buildConfetti(playKey), [playKey]);
  const sparks = useMemo(() => buildSparks(playKey + 7), [playKey]);

  if (!portalHost) return null;

  return createPortal(
    <div className="iphone-celebration-layer" role="presentation">
      <div className="iphone-celebration-flash" />
      <div className="iphone-celebration-ring" />

      {confetti.map((p) => (
        <span
          key={p.id}
          className="iphone-confetti-piece"
          style={{
            left: p.left,
            width: p.w,
            height: p.h,
            backgroundColor: p.color,
            boxShadow: `0 0 14px ${p.color}`,
            animationDuration: p.duration,
            animationDelay: p.delay,
            ['--iphone-drift']: p.drift,
          }}
        />
      ))}

      <div className="iphone-spark-origin">
        {sparks.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * p.dist;
          const ty = Math.sin(rad) * p.dist;
          return (
            <span
              key={p.id}
              className="iphone-spark"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 18px ${p.color}`,
                animationDelay: p.delay,
                ['--iphone-spark-x']: `${tx}px`,
                ['--iphone-spark-y']: `${ty}px`,
              }}
            />
          );
        })}
      </div>

      <div className="iphone-celebration-banner">
        <span className="iphone-celebration-emoji" aria-hidden>
          🎉
        </span>
        <p className="iphone-celebration-title">ДЖЕКПОТ!</p>
        <p className="iphone-celebration-sub">IPHONE 18 PRO</p>
      </div>
    </div>,
    portalHost,
  );
}
