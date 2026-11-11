/** Тарифы PRO (шаблон m{N}_d5) — как в боте; итоговая цена с API (скидка колеса, >5 устройств). */
export const SUBSCRIPTION_PLANS = [
  {
    id: 'm24_d5',
    label: '2 года · 5 устройств',
    price: 3699,
    discount: 50,
    months: 24,
    spins: 24,
    tickets: 0,
  },
  {
    id: 'm12_d5',
    label: '1 год · 5 устройств',
    price: 2399,
    discount: 33,
    months: 12,
    spins: 12,
    tickets: 0,
  },
  {
    id: 'm3_d5',
    label: '3 мес. · 5 устройств',
    price: 749,
    discount: 16,
    months: 3,
    spins: 3,
    tickets: 0,
    popular: true,
  },
  {
    id: 'm1_d5',
    label: '1 мес. · 5 устройств',
    price: 299,
    discount: null,
    months: 1,
    spins: 1,
    tickets: 0,
  },
];

export function planById(id) {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id);
}

export function perMonthRub(plan) {
  if (!plan?.months) return null;
  return Math.round(plan.price / plan.months);
}
