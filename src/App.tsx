import { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroScore from './components/HeroScore';
import CalculatorInputs from './components/CalculatorInputs';
import DashboardCharts from './components/DashboardCharts';
import ActionableInsights from './components/ActionableInsights';
import AICoach from './components/AICoach';
import AchievementsPanel from './components/AchievementsPanel';
import {
  INITIAL_INPUTS, INITIAL_PLEDGES,
  calculateFootprint, calculatePledgeSavings, calculateEcoScore,
  generateMonthlyProjection,
  type CalculatorInputs as InputType,
  type Pledges,
} from './utils/calculations';
import './App.css';

type Section = 'calculator' | 'ai' | 'achievements';

export default function App() {
  const [inputs, setInputs]     = useState<InputType>(INITIAL_INPUTS);
  const [pledges, setPledges]   = useState<Pledges>(INITIAL_PLEDGES);
  const [unit, setUnit]         = useState<'kg' | 'tons'>('kg');
  const [section, setSection]   = useState<Section>('calculator');
  const [theme, setTheme]       = useState<'light' | 'dark'>(() => {
    try { const s = localStorage.getItem('et-theme'); if (s === 'light' || s === 'dark') return s; } catch { /* localStorage may be unavailable */ }
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try { localStorage.setItem('et-theme', theme); } catch { /* localStorage may be unavailable */ }
  }, [theme]);

  const breakdown  = calculateFootprint(inputs);
  const savings    = calculatePledgeSavings(inputs, pledges);
  const ecoScore   = calculateEcoScore(breakdown.total);
  const projection = generateMonthlyProjection(breakdown.total, savings.totalSavings);

  const TABS: { id: Section; label: string; emoji: string }[] = [
    { id: 'calculator',   label: 'Calculator',   emoji: '🌍' },
    { id: 'ai',          label: 'AI Coach',      emoji: '✨' },
    { id: 'achievements', label: 'Achievements', emoji: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 via-white to-eco-100 dark:from-[#050d05] dark:via-[#081208] dark:to-[#050d05] transition-colors duration-300">
      <div className="fixed inset-0 dot-bg opacity-60 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[700px] h-[500px] bg-eco-300/10 dark:bg-eco-700/8 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[400px] bg-eco-200/10 dark:bg-eco-900/15 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">

        <Header unit={unit} setUnit={setUnit} theme={theme} toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')} />

        <HeroScore breakdown={breakdown} ecoScore={ecoScore} unit={unit} savings={savings} />

        {/* Section nav */}
        <div className="flex gap-1.5 p-1 card w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setSection(t.id)}
              className={`nav-tab ${section === t.id ? 'active' : 'inactive'}`}>
              <span>{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>

        {section === 'calculator' && (
          <div className="animate-fadeUp space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">
              <div className="lg:col-span-2">
                <CalculatorInputs inputs={inputs} onChange={setInputs} />
              </div>
              <div className="lg:col-span-3">
                <DashboardCharts breakdown={breakdown} unit={unit} theme={theme} projection={projection} />
              </div>
            </div>
            <ActionableInsights
              inputs={inputs} breakdown={breakdown}
              pledges={pledges} onPledgeChange={setPledges}
              savings={savings} unit={unit} ecoScore={ecoScore}
            />
          </div>
        )}

        {section === 'ai' && (
          <div className="animate-fadeUp">
            <AICoach inputs={inputs} breakdown={breakdown} ecoScore={ecoScore} />
          </div>
        )}

        {section === 'achievements' && (
          <div className="animate-fadeUp">
            <AchievementsPanel inputs={inputs} pledges={pledges} ecoScore={ecoScore} breakdown={breakdown} />
          </div>
        )}

        <footer className="pt-6 pb-3 border-t border-eco-200/40 dark:border-eco-900/30 flex flex-col items-center gap-2">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            {['EPA eGRID 2023','IPCC AR6','Our World in Data','Project Drawdown','ICAO CORSIA'].map(s => (
              <span key={s} className="hover:text-eco-600 dark:hover:text-eco-400 transition-colors cursor-default">{s}</span>
            ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
  CarbonIQ v2.0 • Hack2Skill PromptWars 2026 •{" "}
  <span className="font-medium">
    Designed &amp; Developed by{" "}
  </span>
  <a
    href="https://www.linkedin.com/in/mohit-meena-08a239332"
    target="_blank"
    rel="noopener noreferrer"
    className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors duration-300 hover:underline"
  >
    Mohit Meena
  </a>
</p>
        </footer>
      </div>
    </div>
  );
}
