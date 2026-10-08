import { useCallback, useEffect, useState } from 'react';
import { fetchRecentWins, fetchWheelState, isWheelApiConfigured } from '../api/wheelApi';
import { useTelegram } from './useTelegram';

export function useWheelState() {
  const { webApp, ready } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [state, setState] = useState({
    activeAttempts: 0,
    partnerFriendsCount: 0,
    partnerPaidCount: 0,
    partnerPaidProgress: 0,
    pendingWinIndex: null,
    recentWins: [],
  });

  const reload = useCallback(async () => {
    const initData = webApp?.initData;
    if (!ready) return;
    if (!isWheelApiConfigured() || !initData) {
      setLoading(false);
      setError(isWheelApiConfigured() ? 'Откройте колесо из Telegram' : 'API не настроен');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [data, recentWins] = await Promise.all([
        fetchWheelState(initData),
        fetchRecentWins(24),
      ]);
      setState({
        activeAttempts: data.active_attempts ?? 0,
        partnerFriendsCount: data.partner_friends_count ?? 0,
        partnerPaidCount: data.partner_paid_count ?? 0,
        partnerPaidProgress: data.partner_paid_progress ?? 0,
        pendingWinIndex: data.pending_win_index ?? null,
        recentWins,
      });
    } catch (e) {
      setError(e.message || 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [ready, webApp]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, loading, error, reload, initData: webApp?.initData ?? null, webApp };
}
