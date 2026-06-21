import React from 'react';
import type { CalculatorInputs, FootprintBreakdown, Pledges, PledgeSavingsBreakdown, EcoScore } from '../utils/calculations';
import { CheckCircle2, Circle, Download, Lightbulb, ArrowRight } from 'lucide-react';

interface Props {
  inputs: CalculatorInputs;
  breakdown: FootprintBreakdown;
  pledges: Pledges;
  onPledgeChange: (p: Pledges) => void;
  savings: PledgeSavingsBreakdown;
  unit: 'kg' | 'tons';
  ecoScore: EcoScore;
}

const PLEDGES = [
  { k:'bikeToWork'       as const, e:'🚲', l:'Bike or walk for short trips',   d:'Replace car trips under 5 miles',    sk:'bikeToWork'       as const },
  { k:'meatlessMondays'  as const, e:'🥦', l:'Meatless Mondays',               d:'Eat plant-based 1 day/week',         sk:'meatlessMondays'  as const },
  { k:'thermostatAdjust' as const, e:'🌡️', l:'Smarter thermostat (±2°F)',      d:'Saves ~15% on heating & cooling',    sk:'thermostatAdjust' as const },
  { k:'lineDryClothes'   as const, e:'👕', l:'Line-dry laundry',               d:'Skip the dryer half the time',       sk:'lineDryClothes'   as const },
  { k:'ledBulbs'         as const, e:'💡', l:'Switch to LED lighting',          d:'75% less energy than incandescent',  sk:'ledBulbs'         as const },
  { k:'buyLocal'         as const, e:'🍅', l:'Buy local & seasonal food',       d:'Reduce food transport emissions',    sk:'buyLocal'         as const },
  { k:'reduceFlights'    as const, e:'✈️', l:'Skip one flight per year',        d:'Replace with train or video call',   sk:'reduceFlights'    as const },
  { k:'solarSwitch'      as const, e:'☀️', l:'Switch to renewable energy',      d:'Solar panels or green energy tariff',sk:'solarSwitch'      as const },
  { k:'publicTransit'    as const, e:'🚌', l:'Use public transit more',         d:'Swap 1–2 car commutes/week',         sk:'publicTransit'    as const },
];

const TIPS: Record<string, { e:string; t:string; d:string; impact:string }[]> = {
  transport: [
    { e:'⚡', t:'Switch to EV or hybrid',      d:'EVs emit 3–5× less CO₂ over lifetime than gasoline cars.',         impact:'Very High' },
    { e:'🏠', t:'Work from home 2 days/week',  d:'Remote work can slash commute emissions by 40%.',                   impact:'High' },
    { e:'🚂', t:'Replace one flight with rail', d:'Train travel emits ~80% less CO₂ per mile than flying.',           impact:'Very High' },
  ],
  energy: [
    { e:'☀️', t:'Install solar panels',         d:'Rooftop solar can cut home energy emissions by up to 80%.',         impact:'Very High' },
    { e:'🔥', t:'Upgrade to a heat pump',       d:'Heat pumps are 3× more efficient than gas boilers.',               impact:'High' },
    { e:'🏠', t:'Smart home automation',        d:'Smart thermostats reduce energy use by 10–15% automatically.',     impact:'Medium' },
  ],
  diet: [
    { e:'🌱', t:'Go plant-based 3 days/week',  d:'A flexitarian shift cuts food emissions 30–40% per year.',          impact:'High' },
    { e:'♻️', t:'Cut food waste in half',       d:'Food waste drives ~8% of global emissions. Meal planning helps.',  impact:'Medium' },
    { e:'🥛', t:'Swap dairy for plant milk',    d:'Oat milk emits ~80% less CO₂ per litre than cow\'s milk.',          impact:'Medium' },
  ],
};

const IMPACT_STYLE: Record<string, string> = {
  'Very High': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  'High':      'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  'Medium':    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
};

