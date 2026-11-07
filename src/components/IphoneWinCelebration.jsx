import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BURST_COLORS = ['#ffb347', '#38bdf8', '#f472b6', '#4ade80', '#fbbf24', '#f97316', '#a78bfa'];

function makeBurst(seed, count = 22) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i + (seed % 17) * 3.7;
    const dist = 55 + ((seed + i * 7) % 55);
    return {
      id: `${seed}-${i}`,
      angle,
      dist,
      color: BURST_COLORS[(seed + i) % BURST_COLORS.length],
      delay: (i % 5) * 0.04,
      size: 3 + (i % 4),
    };
  });
}

export default function IphoneWinCelebration() {
  const [burstKey, setBurstKey] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setBurstKey(1), 0);
    const t2 = setTimeout(() => setBurstKey(2), 550);
    const t3 = setTimeout(() => setBurstKey(3), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const particles = useMemo(() => makeBurst(burstKey * 41 + 3), [burstKey]);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {particles.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * p.dist;
          const ty = Math.sin(rad) * p.dist;
          return (
            <motion.span
              key={p.id}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1.2 }}
              animate={{ x: tx, y: ty, opacity: 0, scale: 0.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.05, delay: p.delay, ease: [0.15, 0.9, 0.2, 1] }}
            />
          );
        })}
      </AnimatePresence>

      <motion.div
        className="absolute text-4xl"
        initial={{ scale: 0, opacity: 0, rotate: -20 }}
        animate={{ scale: [0, 1.35, 1], opacity: [0, 1, 1], rotate: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        aria-hidden
      >
        🎉
      </motion.div>
    </div>
  );
}
