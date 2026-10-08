import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { SUBSCRIPTION_PLANS, perMonthRub } from '../data/subscriptionPlans';
import {
  createWheelCheckout,
  fetchWheelCheckoutPurchaseMenu,
  fetchWheelCheckoutQuote,
  isWheelApiConfigured,
} from '../api/wheelApi';

function devicesPhrase(n) {
  const x = Math.abs(Number(n)) % 100;
  const last = x % 10;
  if (x >= 11 && x <= 14) return 'устройств';
  if (last === 1) return 'устройство';
  if (last >= 2 && last <= 4) return 'устройства';
  return 'устройств';
}

function planDurationLabel(plan, deviceSlots) {
  const d = deviceSlots ?? 5;
  return `${plan.months} мес. · ${d} ${devicesPhrase(d)}`;
}

function spinBonusLine(count) {
  if (count <= 0) return null;
  if (count === 1) return '+ 1 вращение колеса';
  if (count >= 2 && count <= 4) return `+ ${count} вращения колеса`;
  return `+ ${count} вращений колеса`;
}

function ticketBonusLine(count) {
  if (count <= 0) return null;
  return `+ ${count} ${count === 1 ? 'билетик' : 'билетика'}`;
}

function SelectShell({ selected, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full rounded-2xl border-2 text-left transition-all duration-200',
        'bg-gradient-to-br from-[#121c32]/95 to-[#0a1020]/90',
        selected
          ? 'border-zoomer-cyan shadow-[0_0_20px_rgba(74,232,196,0.22)]'
          : 'border-zoomer-border hover:border-zoomer-cyan/35',
        className,
      )}
    >
      {children}
    </button>
  );
}

function SbpIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[10px] font-extrabold leading-tight text-[#1a2744]">
      СБП
    </div>
  );
}

function CardIcon() {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white">
      <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#1a2744]" fill="currentColor" aria-hidden>
        <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 4v2h16V8H4zm2 4h4v2H6v-2z" />
      </svg>
    </div>
  );
}

function DurationPlanCard({ plan, selected, quotedPrice, pricePending, durationLabel, onSelect }) {
  const hasQuote = quotedPrice != null;
  const monthPrice =
    hasQuote && plan.months
      ? Math.round(quotedPrice / plan.months)
      : hasQuote
        ? null
        : perMonthRub(plan);
  const displayPrice = hasQuote ? quotedPrice : pricePending ? null : plan.price;
  const spinLine = spinBonusLine(plan.spins);
  const ticketLine = ticketBonusLine(plan.tickets);

  return (
    <SelectShell selected={selected} onClick={onSelect} className="px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-bold text-white">{durationLabel ?? plan.label}</p>
        <p className="shrink-0 text-lg font-extrabold text-white tabular-nums">
          {displayPrice != null ? `${displayPrice.toLocaleString('ru-RU')} ₽` : '…'}
        </p>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {plan.discount != null && (
            <span className="rounded-md bg-zoomer-neon/15 px-2 py-0.5 text-xs font-bold text-zoomer-neon">
              −{plan.discount}%
            </span>
          )}
          {plan.popular && (
            <span className="rounded-md bg-zoomer-cyan/15 px-2 py-0.5 text-xs font-semibold text-zoomer-cyan">
              Популярно
            </span>
          )}
        </div>
        {monthPrice != null && (
          <p className="shrink-0 text-xs text-gray-500 tabular-nums">
            {monthPrice.toLocaleString('ru-RU')} ₽ в месяц
          </p>
        )}
      </div>
      {(spinLine || ticketLine) && (
        <div className="mt-2 space-y-0.5 border-t border-zoomer-border/60 pt-2">
          {spinLine && <p className="text-xs font-medium text-zoomer-cyan">{spinLine}</p>}
          {ticketLine && <p className="text-xs font-medium text-zoomer-neon-bright">{ticketLine}</p>}
        </div>
      )}
    </SelectShell>
  );
}

