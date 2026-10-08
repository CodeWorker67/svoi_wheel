/** Секторы по часовой стрелке от указателя (верх). weight — % выпадения (0 = никогда). */
export const WHEEL_PRIZES = [
  { id: 'vpn_2w', rim: '2 НЕДЕЛИ', kind: 'vpn', fill: '#1e2f4f', weight: 20 },
  { id: 'cash_100k', rim: '100 000 ₽', kind: 'money', fill: '#c97812', glow: '#ffb347', weight: 0 },
  { id: 'vpn_1m', rim: '1 МЕСЯЦ', kind: 'vpn', fill: '#1e2f4f', weight: 10 },
  { id: 'disc_50', rim: 'СКИДКА', kind: 'percent', value: '50%', fill: '#2a5088', weight: 7 },
  { id: 'disc_10', rim: 'СКИДКА', kind: 'percent', value: '10%', fill: '#1a2848', weight: 35 },
  { id: 'iphone', rim: 'IPHONE 18 PRO', kind: 'apple', fill: '#c97812', glow: '#ffb347', weight: 0 },
  { id: 'vpn_3m', rim: '3 МЕСЯЦА', kind: 'vpn', fill: '#3d4f6a', weight: 2 },
  { id: 'disc_30', rim: 'СКИДКА', kind: 'percent', value: '30%', fill: '#2a5088', weight: 20 },
  { id: 'secret', rim: 'СЕКРЕТ', kind: 'secret', fill: '#0d1b2e', glow: '#38bdf8', weight: 0 },
  { id: 'cash_1k', rim: '1 000 ₽', kind: 'money', fill: '#5a3d8a', glow: '#b794f6', weight: 0 },
  { id: 'gift', rim: 'ПОДАРОК', kind: 'gift', fill: '#1a2848', weight: 6 },
];

export const SEGMENT_COUNT = WHEEL_PRIZES.length;
export const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

/** Базовая скорость вращения колеса (градусов в секунду). */
export const BASE_WHEEL_SPEED_DEG = 10;

export function pickWeightedPrizeIndex() {
  const pool = WHEEL_PRIZES.map((prize, index) => ({ index, weight: prize.weight ?? 0 })).filter(
    (entry) => entry.weight > 0,
  );
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll <= 0) return entry.index;
  }
  return pool[pool.length - 1].index;
}
