import { useCallback, useState } from 'react';
import clsx from 'clsx';
import { useTelegram } from '../hooks/useTelegram';

const PARTNER_BOT = 'https://t.me/fastmobilevpnbot?start=partner_';
const REFERRAL_GOAL = 7;

function spinLabel(count) {
  if (count === 1) return '+1 вращение';
  if (count >= 2 && count <= 4) return `+${count} вращения`;
  return `+${count} вращений`;
}

function SectionIcon({ children }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zoomer-border bg-[#121c32] text-zoomer-cyan">
      {children}
    </div>
  );
}

function RewardRow({ title, spins }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zoomer-border bg-[#0a1020]/70 px-3 py-3">
      <p className="min-w-0 text-sm leading-snug text-gray-200">{title}</p>
      <p className="shrink-0 text-sm font-bold text-zoomer-cyan">{spinLabel(spins)}</p>
    </div>
  );
}

function AttemptsCounter({ attempts }) {
  return (
    <div className="shrink-0 rounded-xl border border-zoomer-border bg-[#0a1020]/80 px-3 py-2 text-center min-w-[72px]">
      <p className="text-2xl font-extrabold leading-none text-white">{attempts}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">попытки</p>
    </div>
  );
}

export default function SpinRewardsGuide({
  attempts = 0,
  paidFriends = 0,
  paidFriendsTotal = null,
  partnerFriendsCount = null,
  onBuySubscription,
}) {
  const { user, webApp } = useTelegram();
  const [copied, setCopied] = useState(false);

  const partnerLink = `${PARTNER_BOT}${user?.id ?? '0'}`;
  const progress = Math.min(paidFriends, REFERRAL_GOAL);
  const progressPct = (progress / REFERRAL_GOAL) * 100;
  const paidTotalLabel =
    paidFriendsTotal != null ? paidFriendsTotal : progress;

  const copyPartnerLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(partnerLink);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = partnerLink;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    webApp?.HapticFeedback?.impactOccurred?.('light');
    window.setTimeout(() => setCopied(false), 2000);
  }, [partnerLink, webApp]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-lg font-bold leading-tight text-white sm:text-xl">
          Как получить
          <br />
          вращение?
        </h2>
        <AttemptsCounter attempts={attempts} />
      </div>

      <div className="panel-zoomer space-y-3 px-3 py-4 sm:px-4">
        <div className="flex items-center gap-3">
          <SectionIcon>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </SectionIcon>
          <h3 className="text-base font-bold text-white">За новую оплату</h3>
        </div>
        <div className="space-y-2">
          <RewardRow title="Подписка 3 мес." spins={1} />
        </div>
        {onBuySubscription && (
          <button
            type="button"
            onClick={() => {
              webApp?.HapticFeedback?.impactOccurred?.('light');
              onBuySubscription();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zoomer-neon/35 bg-[#0a1020]/80 px-4 py-3.5 text-sm font-bold text-white transition-colors hover:border-zoomer-neon/55 hover:bg-zoomer-neon/5"
          >
            Купить подписку
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 px-1">
        <div className="h-px flex-1 bg-zoomer-border" />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">или</span>
        <div className="h-px flex-1 bg-zoomer-border" />
      </div>

      <div className="panel-zoomer space-y-3 px-3 py-4 sm:px-4">
        <div className="flex items-center gap-3">
          <SectionIcon>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          </SectionIcon>
          <h3 className="text-base font-bold text-white">Пригласите друзей</h3>
        </div>

        <RewardRow title={`${REFERRAL_GOAL} друзей оплатили подписку`} spins={1} />

        {partnerFriendsCount != null && (
          <p className="text-xs text-gray-500 px-1">
            Перешло по вашей ссылке: <span className="font-semibold text-gray-300">{partnerFriendsCount}</span>
            {' · '}
            оплатило: <span className="font-semibold text-gray-300">{paidFriendsTotal ?? '—'}</span>
          </p>
        )}

        <div className="rounded-xl border border-zoomer-border bg-[#0a1020]/70 px-3 py-3">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-400">Уже оплатили</span>
            <span className="font-bold text-white">
              {progress} / {REFERRAL_GOAL}
              {paidFriendsTotal != null && (
                <span className="ml-1 text-xs font-normal text-gray-500">
                  (всего {paidTotalLabel})
                </span>
              )}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#121c32]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-zoomer-neon-dim to-zoomer-cyan transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={copyPartnerLink}
          className={clsx(
            'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-bold transition-colors',
            copied
              ? 'border-zoomer-neon/40 bg-zoomer-neon/10 text-zoomer-neon-bright'
              : 'border-zoomer-cyan/35 bg-[#121c32] text-white hover:border-zoomer-cyan/55',
          )}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-zoomer-cyan" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          {copied ? 'Ссылка скопирована' : 'Скопировать партнерскую ссылку'}
        </button>
      </div>

      <div className="panel-zoomer relative overflow-hidden px-4 py-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(56,189,248,0.14),transparent_55%)]" />
        <p className="relative font-display text-4xl font-extrabold leading-none text-gradient">50%</p>
        <p className="relative mt-2 max-w-[16rem] text-sm leading-snug text-gray-300">
          от покупок приглашённого друга
        </p>
      </div>
    </div>
  );
}
