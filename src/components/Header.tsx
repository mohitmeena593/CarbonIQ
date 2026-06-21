import React from 'react';
import { Leaf, Sun, Moon } from 'lucide-react';

interface Props {
  unit: 'kg' | 'tons';
  setUnit: (u: 'kg' | 'tons') => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Header: React.FC<Props> = ({ unit, setUnit, theme, toggleTheme }) => (
  <header className="card px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-eco-400 to-eco-700 flex items-center justify-center shadow-md">
          <Leaf className="w-5 h-5 text-white" strokeWidth={2.5} />
        </div>
        <div className="absolute -inset-1 rounded-xl bg-eco-400/20 blur-md -z-10" />
      </div>
      <div>
        <h1 className="font-display font-extrabold text-xl text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
          CarbonIQ
          <span className="badge bg-eco-100 dark:bg-eco-900/50 text-eco-700 dark:text-eco-300 text-[10px]">v2.0</span>
        </h1>
        <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">AI Carbon Footprint Platform · Hack2Skill PromptWars 2026</p>
      </div>
    </div>

    <div className="flex items-center gap-2.5">
      <div className="flex bg-gray-100 dark:bg-gray-900/60 p-1 rounded-xl gap-1">
        {(['kg','tons'] as const).map(u => (
          <button key={u} onClick={() => setUnit(u)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
              unit === u ? 'bg-eco-600 text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}>
            {u === 'kg' ? 'kg CO₂' : 'Metric t'}
          </button>
        ))}
      </div>
      <button onClick={toggleTheme} aria-label="Toggle theme"
        className="w-8 h-8 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-eco-50 dark:hover:bg-eco-900/30 hover:border-eco-300 dark:hover:border-eco-700 transition-all">
        {theme === 'dark'
          ? <Sun className="w-4 h-4 text-amber-400" />
          : <Moon className="w-4 h-4 text-eco-600" />}
      </button>
    </div>
  </header>
);

export default Header;
