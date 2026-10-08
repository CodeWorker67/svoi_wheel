import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import clsx from 'clsx';
import {
  BASE_WHEEL_SPEED_DEG,
  SEGMENT_ANGLE,
  WHEEL_PRIZES,
} from '../data/prizes';
import { beginWheelSpin, completeWheelSpin, isWheelApiConfigured } from '../api/wheelApi';
import { getPrizeTitle, getPrizeWinHint } from '../utils/prizeDisplay';
import { useWheelState } from '../hooks/useWheelState';
import AttemptsBanner from './AttemptsBanner';
import RecentWinsTicker from './RecentWinsTicker';
import SpinRewardsGuide from './SpinRewardsGuide';
import SubscriptionCheckout from './SubscriptionCheckout';

const CX = 200;
const CY = 200;
const R_OUT = 188;
const R_IN = 52;

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(index) {
  const start = index * SEGMENT_ANGLE;
  const end = (index + 1) * SEGMENT_ANGLE;
  const p1 = polarToCartesian(CX, CY, R_OUT, start);
  const p2 = polarToCartesian(CX, CY, R_OUT, end);
  const p3 = polarToCartesian(CX, CY, R_IN, end);
  const p4 = polarToCartesian(CX, CY, R_IN, start);
  const large = SEGMENT_ANGLE > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${R_OUT} ${R_OUT} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${R_IN} ${R_IN} 0 ${large} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

function SegmentCenter({ prize, index }) {
  const mid = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
  const pos = polarToCartesian(CX, CY, 96, mid);
  const common = {
    textAnchor: 'middle',
    dominantBaseline: 'middle',
    className: 'select-none pointer-events-none',
  };

  let node = null;
  switch (prize.kind) {
    case 'vpn':
      node = (
        <text {...common} fill="#93c5fd" fontSize="20" fontWeight="800">
          VPN
        </text>
      );
      break;
    case 'money':
      node = (
        <text {...common} fill={prize.glow || '#ffb347'} fontSize="34" fontWeight="800">
          ₽
        </text>
      );
      break;
    case 'percent':
      node = (
        <text {...common} fill="#ffffff" fontSize="24" fontWeight="800">
          {prize.value}
        </text>
      );
      break;
    case 'apple': {
      const axisX = 11.85;
      const axisY = 11.5;
      node = (
        <g fill="#ffb347" transform={`scale(1.496) translate(${-axisX}, ${-axisY})`}>
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </g>
      );
      break;
    }
    case 'secret':
      node = (
        <text {...common} fill="#38bdf8" fontSize="32" fontWeight="800">
          ?
        </text>
      );
      break;
    case 'gift':
      node = (
        <g fill="#60a5fa" transform="translate(-12,-10) scale(0.85)">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </g>
      );
      break;
    default:
      break;
  }

  return (
    <g transform={`translate(${pos.x}, ${pos.y}) rotate(${mid + 90})`}>{node}</g>
  );
}

function RimLabel({ index, text }) {
  const mid = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
  const pos = polarToCartesian(CX, CY, R_OUT - 22, mid);
  return (
    <text
      x={pos.x}
      y={pos.y}
      textAnchor="middle"
      dominantBaseline="middle"
      transform={`rotate(${mid}, ${pos.x}, ${pos.y})`}
      fill="rgba(255,255,255,0.92)"
      fontSize="9.5"
      fontWeight="700"
      letterSpacing="0.04em"
      className="select-none pointer-events-none"
    >
      {text}
    </text>
  );
}

function prizeIndexById(prizeId) {
  const i = WHEEL_PRIZES.findIndex((p) => p.id === prizeId);
  return i >= 0 ? i : 0;
}

function rotationDelta(currentDeg, winIndex) {
  const centerAngle = winIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
  const currentMod = ((currentDeg % 360) + 360) % 360;
  let delta = 360 - centerAngle - currentMod;
  while (delta <= 0) delta += 360;
  return 360 * 7 + delta;
}

export default function FortuneWheel({ onScreenChange }) {
  const {
    activeAttempts,
    partnerFriendsCount,
    partnerPaidCount,
    partnerPaidProgress,
    recentWins,
    loading,
    error,
    reload,
    initData,
    webApp,
  } = useWheelState();

  const rotation = useMotionValue(0);
  const displayRotation = useTransform(rotation, (v) => `${v}deg`);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [screen, setScreen] = useState('wheel');

  const goSubscription = useCallback(() => {
    setScreen('subscription');
    onScreenChange?.(false);
  }, [onScreenChange]);

  const goWheel = useCallback(() => {
    setScreen('wheel');
    onScreenChange?.(true);
  }, [onScreenChange]);

  useEffect(() => {
    const scrollTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scrollTop();
    requestAnimationFrame(scrollTop);
  }, [screen]);

  const speedDegPerSec = useRef(BASE_WHEEL_SPEED_DEG);
  const deceleratingRef = useRef(false);
  const spinAnimationRef = useRef(null);

  useEffect(() => {
    let frameId;
    let lastTime = performance.now();

    const tick = (now) => {
      if (!deceleratingRef.current) {
        const dt = (now - lastTime) / 1000;
        rotation.set(rotation.get() + speedDegPerSec.current * dt);
      }
      lastTime = now;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [rotation]);

  const runSpinAnimation = useCallback(
    (winIndex, onDone) => {
      speedDegPerSec.current /= 2;
      const from = rotation.get();
      const delta = rotationDelta(from, winIndex);
      const to = from + delta;
      const duration = Math.min(7.5, Math.max(2.5, delta / Math.max(speedDegPerSec.current * 1.8, 4)));

      deceleratingRef.current = true;
      spinAnimationRef.current?.stop();
      spinAnimationRef.current = animate(rotation, to, {
        duration,
        ease: [0.12, 0.8, 0.2, 1],
        onComplete: () => {
          deceleratingRef.current = false;
          spinAnimationRef.current = null;
          onDone?.();
        },
      });
    },
    [rotation],
  );

  const spin = useCallback(async () => {
    if (spinning) return;

    const apiOk = isWheelApiConfigured() && initData;
    if (apiOk && activeAttempts <= 0) {
      webApp?.showAlert?.('У вас нет попыток!');
      webApp?.HapticFeedback?.notificationOccurred?.('error');
      return;
    }

    setSpinning(true);
    setResult(null);

    let winIndex = 0;
    let rimLabel = '';

    try {
      if (apiOk) {
        const begin = await beginWheelSpin(initData);
        winIndex = prizeIndexById(begin.prize_id);
        if (typeof begin.win_index === 'number' && begin.win_index !== winIndex) {
          console.warn('Wheel win_index mismatch', begin.win_index, winIndex, begin.prize_id);
        }
        rimLabel = begin.rim || WHEEL_PRIZES[winIndex]?.rim || '';
      } else {
        webApp?.showAlert?.('API колеса не настроен');
        setSpinning(false);
        return;
      }

      runSpinAnimation(winIndex, async () => {
        const prize = WHEEL_PRIZES[winIndex];
        setResult({ ...prize, rim: rimLabel || prize.rim });
        try {
          if (apiOk) {
            await completeWheelSpin(initData);
          }
        } catch (e) {
          if (e.status !== 400) {
            console.error(e);
          }
        }
        await reload();
        setSpinning(false);
        webApp?.HapticFeedback?.notificationOccurred?.('success');
      });
    } catch (e) {
      setSpinning(false);
      const msg = e.status === 403 ? 'У вас нет попыток!' : e.message || 'Не удалось крутить';
      webApp?.showAlert?.(msg);
    }
  }, [spinning, activeAttempts, initData, webApp, runSpinAnimation, reload]);

  const hintText =
    activeAttempts <= 0 && !loading
      ? 'Зарабатывайте вращения и испытайте удачу!'
      : spinning
        ? 'Крутим…'
        : 'Нажмите СТАРТ и испытайте удачу!';

  const progressPaid = isWheelApiConfigured() ? partnerPaidProgress : 0;

  if (screen === 'subscription') {
    return (
      <SubscriptionCheckout
        initData={initData}
        webApp={webApp}
        onBackWheel={goWheel}
      />
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-[min(100vw,420px)] mx-auto">
      {error && (
        <p className="mb-2 w-full px-2 text-center text-xs text-amber-400/90">{error}</p>
      )}

      <div className="relative w-full aspect-square max-w-[400px]">
        <div
          className="absolute left-1/2 -translate-x-1/2 -top-1 z-30 w-0 h-0"
          style={{
            borderLeft: '14px solid transparent',
            borderRight: '14px solid transparent',
            borderTop: '22px solid #38bdf8',
            filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.85))',
          }}
        />

        <div className="absolute inset-2 rounded-full shadow-wheel ring-1 ring-zoomer-border" />

        <motion.div
          className="relative w-full h-full"
          style={{ rotate: displayRotation }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
            <defs>
              {WHEEL_PRIZES.map((p, i) => (
                <linearGradient
                  key={p.id}
                  id={`grad-${p.id}`}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={p.fill} />
                  <stop offset="100%" stopColor="#0a1020" stopOpacity="0.35" />
                </linearGradient>
              ))}
            </defs>
            {WHEEL_PRIZES.map((prize, i) => (
              <g key={prize.id}>
                <path
                  d={wedgePath(i)}
                  fill={`url(#grad-${prize.id})`}
                  stroke="rgba(0,0,0,0.45)"
                  strokeWidth="1.2"
                />
                <RimLabel index={i} text={prize.rim} />
                <SegmentCenter prize={prize} index={i} />
              </g>
            ))}
            <circle cx={CX} cy={CY} r={R_IN + 4} fill="#0d1528" stroke="rgba(74,232,196,0.35)" strokeWidth="2" />
          </svg>
        </motion.div>

        <button
          type="button"
          onClick={spin}
          disabled={spinning || loading}
          className={clsx(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20',
            'w-[26%] aspect-square max-w-[104px] rounded-full',
            'bg-gradient-to-b from-[#1a2848] to-[#0a1020]',
            'border-2 border-zoomer-cyan/50 shadow-[0_0_24px_rgba(74,232,196,0.35)]',
            'font-extrabold text-sm sm:text-base tracking-widest text-white',
            'transition-transform active:scale-95 disabled:opacity-60 disabled:active:scale-100',
          )}
          aria-label="Крутить колесо"
        >
          СТАРТ
        </button>
      </div>

      <div className="mt-6 min-h-[5.5rem] w-full text-center px-4">
        {result ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-dark inline-block max-w-[min(100%,22rem)] px-6 py-4"
          >
            <p className="text-sm text-gray-400 mb-1">Ваш приз</p>
            <p className="text-lg font-bold text-gradient">{getPrizeTitle(result)}</p>
            {getPrizeWinHint(result) ? (
              <p className="mt-2 text-xs leading-snug text-gray-400 normal-case">
                {getPrizeWinHint(result)}
              </p>
            ) : null}
          </motion.div>
        ) : (
          <p className="text-sm text-gray-500">{hintText}</p>
        )}
      </div>

      <div className="mt-4 w-full space-y-3 px-1">
        <AttemptsBanner attempts={activeAttempts} />
        <RecentWinsTicker wins={recentWins} />
        <SpinRewardsGuide
          attempts={activeAttempts}
          paidFriends={progressPaid}
          paidFriendsTotal={partnerPaidCount}
          partnerFriendsCount={partnerFriendsCount}
          onBuySubscription={goSubscription}
        />
      </div>
    </div>
  );
}
