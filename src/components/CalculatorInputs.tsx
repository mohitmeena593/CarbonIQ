import React, { useState, useCallback } from 'react';
import type { CalculatorInputs as InputType, CarType, DietType, RegionType } from '../utils/calculations';
import { Car, Zap, Utensils, ShoppingBag, Globe2 } from 'lucide-react';

interface Props { inputs: InputType; onChange: (v: InputType) => void; }

type Tab = 'transport' | 'energy' | 'diet' | 'lifestyle';

const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id:'transport',  icon:<Car className="w-3.5 h-3.5" />,        label:'Transport' },
  { id:'energy',     icon:<Zap className="w-3.5 h-3.5" />,        label:'Energy' },
  { id:'diet',       icon:<Utensils className="w-3.5 h-3.5" />,   label:'Diet' },
  { id:'lifestyle',  icon:<ShoppingBag className="w-3.5 h-3.5" />,label:'Lifestyle' },
];

const CARS: { v: CarType; e: string; l: string }[] = [
  { v:'gasoline', e:'⛽', l:'Gasoline' },
  { v:'hybrid',   e:'🔋', l:'Hybrid' },
  { v:'electric', e:'⚡', l:'Electric' },
  { v:'none',     e:'🚶', l:'No Car' },
];

const DIETS: { v: DietType; e: string; l: string; d: string; kg: number }[] = [
  { v:'vegan',       e:'🌱', l:'Vegan',        d:'No animal products',   kg:1100 },
  { v:'vegetarian',  e:'🥚', l:'Vegetarian',   d:'Dairy & eggs ok',      kg:1500 },
  { v:'pescatarian', e:'🐟', l:'Pescatarian',  d:'Fish + plant-based',   kg:1900 },
  { v:'flexitarian', e:'🥗', l:'Flexitarian',  d:'Mostly plant-based',   kg:2200 },
  { v:'averageMeat', e:'🍖', l:'Omnivore',     d:'Standard mixed diet',  kg:2800 },
  { v:'heavyMeat',   e:'🥩', l:'Heavy Meat',   d:'Beef / lamb frequent', kg:3800 },
];

const REGIONS: { v: RegionType; f: string; l: string }[] = [
  { v:'us',    f:'🇺🇸', l:'United States' },
  { v:'eu',    f:'🇪🇺', l:'European Union' },
  { v:'india', f:'🇮🇳', l:'India' },
  { v:'china', f:'🇨🇳', l:'China' },
  { v:'world', f:'🌍', l:'World Average' },
];

function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number;
  step: number; unit: string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <div className="flex items-center gap-1">
          <input type="number" value={value} min={min} max={max}
            onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value)||0)))}
            className="field w-20 text-right px-2 py-1 text-xs mono" />
          <span className="text-2xs text-gray-400 font-mono">{unit}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        style={{ '--pct':`${pct}%` } as React.CSSProperties}
        onChange={e => onChange(Number(e.target.value))} />
      <div className="flex justify-between text-2xs text-gray-400 mono px-0.5">
        <span>{min}</span><span>{max}+</span>
      </div>
    </div>
  );
}