export default function SubscriptionCheckout({ initData, webApp, onBackWheel }) {
  const [target, setTarget] = useState(null);
  const [durationId, setDurationId] = useState(null);
  const [payment, setPayment] = useState(null);
  const [planQuotes, setPlanQuotes] = useState({});
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [payPhase, setPayPhase] = useState('idle');
  const [createdPayment, setCreatedPayment] = useState(null);
  const [payError, setPayError] = useState(null);
  const [purchaseMenu, setPurchaseMenu] = useState(null);

  const checkoutDeviceSlots = useMemo(() => {
    if (target === 'gift') {
      return purchaseMenu?.device_slots_gift ?? 5;
    }
    if (target === 'self') {
      return purchaseMenu?.device_slots ?? 5;
    }
    return null;
  }, [target, purchaseMenu]);

  const selectedQuotedPrice =
    durationId != null && planQuotes[durationId] != null ? planQuotes[durationId] : null;

  const allSelected = Boolean(target && durationId && payment);
  const canPay =
    allSelected && payPhase === 'idle' && !quotesLoading && selectedQuotedPrice != null;

  const payAmount = selectedQuotedPrice ?? 0;

  const haptic = useCallback(() => {
    webApp?.HapticFeedback?.selectionChanged?.();
  }, [webApp]);

  useEffect(() => {
    if (!initData || !isWheelApiConfigured()) {
      setPurchaseMenu(null);
      return undefined;
    }
    let cancelled = false;
    fetchWheelCheckoutPurchaseMenu(initData)
      .then((data) => {
        if (!cancelled) setPurchaseMenu(data);
      })
      .catch(() => {
        if (!cancelled) setPurchaseMenu(null);
      });
    return () => {
      cancelled = true;
    };
  }, [initData]);

  useEffect(() => {
    if (!target || !initData || !isWheelApiConfigured()) {
      setPlanQuotes({});
      return undefined;
    }
    let cancelled = false;
    setQuotesLoading(true);
    Promise.all(
      SUBSCRIPTION_PLANS.map((plan) =>
        fetchWheelCheckoutQuote(initData, plan.id, target)
          .then((data) => ({ id: plan.id, price: data.final_rub }))
          .catch(() => ({ id: plan.id, price: null })),
      ),
    )
      .then((rows) => {
        if (cancelled) return;
        setPlanQuotes(Object.fromEntries(rows.map((r) => [r.id, r.price])));
      })
      .finally(() => {
        if (!cancelled) setQuotesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [target, initData, purchaseMenu?.device_slots, purchaseMenu?.device_slots_gift]);

  const handlePay = useCallback(async () => {
    if (!canPay || !initData) return;
    setPayError(null);
    setPayPhase('creating');
    try {
      const result = await createWheelCheckout(initData, {
        duration_key: durationId,
        target,
        payment,
      });
      setCreatedPayment(result);
      setPayPhase('created');
      webApp?.HapticFeedback?.notificationOccurred?.('success');
    } catch (e) {
      setPayPhase('idle');
      setPayError(e.message || 'Не удалось создать платёж');
      webApp?.HapticFeedback?.notificationOccurred?.('error');
      webApp?.showAlert?.(e.message || 'Не удалось создать платёж');
    }
  }, [canPay, initData, durationId, target, payment, webApp]);

  const openPayment = useCallback(() => {
    const url = createdPayment?.payment_url;
    if (!url) return;
    if (webApp?.openLink) {
      webApp.openLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [createdPayment, webApp]);

  const resetPayment = useCallback(() => {
    setPayPhase('idle');
    setCreatedPayment(null);
    setPayError(null);
  }, []);

  return (
    <div className="w-full max-w-[420px] mx-auto px-4 pb-10 pt-5 space-y-6">
      <header>
        <p className="font-display text-base font-bold tracking-wide">
          <span className="text-gradient">ВПН</span>
          <span className="text-white"> ДЛЯ СВОИХ</span>
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-white">Для кого вы хотите купить подписку:</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <SelectShell
            selected={target === 'self'}
            onClick={() => {
              haptic();
              setTarget('self');
            }}
            className="px-4 py-4 text-center"
          >
            <span className="text-sm font-bold text-white">Для себя</span>
          </SelectShell>
          <SelectShell
            selected={target === 'gift'}
            onClick={() => {
              haptic();
              setTarget('gift');
            }}
            className="px-4 py-4 text-center"
          >
            <span className="text-sm font-bold text-white">Подарить подписку</span>
          </SelectShell>
        </div>
      </section>

      {target === 'self' && purchaseMenu && (
        <p className="text-xs text-gray-400 -mt-2">
          {purchaseMenu.main_subscription_active
            ? `Продление на ${purchaseMenu.device_slots} ${devicesPhrase(purchaseMenu.device_slots)} (как в вашей подписке).`
            : 'Новая подписка на 5 устройств.'}
        </p>
      )}
      {target === 'gift' && (
        <p className="text-xs text-gray-400 -mt-2">Подарочная подписка — 5 устройств.</p>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-white">Выберите длительность подписки:</h2>
        <div className="space-y-2">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <DurationPlanCard
              key={plan.id}
              plan={plan}
              selected={durationId === plan.id}
              quotedPrice={planQuotes[plan.id] ?? null}
              pricePending={quotesLoading && planQuotes[plan.id] == null}
              durationLabel={
                target && checkoutDeviceSlots != null
                  ? planDurationLabel(plan, checkoutDeviceSlots)
                  : null
              }
              onSelect={() => {
                haptic();
                setDurationId(plan.id);
              }}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-white">Выберите способ оплаты:</h2>
        <div className="space-y-2">
          <SelectShell
            selected={payment === 'sbp'}
            onClick={() => {
              haptic();
              setPayment('sbp');
            }}
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <SbpIcon />
            <span className="text-sm font-bold text-white">СБП</span>
          </SelectShell>
          <SelectShell
            selected={payment === 'card'}
            onClick={() => {
              haptic();
              setPayment('card');
            }}
            className="flex items-center gap-3 px-4 py-3.5"
          >
            <CardIcon />
            <span className="text-sm font-bold text-white">Карта РФ</span>
          </SelectShell>
        </div>
      </section>

      {payPhase === 'created' && createdPayment ? (
        <div className="panel-zoomer space-y-4 px-4 py-5">
          <div>
            <p className="text-lg font-bold text-white">Платёж создан</p>
            <p className="mt-1 text-sm text-gray-400 tabular-nums">
              {createdPayment.amount_rub?.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <button
            type="button"
            onClick={openPayment}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#38bdf8] px-4 py-3.5 text-sm font-bold text-white shadow-neon transition-opacity hover:opacity-95"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
              <path d="M15 3h6v6M10 14L21 3" />
            </svg>
            Перейти к оплате
          </button>
          <p className="text-center text-xs leading-snug text-gray-400 px-1">
            {(createdPayment.target ?? target) === 'gift'
              ? 'После успешной оплаты мы пришлём вам подарочную ссылку в бота'
              : 'После успешной оплаты мы пришлём вам пуш в бота'}
          </p>
          <button
            type="button"
            onClick={resetPayment}
            className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-300"
          >
            Назад к выбору подписки
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!canPay || payPhase === 'creating'}
          onClick={handlePay}
          className={clsx(
            'w-full rounded-xl px-4 py-4 text-sm font-bold transition-all',
            canPay && payPhase !== 'creating'
              ? 'bg-gradient-to-r from-[#1e40af] via-[#2563eb] to-[#38bdf8] text-white shadow-neon'
              : 'cursor-not-allowed bg-[#151d2e] text-gray-500',
          )}
        >
          {payPhase === 'creating'
            ? 'Создаём платёж…'
            : canPay
              ? `Оплатить ${payAmount.toLocaleString('ru-RU')} ₽`
              : 'Выберите тип подписки, длительность и способ оплаты'}
        </button>
      )}

      {payError && payPhase === 'idle' && (
        <p className="text-center text-xs text-amber-400/90">{payError}</p>
      )}

      <button
        type="button"
        onClick={onBackWheel}
        className="w-full pt-2 text-center text-sm font-medium text-gray-500 hover:text-zoomer-cyan transition-colors"
      >
        Назад к Колесу Фортуны
      </button>
    </div>
  );
}
