/** Пусто = same-origin (dev: Vite proxy → :8080). Для prod укажите полный URL API. */
const API_BASE = (import.meta.env.VITE_WHEEL_API_URL || '').replace(/\/$/, '');

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

async function postWheel(path, initData, body = {}) {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ init_data: initData, ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.detail || data.message || res.statusText || 'Ошибка API';
    const err = new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    err.status = res.status;
    throw err;
  }
  return data;
}

export function fetchWheelState(initData) {
  return postWheel('/api/wheel/state', initData);
}

export function beginWheelSpin(initData) {
  return postWheel('/api/wheel/spin/begin', initData);
}

export function completeWheelSpin(initData) {
  return postWheel('/api/wheel/spin/complete', initData);
}

export function fetchWheelCheckoutPurchaseMenu(initData) {
  return postWheel('/api/wheel/checkout/purchase-menu', initData);
}

export function fetchWheelCheckoutQuote(initData, durationKey, target) {
  return postWheel('/api/wheel/checkout/quote', initData, {
    duration_key: durationKey,
    target,
  });
}

export function createWheelCheckout(initData, { duration_key, target, payment }) {
  return postWheel('/api/wheel/checkout/create', initData, {
    duration_key,
    target,
    payment,
  });
}

export function isWheelApiConfigured() {
  return Boolean(API_BASE) || import.meta.env.DEV;
}

export async function fetchRecentWins(limit = 24) {
  if (!isWheelApiConfigured()) return [];
  const res = await fetch(apiUrl(`/api/wheel/recent-wins?limit=${limit}`));
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  const wins = data.wins || [];
  return wins.map((w) => ({
    id: w.id,
    prizeId: w.prize_id,
    nameInitial: w.name_initial,
    maskStars: w.mask_stars,
    maskedName: w.masked_name,
    timeAgo: w.time_ago,
  }));
}
