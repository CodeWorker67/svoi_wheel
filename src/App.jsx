import { useState } from 'react';
import FortuneWheel from './components/FortuneWheel';
import { useTelegram } from './hooks/useTelegram';

export default function App() {
  const { ready, user } = useTelegram();
  const [showWheelChrome, setShowWheelChrome] = useState(true);

  if (!ready) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zoomer-dark">
        <div className="w-8 h-8 border-2 border-zoomer-neon border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-zoomer-dark bg-grid bg-radial-glow flex flex-col">
      {showWheelChrome && (
        <div className="w-full max-w-[420px] mx-auto px-4">
          <header className="pt-5 pb-3">
            <p className="font-display text-[15px] sm:text-base font-bold tracking-wide leading-none">
              <span className="text-gradient">ВПН</span>
              <span className="text-white"> ДЛЯ СВОИХ</span>
            </p>
          </header>

          <section className="pb-2">
            <h1 className="font-display text-[1.65rem] sm:text-[1.85rem] font-extrabold leading-tight whitespace-nowrap">
              <span className="text-white">Колесо </span>
              <span className="text-gradient">фортуны</span>
            </h1>
            {user && (
              <p className="mt-2 text-xs text-gray-400">
                {user.first_name}
                {user.username ? ` · @${user.username}` : ''}
              </p>
            )}
          </section>
        </div>
      )}

      <main
        className={
          showWheelChrome
            ? 'flex-1 flex items-start justify-center px-3 pb-10 max-w-[420px] w-full mx-auto'
            : 'flex-1 flex items-start justify-center w-full mx-auto'
        }
      >
        <FortuneWheel onScreenChange={setShowWheelChrome} />
      </main>
    </div>
  );
}
