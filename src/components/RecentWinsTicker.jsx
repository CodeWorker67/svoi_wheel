import { useMemo, useState } from 'react';
import clsx from 'clsx';
import PrizeIcon from './PrizeIcon';
import { formatHistoryMaskedName, getPrizeTitle } from '../utils/prizeDisplay';

const MAX_CARDS = 10;

function WinCard({ win }) {
  return (
    <div className="flex w-[220px] shrink-0 items-center gap-3 rounded-2xl border border-zoomer-border bg-[#0d1528]/90 px-3 py-2.5">
      <PrizeIcon prizeId={win.prizeId} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-white">{getPrizeTitle(win.prizeId)}</p>
        <p className="mt-0.5 truncate text-xs text-gray-400 normal-case">
          {formatHistoryMaskedName(win)} · {win.timeAgo}
        </p>
      </div>
    </div>
  );
}

export default function RecentWinsTicker({ wins = [] }) {
  const [paused, setPaused] = useState(false);
  const items = useMemo(() => wins.slice(0, MAX_CARDS), [wins]);
  const track = items.length > 0 ? [...items, ...items] : [];

  return (
    <div className="panel-zoomer overflow-hidden px-3 py-3 sm:px-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full bg-zoomer-neon shadow-[0_0_8px_rgba(60,255,122,0.9)]" />
          <h2 className="truncate text-sm font-bold text-white sm:text-[15px]">Последние выигрыши</h2>
        </div>
        <button
          type="button"
          onClick={() => setPaused((v) => !v)}
          className={clsx(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
            paused
              ? 'border-zoomer-neon/40 bg-zoomer-neon/10 text-zoomer-neon'
              : 'border-white/10 bg-[#0a1020] text-gray-400 hover:text-white',
          )}
          aria-label={paused ? 'Продолжить ленту' : 'Поставить ленту на паузу'}
        >
          {paused ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
            </svg>
          )}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-xs text-gray-500 py-2">Пока нет выигрышей</p>
      ) : (
        <div className="relative -mx-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div
            className={clsx(
              'ticker-marquee flex w-max gap-3 px-1',
              paused && 'ticker-marquee-paused',
            )}
            style={{ '--ticker-duration': `${Math.max(items.length * 3.5, 18)}s` }}
          >
            {track.map((win, index) => (
              <WinCard key={`${win.id}-${index}`} win={win} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
