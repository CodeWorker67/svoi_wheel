/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        zoomer: {
          neon: '#38bdf8',
          'neon-bright': '#60a5fa',
          'neon-dim': '#2563eb',
          green: '#22d3ee',
          cyan: '#00d4ff',
          blue: '#1e6fff',
          dark: '#050a14',
          'dark-alt': '#0a1628',
          card: '#0d1b2e',
          border: 'rgba(56, 189, 248, 0.18)',
          muted: '#64748b',
          'muted-soft': '#94a3b8',
        },
        wheel: {
          navy: '#0d1b2e',
          'navy-deep': '#0a1628',
          blue: '#2563eb',
          gold: '#38bdf8',
          'gold-deep': '#1e40af',
          purple: '#1e3a8a',
          secret: '#0ea5e9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Unbounded', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '28px',
        btn: '14px',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(56, 189, 248, 0.1), 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 60px rgba(37, 99, 235, 0.08)',
        neon: '0 4px 24px rgba(37, 99, 235, 0.35), 0 0 0 1px rgba(56, 189, 248, 0.25) inset',
        wheel: '0 0 60px rgba(37, 99, 235, 0.2), 0 20px 50px rgba(0, 0, 0, 0.6)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee linear infinite',
      },
    },
  },
  plugins: [],
}