const ActionableInsights: React.FC<Props> = ({ inputs, breakdown, pledges, onPledgeChange, savings, unit, ecoScore }) => {
  const toggle = (k: keyof Pledges) => onPledgeChange({ ...pledges, [k]: !pledges[k] });
  const fmt = (kg: number) => unit==='tons' ? (kg/1000).toFixed(2)+' t' : kg.toLocaleString()+' kg';

  const highest = (['transport','energy','diet'] as const)
    .map(c => ({ c, v: c==='transport' ? breakdown.transport+breakdown.flights : breakdown[c] }))
    .sort((a,b) => b.v-a.v)[0].c;

  const activePledgeCount = Object.values(pledges).filter(Boolean).length;
  const potentialTotal = Math.max(0, breakdown.total - savings.totalSavings);
  const pct = breakdown.total > 0 ? Math.round((savings.totalSavings / breakdown.total) * 100) : 0;

  const handleDownload = () => {
    const lines = [
      '╔═══════════════════════════════════════════════════════════╗',
      '║         CarbonIQ v2.0 — CARBON FOOTPRINT REPORT           ║',
      `║         Generated: ${new Date().toLocaleDateString().padEnd(40)}║`,
      '╚═══════════════════════════════════════════════════════════╝',
      '',
      `▶ ECO SCORE: ${ecoScore.score}/1000 — Grade ${ecoScore.grade} (${ecoScore.label})`,
      `▶ Better than ${ecoScore.percentileBetter}% of people globally`,
      '',
      '── INPUTS ──────────────────────────────────────────────────',
      `  Vehicle: ${inputs.carType} | ${inputs.milesDriven} mi/wk`,
      `  Transit: ${inputs.transitHours} hrs/wk | Flights: ${inputs.flightsShort} short + ${inputs.flightsLong} long/yr`,
      `  Electricity: ${inputs.electricity} kWh/mo | Gas: ${inputs.naturalGasTherm} therms/mo`,
      `  Diet: ${inputs.dietType} | Region: ${inputs.region.toUpperCase()}`,
      '',
      '── EMISSIONS ───────────────────────────────────────────────',
      `  Transport:  ${fmt(breakdown.transport)}`,
      `  Flights:    ${fmt(breakdown.flights)}`,
      `  Energy:     ${fmt(breakdown.energy)}`,
      `  Diet:       ${fmt(breakdown.diet)}`,
      `  Lifestyle:  ${fmt(breakdown.lifestyle)}`,
      `  ─────────────────────────────────`,
      `  TOTAL:      ${fmt(breakdown.total)} CO₂e/year`,
      '',
      '── PLEDGES ─────────────────────────────────────────────────',
      ...PLEDGES.map(p => {
        const on = pledges[p.k];
        return `  [${on?'✓':' '}] ${p.l}${on ? ` (−${fmt(savings[p.sk])})` : ''}`;
      }),
      `  ─────────────────────────────────`,
      `  PLEDGED SAVINGS: −${fmt(savings.totalSavings)} (−${pct}%)`,
      `  POTENTIAL:       ${fmt(potentialTotal)} CO₂e/year`,
      '',
      'Sources: EPA eGRID 2023 · IPCC AR6 · Our World in Data · Project Drawdown',
      'CarbonIQ v2.0 · Hack2Skill PromptWars 2026',
    ].join('\n');

    const blob = new Blob([lines], { type:'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `CarbonIQ_${new Date().toISOString().split('T')[0]}.txt`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

      {/* Left — Top Actions */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">High-Impact Actions</h3>
            <p className="text-2xs text-gray-400 dark:text-gray-500">
              Targeting your highest category: <span className="font-semibold text-eco-600 dark:text-eco-400 capitalize">{highest}</span>
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {(TIPS[highest] || TIPS['diet']).map((tip,i) => (
            <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-900/30 border border-gray-200/50 dark:border-gray-800/50 hover:border-eco-300/50 dark:hover:border-eco-700/30 transition-colors">
              <span className="text-xl leading-none mt-0.5 shrink-0">{tip.e}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{tip.t}</p>
                  <span className={`badge shrink-0 ${IMPACT_STYLE[tip.impact]}`}>{tip.impact}</span>
                </div>
                <p className="text-2xs text-gray-400 dark:text-gray-500 mt-0.5">{tip.d}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-200/50 dark:border-gray-800/50 flex justify-between items-center">
          <p className="text-2xs text-gray-400 dark:text-gray-500">{activePledgeCount} / {PLEDGES.length} pledges active</p>
          <button onClick={handleDownload} className="btn btn-primary px-4 py-2 text-xs">
            <Download className="w-3.5 h-3.5" />Export Report
          </button>
        </div>
      </div>

      {/* Right — Pledges */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-eco-100 dark:bg-eco-900/40 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-eco-600 dark:text-eco-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">Climate Pledges</h3>
              <p className="text-2xs text-gray-400 dark:text-gray-500">Live what-if impact simulator</p>
            </div>
          </div>
          {pct > 0 && (
            <span className="badge bg-eco-100 dark:bg-eco-900/40 text-eco-700 dark:text-eco-300">−{pct}% saved</span>
          )}
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-[400px] pr-0.5">
          {PLEDGES.map(p => {
            const on = pledges[p.k];
            const disabled =
              (p.k==='meatlessMondays' && ['vegan','vegetarian','pescatarian'].includes(inputs.dietType)) ||
              (p.k==='reduceFlights' && inputs.flightsShort===0 && inputs.flightsLong===0);
            return (
              <div key={p.k} onClick={() => !disabled && toggle(p.k)}
                className={`pledge-row ${on?'on':'off'} ${disabled?'opacity-40 cursor-not-allowed':''}`}>
                <div className={`shrink-0 transition-colors ${on?'text-eco-600':'text-gray-300 dark:text-gray-700'}`}>
                  {on ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    <span className="mr-1">{p.e}</span>{p.l}
                  </p>
                  <p className="text-2xs text-gray-400 dark:text-gray-500 truncate">{p.d}</p>
                </div>
                <span className={`mono text-2xs font-bold shrink-0 px-2 py-0.5 rounded-full transition-colors ${
                  on ? 'text-eco-700 dark:text-eco-300 bg-eco-100 dark:bg-eco-900/40'
                     : 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800'}`}>
                  −{fmt(savings[p.sk])}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="space-y-2 pt-2 border-t border-gray-200/50 dark:border-gray-800/50">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-600 dark:text-gray-300 font-medium mono">
              Now: {fmt(breakdown.total)}
            </span>
            <span className="flex items-center gap-1 text-eco-600 dark:text-eco-400 font-semibold mono">
              <ArrowRight className="w-3 h-3" />{fmt(potentialTotal)}
            </span>
          </div>
          <div className="h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="prog-fill" style={{ width:`${Math.min(100,pct)}%` }} />
          </div>
          <p className="text-2xs text-center text-gray-400 dark:text-gray-500">
            {savings.totalSavings > 0
              ? `Saving ${fmt(savings.totalSavings)} · equivalent to planting ${Math.round(savings.totalSavings/120)} trees/year 🌳`
              : 'Toggle pledges above to simulate your savings'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActionableInsights;
