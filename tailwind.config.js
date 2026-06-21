/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        eco: {
          50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',
          400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',
          800:'#166534',900:'#14532d',950:'#052e16',
        },
      },
      fontFamily: {
        sans:    ["'Inter'", 'system-ui', 'sans-serif'],
        display: ["'Syne'", 'system-ui', 'sans-serif'],
        mono:    ["'JetBrains Mono'", 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      keyframes: {
        fadeUp:  { from:{ opacity:'0', transform:'translateY(14px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        fadeIn:  { from:{ opacity:'0' }, to:{ opacity:'1' } },
        scaleIn: { from:{ opacity:'0', transform:'scale(0.93)' }, to:{ opacity:'1', transform:'scale(1)' } },
        float:   { '0%,100%':{ transform:'translateY(0)' }, '50%':{ transform:'translateY(-6px)' } },
        shimmer: { from:{ backgroundPosition:'-200% center' }, to:{ backgroundPosition:'200% center' } },
        blink:   { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'0' } },
        ping2:   { '75%,100%':{ transform:'scale(1.8)', opacity:'0' } },
        countUp: { from:{ opacity:'0', transform:'translateY(6px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        slideRight: { from:{ width:'0%' }, to:{ width:'var(--tw)' } },
      },
      animation: {
        'fadeUp':  'fadeUp 0.4s ease both',
        'fadeIn':  'fadeIn 0.3s ease both',
        'scaleIn': 'scaleIn 0.35s cubic-bezier(0.4,0,0.2,1) both',
        'float':   'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'blink':   'blink 1.4s ease-in-out infinite',
        'ping2':   'ping2 1.5s cubic-bezier(0,0,0.2,1) infinite',
        'countUp': 'countUp 0.5s ease both',
      },
    },
  },
  plugins: [],
  safelist: [
    // AchievementsPanel rarity borders & badges (dynamic class strings)
    'border-gray-300','border-blue-300','border-purple-300','border-amber-300',
    'dark:border-gray-700','dark:border-blue-700','dark:border-purple-700','dark:border-amber-600',
    'shadow-blue-100','shadow-purple-100','shadow-amber-100',
    'dark:shadow-blue-900','dark:shadow-purple-900','dark:shadow-amber-900',
    'bg-gray-100','bg-blue-100','bg-purple-100','bg-amber-100',
    'dark:bg-gray-800','dark:bg-blue-900/30','dark:bg-purple-900/30','dark:bg-amber-900/30',
    'text-gray-600','text-blue-700','text-purple-700','text-amber-700',
    'dark:text-gray-400','dark:text-blue-400','dark:text-purple-400','dark:text-amber-400',
  ],
};
