import React, { useEffect, useRef, useState } from 'react';
import type { FootprintBreakdown, EcoScore, PledgeSavingsBreakdown } from '../utils/calculations';
import { BENCHMARKS } from '../utils/calculations';
import { TrendingDown, Globe, Users, Target } from 'lucide-react';

interface Props {
  breakdown: FootprintBreakdown;
  ecoScore: EcoScore;
  unit: 'kg' | 'tons';
  savings: PledgeSavingsBreakdown;
}

const HeroScore: React.FC<Props> = ({ breakdown, ecoScore, unit, savings }) => {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const target = breakdown.total;
    const start  = prevRef.current;
    prevRef.current = target;
    const dur = 900, t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(start + (target - start) * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [breakdown.total]);

  const fmt = (kg: number) =>
    unit === 'tons' ? (kg / 1000).toFixed(2) + ' t' : kg.toLocaleString() + ' kg';

  const R = 54, C = 2 * Math.PI * R;
  const filled = C * (1 - ecoScore.score / 1000);

  const SLICES = [
    { label: 'Transport', value: breakdown.transport, color: '#0ea5e9' },
    { label: 'Flights',   value: breakdown.flights,   color: '#8b5cf6' },
    { label: 'Energy',    value: breakdown.energy,    color: '#f59e0b' },
    { label: 'Diet',      value: breakdown.diet,      color: '#22c55e' },
    { label: 'Lifestyle', value: breakdown.lifestyle,  color: '#ec4899' },
  ];

  const STATS = [
    {
      icon: Globe, label: 'vs World Avg',
      value: breakdown.total < BENCHMARKS.WORLD_AVERAGE_KG
        ? `${Math.round((1 - breakdown.total / BENCHMARKS.WORLD_AVERAGE_KG) * 100)}% below ↓`
        : `${Math.round((breakdown.total / BENCHMARKS.WORLD_AVERAGE_KG - 1) * 100)}% above ↑`,
      good: breakdown.total < BENCHMARKS.WORLD_AVERAGE_KG,
    },
    {
      icon: Target, label: 'Paris Target',
      value: breakdown.total <= BENCHMARKS.PARIS_TARGET_KG ? '✓ On track' : `+${fmt(breakdown.total - BENCHMARKS.PARIS_TARGET_KG)} excess`,
      good: breakdown.total <= BENCHMARKS.PARIS_TARGET_KG,
    },
    {
      icon: TrendingDown, label: 'Pledged savings',
      value: savings.totalSavings > 0 ? `−${fmt(savings.totalSavings)}` : 'No pledges yet',
      good: savings.totalSavings > 0,
    },
    {
      icon: Users, label: 'Better than',
      value: `${ecoScore.percentileBetter}% of people`,
      good: ecoScore.percentileBetter > 50,
    },
  ];

  const displayKg = unit === 'tons' ? (displayed / 1000).toFixed(2) : displayed.toLocaleString();
  const displayUnit = unit === 'tons' ? 'metric tons' : 'kg';

  return (
    <div className="card-hero p-6 md:p-8 relative overflow-hidden">
      {/* decorative blobs */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-eco-300/25 dark:bg-eco-700/12 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-eco-400/15 dark:bg-eco-800/18 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">

        {/* Score ring */}
        <div className="flex flex-col items-center gap-2.5 shrink-0">
          <svg width="148" height="148" viewBox="0 0 148 148" role="img" aria-label={`Eco score ${ecoScore.score}`}>
            <circle cx="74" cy="74" r={R} fill="none" stroke="rgba(22,163,74,0.12)" strokeWidth="10" />
            <circle cx="74" cy="74" r={R} fill="none"
              stroke={ecoScore.color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={filled}
              style={{ transformOrigin:'74px 74px', transform:'rotate(-90deg)',
                transition:'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)',
                filter:`drop-shadow(0 0 7px ${ecoScore.color}55)` }}
            />
            <text x="74" y="67" textAnchor="middle" fontFamily="'Syne',sans-serif" fontWeight="800" fontSize="32" fill={ecoScore.color}>{ecoScore.grade}</text>
            <text x="74" y="82" textAnchor="middle" fontFamily="'Inter',sans-serif" fontWeight="600" fontSize="9.5" fill="#9ca3af" letterSpacing="1.5">ECO SCORE</text>
            <text x="74" y="97" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontWeight="500" fontSize="11.5" fill={ecoScore.color}>{ecoScore.score}/1000</text>
          </svg>
          <span className="badge text-white text-[10px]" style={{ background: ecoScore.color }}>
            {ecoScore.label}
          </span>
        </div>

        {/* Main number */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div>
            <p className="eyebrow mb-1">Your Annual Carbon Footprint</p>
            <div className="flex items-end gap-2 justify-center md:justify-start flex-wrap">
              <span className="font-display font-extrabold text-5xl md:text-6xl text-gray-900 dark:text-white leading-none tabular-nums">
                {displayKg}
              </span>
              <span className="text-base font-medium text-gray-400 dark:text-gray-500 mb-1 mono">
                {displayUnit} CO₂e/yr
              </span>
            </div>
          </div>

          {/* Category mini-bars */}
          <div className="space-y-1.5 max-w-xs mx-auto md:mx-0">
            {SLICES.map(s => {
              const pct = breakdown.total > 0 ? (s.value / breakdown.total) * 100 : 0;
              return (
                <div key={s.label} className="flex items-center gap-2.5 text-xs">
                  <span className="w-14 text-right text-gray-400 dark:text-gray-500 text-2xs font-medium shrink-0">{s.label}</span>
                  <div className="flex-1 h-1.5 bg-gray-200/70 dark:bg-gray-800/70 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width:`${pct}%`, background:s.color, transition:'width 0.7s ease' }} />
                  </div>
                  <span className="mono text-2xs text-gray-500 dark:text-gray-400 w-7 shrink-0">{Math.round(pct)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats 2×2 grid */}
        <div className="grid grid-cols-2 gap-2.5 shrink-0 w-full md:w-auto">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="card card-hover p-3 min-w-[130px]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${s.good ? 'text-eco-500' : 'text-orange-500'}`} />
                  <span className="text-2xs text-gray-400 dark:text-gray-500 font-medium">{s.label}</span>
                </div>
                <p className={`font-semibold text-sm leading-tight mono ${s.good ? 'text-eco-600 dark:text-eco-400' : 'text-orange-600 dark:text-orange-400'}`}>
                  {s.value}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default HeroScore;
