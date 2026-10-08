/** Тарифы PRO на 5 устройств — как в боте (m1_d5 / m3_d5). Цены с API могут учитывать скидку колеса. */
export const SUBSCRIPTION_PLANS = [
  {
    id: 'm3_d5',
    label: '3 мес. · 5 устройств',
    price: 749,
    discount: 16,
    months: 3,
    spins: 1,
    tickets: 0,
    popular: true,
  },
  {
    id: 'm1_d5',
    label: '1 мес. · 5 устройств',
    price: 299,
    discount: null,
    months: 1,
    spins: 0,
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