const CalculatorInputs: React.FC<Props> = ({ inputs, onChange }) => {
  const [tab, setTab] = useState<Tab>('transport');
  const set = useCallback(<K extends keyof InputType>(k: K, v: InputType[K]) =>
    onChange({ ...inputs, [k]: v }), [inputs, onChange]);

  return (
    <div className="card p-5 space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-eco-100 dark:bg-eco-900/40 flex items-center justify-center">
          <Globe2 className="w-4 h-4 text-eco-600 dark:text-eco-400" />
        </div>
        <div>
          <h2 className="font-display font-bold text-base text-gray-900 dark:text-white">Your Lifestyle</h2>
          <p className="text-2xs text-gray-400 dark:text-gray-500">Adjust sliders to match your habits</p>
        </div>
      </div>

      {/* Region */}
      <div>
        <label className="eyebrow block mb-1.5">Region (affects grid emissions)</label>
        <select value={inputs.region} onChange={e => set('region', e.target.value as RegionType)}
          className="field w-full px-3 py-2 text-xs appearance-none cursor-pointer"
          style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2316a34a' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")", backgroundRepeat:'no-repeat', backgroundPosition:'right 10px center' }}>
          {REGIONS.map(r => <option key={r.v} value={r.v}>{r.f} {r.l}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100/70 dark:bg-gray-900/40 rounded-xl">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`nav-tab flex-1 !px-2 !py-1.5 !text-2xs justify-center ${tab===t.id?'active':'inactive'}`}>
            {t.icon}<span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[300px]">

        {tab === 'transport' && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <label className="eyebrow block mb-2">Vehicle type</label>
              <div className="grid grid-cols-4 gap-1.5">
                {CARS.map(c => (
                  <button key={c.v} onClick={() => set('carType', c.v)}
                    className={`py-2.5 px-1 rounded-xl text-center transition-all text-2xs font-semibold border ${
                      inputs.carType===c.v
                        ? 'bg-eco-600 border-eco-600 text-white shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-eco-300'
                    }`}>
                    <div className="text-lg mb-0.5">{c.e}</div>{c.l}
                  </button>
                ))}
              </div>
            </div>
            {inputs.carType !== 'none' && (
              <Slider label="Miles driven" value={inputs.milesDriven} min={0} max={500} step={5} unit="mi/wk" onChange={v=>set('milesDriven',v)} />
            )}
            <Slider label="Public transit" value={inputs.transitHours} min={0} max={40} step={1} unit="hrs/wk" onChange={v=>set('transitHours',v)} />
            <div className="grid grid-cols-2 gap-3">
              <Slider label="Short flights (<3h)" value={inputs.flightsShort} min={0} max={20} step={1} unit="/yr" onChange={v=>set('flightsShort',v)} />
              <Slider label="Long flights (>3h)" value={inputs.flightsLong} min={0} max={15} step={1} unit="/yr" onChange={v=>set('flightsLong',v)} />
            </div>
          </div>
        )}

        {tab === 'energy' && (
          <div className="space-y-4 animate-fadeIn">
            <Slider label="Electricity" value={inputs.electricity} min={0} max={2000} step={25} unit="kWh/mo" onChange={v=>set('electricity',v)} />
            <Slider label="Natural gas" value={inputs.naturalGasTherm} min={0} max={200} step={5} unit="therms/mo" onChange={v=>set('naturalGasTherm',v)} />
            <div className="p-3.5 bg-amber-50/80 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-amber-800 dark:text-amber-300">💡 Tip</p>
              <p className="text-amber-700/80 dark:text-amber-400/60">US average: ~890 kWh/month. Estimate from bill: $amount ÷ $0.16/kWh.</p>
            </div>
          </div>
        )}

        {tab === 'diet' && (
          <div className="space-y-2 animate-fadeIn">
            <p className="text-2xs text-gray-400 dark:text-gray-500 font-medium mb-3">Select your typical diet:</p>
            {DIETS.map(d => (
              <button key={d.v} onClick={() => set('dietType', d.v)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all ${
                  inputs.dietType===d.v
                    ? 'border-eco-400 dark:border-eco-600 bg-eco-50 dark:bg-eco-900/30 shadow-sm'
                    : 'border-gray-200 dark:border-gray-800 hover:border-eco-200 dark:hover:border-eco-800'
                }`}>
                <span className="text-xl">{d.e}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{d.l}</p>
                  <p className="text-2xs text-gray-400 dark:text-gray-500">{d.d}</p>
                </div>
                <span className="mono text-2xs font-bold text-eco-600 dark:text-eco-400 shrink-0">{d.kg.toLocaleString()} kg</span>
              </button>
            ))}
          </div>
        )}

        {tab === 'lifestyle' && (
          <div className="space-y-4 animate-fadeIn">
            <Slider label="New clothing items/year" value={inputs.newClothingItems} min={0} max={80} step={1} unit="items" onChange={v=>set('newClothingItems',v)} />
            <div className="p-3.5 bg-purple-50/70 dark:bg-purple-900/10 border border-purple-200/50 dark:border-purple-800/30 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-purple-800 dark:text-purple-300">👕 Fashion Impact</p>
              <p className="text-purple-700/80 dark:text-purple-400/60">Each garment ≈ 15 kg CO₂e. Fashion = 10% of global emissions. Buying secondhand cuts this to near zero.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CalculatorInputs;
