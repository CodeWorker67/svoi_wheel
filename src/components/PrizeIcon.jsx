import { getPrizeById } from '../utils/prizeDisplay';

export default function PrizeIcon({ prizeId, className = '' }) {
  const prize = getPrizeById(prizeId);
  const kind = prize?.kind ?? 'gift';

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zoomer-border bg-[#121c32] ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        {kind === 'vpn' && (
          <text x="12" y="16" textAnchor="middle" fill="#8fffab" fontSize="9" fontWeight="800">
            VPN
          </text>
        )}
        {kind === 'percent' && (
          <text x="12" y="16" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="800">
            {prize?.value ?? '%'}
          </text>
        )}
        {kind === 'gift' && (
          <path fill="#4ae8c4" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" transform="scale(0.78) translate(1,1)" />
        )}
        {kind === 'money' && (
          <text x="12" y="17" textAnchor="middle" fill="#ffb347" fontSize="14" fontWeight="800">
            ₽
          </text>
        )}
        {kind === 'apple' && (
          <path
            fill="#ffb347"
            transform="translate(4,3) scale(0.72)"
            d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
          />
        )}
        {kind === 'secret' && (
          <text x="12" y="17" textAnchor="middle" fill="#3cff7a" fontSize="14" fontWeight="800">
            ?
          </text>
        )}
      </svg>
    </div>
  );
}
