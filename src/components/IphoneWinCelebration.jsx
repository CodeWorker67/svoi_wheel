import { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#ffb347', '#38bdf8', '#f472b6', '#4ade80', '#fbbf24', '#f97316', '#a78bfa', '#fff7ed'];

function confettiPieces(seed, count = 56) {
  return Array.from({ length: count }, (_, i) => {
    const n = seed * 997 + i * 131;
    return {
      id: `${seed}-${i}`,
      left: `${(n * 17) % 100}%`,
      delay: (i % 12) * 0.07,
      duration: 2.2 + (i % 5) * 0.35,
      size: 6 + (i % 5) * 2,
      color: COLORS[(n + i) % COLORS.length],
      drift: ((n % 41) - 20) * 4,
      rotate: (n % 360) - 180,
    };
  });
}

function radialBurst(seed, count = 36) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i;
    const dist = 90 + ((seed + i * 9) % 70);
    return {
      id: `b-${seed}-${i}`,
      angle,
      dist,
      delay: (i % 6) * 0.05,
      color: COLORS[(seed + i) % COLORS.length],
      size: 7 + (i % 3) * 3,
    };
  });
}

export default function IphoneWinCelebration() {
  const confetti = useMemo(() => confettiPieces(1), []);
  const burstA = useMemo(() => radialBurst(3), []);
  const burstB = useMemo(() => radialBurst(19), []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,179,71,0.22),transparent_55%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.65, 0] }}
        transition={{ duration: 3.2, ease: 'easeOut' }}
      />

      {confetti.map((p) => (
        <motion.span
          key={p.id}
          className="iphone-confetti absolute rounded-sm"
          style={{
            left: p.left,
            top: '-8%',
            width: p.size,
            height: p.size * 1.45,
            backgroundColor: p.color,
            boxShadow: `0 0 12px ${p.color}`,
          }}
          initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
          animate={{
            y: '115vh',
            x: p.drift,
            opacity: [1, 1, 0.85, 0],
            rotate: p.rotate + 540,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.12, 0.55, 0.25, 1],
            repeat: 1,
            repeatDelay: 0.35,
          }}
        />
      ))}

      {[burstA, burstB].map((burst, bi) => (
        <div
          key={bi}
          className="absolute left-1/2"
          style={{ top: bi === 0 ? '38%' : '52%' }}
        >
          {burst.map((p) => {
            const rad = (p.angle * Math.PI) / 180;
            const tx = Math.cos(rad) * p.dist;
            const ty = Math.sin(rad) * p.dist;
            return (
              <motion.span
                key={p.id}
                className="absolute left-0 top-0 rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  marginLeft: -p.size / 2,
                  marginTop: -p.size / 2,
                  backgroundColor: p.color,
                  boxShadow: `0 0 16px ${p.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1.25 }}
                animate={{ x: tx, y: ty, opacity: 0, scale: 0.2 }}
                transition={{
                  duration: 1.35,
                  delay: bi * 0.55 + p.delay,
                  ease: [0.12, 0.85, 0.22, 1],
                }}
              />
            );
          })}
        </div>
      ))}

      <motion.div
        className="absolute left-1/2 top-[42%] -translate-x-1/2 text-5xl drop-shadow-[0_0_18px_rgba(255,179,71,0.9)]"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{ scale: [0.2, 1.45, 1.05], opacity: [0, 1, 1] }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        🎉
      </motion.div>

      <motion.p
        className="absolute left-1/2 top-[48%] w-full max-w-[16rem] -translate-x-1/2 text-center text-sm font-bold tracking-wide text-[#ffb347]"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -6] }}
        transition={{ duration: 2.8, ease: 'easeOut' }}
      >
        ДЖЕКПОТ!
      </motion.p>
    </div>
  );
}
