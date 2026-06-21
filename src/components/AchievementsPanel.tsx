import React from 'react';
import type { CalculatorInputs, Pledges, EcoScore, FootprintBreakdown } from '../utils/calculations';
import { BENCHMARKS } from '../utils/calculations';
import { Trophy, Lock, Star } from 'lucide-react';

interface Props {
  inputs: CalculatorInputs;
  pledges: Pledges;
  ecoScore: EcoScore;
  breakdown: FootprintBreakdown;
}

interface Ach {
  id: string; emoji: string; title: string; desc: string;
  earned: boolean; rarity: 'Common'|'Rare'|'Epic'|'Legendary';
}

const R_STYLE = {
  Common:    { border:'border-gray-300 dark:border-gray-700',  badge:'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',   ring:'' },
  Rare:      { border:'border-blue-300 dark:border-blue-700',  badge:'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',  ring:'shadow-blue-100 dark:shadow-blue-900' },
  Epic:      { border:'border-purple-300 dark:border-purple-700', badge:'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', ring:'shadow-purple-100 dark:shadow-purple-900' },
  Legendary: { border:'border-amber-300 dark:border-amber-600', badge:'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', ring:'shadow-amber-100 dark:shadow-amber-900' },
};

const AchievementsPanel: React.FC<Props> = ({ inputs, pledges, ecoScore, breakdown }) => {
  const pledgeCount = Object.values(pledges).filter(Boolean).length;

  const ALL: Ach[] = [
    // Score
    { id:'first',       emoji:'🌍', title:'First Steps',       rarity:'Common',    desc:'Calculated your carbon footprint.',                           earned: breakdown.total > 0 },
    { id:'b_zone',      emoji:'🌿', title:'Green Zone',        rarity:'Rare',      desc:'Eco Score above 500.',                                        earned: ecoScore.score >= 500 },
    { id:'eco_lead',    emoji:'🏅', title:'Eco Leader',        rarity:'Epic',      desc:'Eco Score above 700. You inspire others.',                    earned: ecoScore.score >= 700 },
    { id:'champion',    emoji:'🏆', title:'Climate Champion',  rarity:'Legendary', desc:'Eco Score above 900. You are in the top 1%.',                 earned: ecoScore.score >= 900 },
    // Footprint
    { id:'below_world', emoji:'🌎', title:'World Beater',      rarity:'Rare',      desc:`Below the world average of ${(BENCHMARKS.WORLD_AVERAGE_KG/1000).toFixed(1)}t/yr.`, earned: breakdown.total < BENCHMARKS.WORLD_AVERAGE_KG },
    { id:'below_eu',    emoji:'🇪🇺', title:'EU Standard',      rarity:'Rare',      desc:`Below the EU average of ${(BENCHMARKS.EU_AVERAGE_KG/1000).toFixed(1)}t/yr.`,     earned: breakdown.total < BENCHMARKS.EU_AVERAGE_KG },
    { id:'paris',       emoji:'🎯', title:'Paris Aligned',     rarity:'Epic',      desc:'Within the Paris Agreement 1.5°C per-capita budget.',         earned: breakdown.total <= BENCHMARKS.PARIS_TARGET_KG },
    { id:'zero',        emoji:'⚡', title:'Zero Hero',          rarity:'Legendary', desc:'Near-zero carbon footprint. Incredible!',                     earned: breakdown.total < 500 },
    // Lifestyle
    { id:'no_flights',  emoji:'✈️', title:'Feet on Ground',    rarity:'Common',    desc:'Zero flights this year.',                                      earned: inputs.flightsShort===0 && inputs.flightsLong===0 },
    { id:'ev',          emoji:'⚡', title:'Electric Explorer',  rarity:'Rare',      desc:'Driving an EV — leading the transport transition.',            earned: inputs.carType==='electric' },
    { id:'car_free',    emoji:'🚶', title:'Car-Free Crusader', rarity:'Epic',      desc:'Living without a car. Near-zero transport emissions.',          earned: inputs.carType==='none' },
    { id:'vegan',       emoji:'🌱', title:'Plant Powered',     rarity:'Epic',      desc:'Vegan diet — the biggest individual dietary action for climate.', earned: inputs.dietType==='vegan' },
    { id:'flex',        emoji:'🥗', title:'Climate Eater',     rarity:'Common',    desc:'Flexitarian or better. Reducing meat makes a real difference.', earned: ['vegan','vegetarian','pescatarian','flexitarian'].includes(inputs.dietType) },
    // Pledges
    { id:'pledge1',     emoji:'📋', title:'Pledge Starter',    rarity:'Common',    desc:'Made your first climate pledge.',                              earned: pledgeCount >= 1 },
    { id:'pledge5',     emoji:'🌟', title:'Committed',         rarity:'Rare',      desc:'Made 5+ climate pledges.',                                    earned: pledgeCount >= 5 },
    { id:'pledge_all',  emoji:'💚', title:'All-In',            rarity:'Epic',      desc:'Activated all 9 pledges. Maximum commitment!',                earned: pledgeCount >= 9 },
  ];

  const earned = ALL.filter(a => a.earned);
  const locked = ALL.filter(a => !a.earned);
  const pct    = Math.round((earned.length / ALL.length) * 100);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label:'Achievements', value:`${earned.length}/${ALL.length}`, color:'text-eco-600 dark:text-eco-400' },
          { label:'Eco Score',    value:`${ecoScore.score}`,              color:'text-eco-600 dark:text-eco-400' },
          { label:'Grade',        value: ecoScore.grade,                  color: ecoScore.color },
          { label:'Pledges',      value:`${pledgeCount}/9`,               color:'text-eco-600 dark:text-eco-400' },
        ].map((s,i) => (
          <div key={i} className="card p-4 text-center">
            <p className="eyebrow mb-1">{s.label}</p>
            <p className={`font-display font-extrabold text-3xl leading-none ${i!==2 ? s.color : ''}`} style={i===2 ? {color:ecoScore.color} : {}}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card p-4 space-y-2">
        <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
          <span>Overall progress</span><span className="mono">{pct}% complete</span>
        </div>
        <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <div className="prog-fill" style={{ width:`${pct}%` }} />
        </div>
        <p className="text-2xs text-gray-400 dark:text-gray-500">{locked.length} achievements remaining</p>
      </div>

      {/* Earned */}
      {earned.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">Earned ({earned.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {earned.map(a => {
              const s = R_STYLE[a.rarity];
              return (
                <div key={a.id} className={`card achieve-pop border-2 ${s.border} ${a.rarity!=='Common'?`shadow-lg ${s.ring}`:''} relative`}>
                  {a.rarity==='Legendary' && (
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 rounded-t-[18px]" />
                  )}
                  <div className="p-4 flex items-start gap-3">
                    <span className="text-2xl leading-none shrink-0">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <h4 className="font-display font-bold text-sm text-gray-900 dark:text-white">{a.title}</h4>
                        <span className={`badge ${s.badge}`}>{a.rarity}</span>
                      </div>
                      <p className="text-2xs text-gray-400 dark:text-gray-500 leading-relaxed">{a.desc}</p>
                    </div>
                    <Star className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked */}
      {locked.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gray-400" />
            <h3 className="font-display font-bold text-base text-gray-400 dark:text-gray-500">Locked ({locked.length})</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {locked.map(a => {
              const s = R_STYLE[a.rarity];
              return (
                <div key={a.id} className={`card border-2 ${s.border} opacity-50 relative`}>
                  <div className="p-4 flex items-start gap-3">
                    <span className="text-2xl leading-none shrink-0 grayscale">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <h4 className="font-display font-bold text-sm text-gray-500 dark:text-gray-400">{a.title}</h4>
                        <span className={`badge ${s.badge}`}>{a.rarity}</span>
                      </div>
                      <p className="text-2xs text-gray-400 dark:text-gray-500 leading-relaxed">{a.desc}</p>
                    </div>
                    <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementsPanel;
