import { WHEEL_PRIZES } from '../data/prizes';

const prizeById = Object.fromEntries(WHEEL_PRIZES.map((p) => [p.id, p]));

export function getPrizeById(id) {
  return prizeById[id] ?? null;
}

export function getPrizeTitle(prizeOrId) {
  const prize = typeof prizeOrId === 'string' ? prizeById[prizeOrId] : prizeOrId;
  if (!prize) return 'Приз';

  switch (prize.kind) {
    case 'vpn':
      return prize.rim ? `${prize.rim} VPN` : 'VPN';
    case 'percent':
      return prize.value ? `${prize.rim} ${prize.value}`.trim() : prize.rim || 'СКИДКА';
    case 'gift':
      return prize.rim || 'ПОДАРОК';
    case 'money':
      return prize.rim;
    case 'apple':
      return prize.rim;
    case 'secret':
      return 'Секретный приз';
    default:
      return prize.rim;
  }
}

/** Третья строка в блоке «Ваш приз» после выигрыша (нижний регистр). */
export function getPrizeWinHint(prizeOrId) {
  const prize = typeof prizeOrId === 'string' ? prizeById[prizeOrId] : prizeOrId;
  if (!prize) return null;

  switch (prize.kind) {
    case 'gift':
      return 'сейчас пришлем в бота ссылку на активацию подарка впн 1 месяц для друзей!';
    case 'percent':
      return 'активировать скидку можно после выбора тарифа в боте.';
    case 'vpn':
      return 'сейчас пришлем в бота уведомление о продлении вашей подписки!';
    default:
      return null;
  }
}

/** Имя в ленте выигрышей: первая буква как в профиле, без смены регистра. */
export function formatHistoryMaskedName(win) {
  if (!win) return '—';
  if (win.nameInitial != null && win.maskStars != null) {
    const letter = String(win.nameInitial);
    const stars = Math.max(1, Number(win.maskStars) || 3);
    return `${letter}${'*'.repeat(stars)}`;
  }
  return win.maskedName ?? '—';
}

export function formatAttempts(count) {
  if (count <= 0) {
    return { title: 'Попытки закончились', badge: 'Нет попыток', exhausted: true };
  }
  if (count === 1) {
    return { title: 'У вас 1 попытка', badge: '1 попытка', exhausted: false };
  }
  if (count >= 2 && count <= 4) {
    return { title: `У вас ${count} попытки`, badge: `${count} попытки`, exhausted: false };
  }
  return { title: `У вас ${count} попыток`, badge: `${count} попыток`, exhausted: false };
}
