import clsx from 'clsx';
import { formatAttempts } from '../utils/prizeDisplay';

function AttemptsIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-zoomer-cyan/25 bg-[#121c32] shadow-[0_0_20px_rgba(74,232,196,0.12)]">
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-zoomer-cyan" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 9a8 8 0 00-14.9-3M4 15a8 8 0 0014.9 3" />
      </svg>
    </div>
  );
}

export default function AttemptsBanner({ attempts = 0 }) {
  const { title, badge, exhausted } = formatAttempts(attempts);

  return (
    <div className="panel-zoomer flex items-center gap-3 px-3 py-3 sm:px-4">
      <AttemptsIcon />
      <p className="min-w-0 flex-1 text-sm font-bold leading-snug text-white sm:text-[15px]">{title}</p>
      <span
        className={clsx(
          'shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold',
          exhausted
            ? 'border-white/10 bg-[#0a1020] text-gray-400'
            : 'border-zoomer-neon/30 bg-zoomer-neon/10 text-zoomer-neon-bright',
        )}
      >
        {badge}
      </span>
    </div>
  );
}
