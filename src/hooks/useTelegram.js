import { useEffect, useMemo, useState } from 'react';

export function useTelegram() {
  const [ready, setReady] = useState(false);

  const webApp = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return window.Telegram?.WebApp ?? null;
  }, []);

  useEffect(() => {
    if (!webApp) {
      setReady(true);
      return;
    }
    webApp.ready();
    webApp.expand();
    setReady(true);
  }, [webApp]);

  return {
    ready,
    webApp,
    user: webApp?.initDataUnsafe?.user ?? null,
    isTelegram: Boolean(webApp?.initData),
  };
}
