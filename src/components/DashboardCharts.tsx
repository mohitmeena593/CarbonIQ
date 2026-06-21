import React, { useState } from 'react';
import type { FootprintBreakdown } from '../utils/calculations';
import { BENCHMARKS } from '../utils/calculations';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
  AreaChart, Area,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingDown } from 'lucide-react';

interface Props {
  breakdown: FootprintBreakdown;
  unit: 'kg' | 'tons';
  theme: 'light' | 'dark';
  projection: { month: string; baseline: number; withPledges: number; target: number }[];
}

type ChartTab = 'breakdown' | 'benchmark' | 'projection';

const COLORS = ['#0ea5e9','#8b5cf6','#f59e0b','#22c55e','#ec4899'];

const DashboardCharts: React.FC<Props> = ({ breakdown, unit, theme, projection }) => {
  const [chart, setChart] = useState<ChartTab>('breakdown');
  const dark = theme === 'dark';

  const fmt = (kg: number) => unit==='tons' ? (kg/1000).toFixed(2)+' t' : kg.toLocaleString()+' kg';
  const rv  = (kg: number) => unit==='tons' ? parseFloat((kg/1000).toFixed(2)) : kg;

  const pieData = [
    { name:'Transport', value:breakdown.transport },
    { name:'Flights',   value:breakdown.flights },
    { name:'Energy',    value:breakdown.energy },
    { name:'Diet',      value:breakdown.diet },
    { name:'Lifestyle', value:breakdown.lifestyle },
  ].filter(d => d.value > 0);

  const barData = [
    { name:'🎯 Target', value:rv(BENCHMARKS.PARIS_TARGET_KG),   fill:'#16a34a' },
    { name:'🌍 World',  value:rv(BENCHMARKS.WORLD_AVERAGE_KG),  fill:'#6b7280' },
    { name:'🇪🇺 EU',   value:rv(BENCHMARKS.EU_AVERAGE_KG),     fill:'#3b82f6' },
    { name:'👤 You',    value:rv(breakdown.total),
      fill: breakdown.total>BENCHMARKS.US_AVERAGE_KG ? '#ef4444'
           : breakdown.total>BENCHMARKS.EU_AVERAGE_KG ? '#f97316'
           : breakdown.total>BENCHMARKS.WORLD_AVERAGE_KG ? '#eab308' : '#16a34a' },
    { name:'🇺🇸 US',   value:rv(BENCHMARKS.US_AVERAGE_KG),     fill:'#94a3b8' },
  ];

  const projData = projection.map(p => ({
    ...p,
    baseline:   rv(p.baseline),
    withPledges:rv(p.withPledges),
    target:     rv(p.target),
  }));

  const ax = { fontSize:10, fontFamily:"'JetBrains Mono'", fill: dark?'#4b5563':'#9ca3af', fontWeight:500 };
  const grid = dark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)';
  const tip  = {
    contentStyle:{
      background: dark?'rgba(9,18,9,0.92)':'rgba(255,255,255,0.96)',
      border:`1px solid ${dark?'rgba(22,163,74,0.2)':'rgba(22,163,74,0.18)'}`,
      borderRadius:12, fontSize:11, fontFamily:"'JetBrains Mono',monospace",
      boxShadow:'0 4px 20px rgba(0,0,0,0.15)',
    },
    cursor:{ fill:'rgba(22,163,74,0.04)' },
  };

  return (
    <div className="card p-5 space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-gray-100/70 dark:bg-gray-900/40 rounded-xl w-fit">
        {([
          { id:'breakdown',  icon:<PieIcon className="w-3.5 h-3.5" />,    label:'Breakdown' },
          { id:'benchmark',  icon:<BarChart3 className="w-3.5 h-3.5" />,  label:'Benchmarks' },
          { id:'projection', icon:<TrendingDown className="w-3.5 h-3.5" />,label:'Projection' },
        ] as { id:ChartTab; icon:React.ReactNode; label:string }[]).map(t => (
          <button key={t.id} onClick={() => setChart(t.id)}
            className={`nav-tab !px-3 !py-1.5 !text-2xs flex items-center gap-1.5 ${chart===t.id?'active':'inactive'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Breakdown */}
      {chart==='breakdown' && (
        <div className="animate-fadeIn space-y-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={62} outerRadius={88}
                  paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                </Pie>
                <Tooltip {...tip}
                  formatter={((v: number | string, name: string) => [`${fmt(Number(v))} (${breakdown.total>0?((Number(v)/breakdown.total)*100).toFixed(1):0}%)`, name]) as Parameters<typeof Tooltip>[0]['formatter']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {pieData.map((d,i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background:COLORS[i] }} />
                <div>
                  <p className="text-2xs font-semibold text-gray-700 dark:text-gray-300">{d.name}</p>
                  <p className="text-2xs mono text-gray-400 dark:text-gray-500">{fmt(d.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Benchmark */}
      {chart==='benchmark' && (
        <div className="animate-fadeIn space-y-3">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{top:8,right:8,left:-22,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                <XAxis dataKey="name" tick={ax} axisLine={false} tickLine={false} />
                <YAxis tick={ax} axisLine={false} tickLine={false} />
                <Tooltip {...tip} formatter={((v: number | string) => [`${v} ${unit==='tons'?'t':'kg'}`, '']) as Parameters<typeof Tooltip>[0]['formatter']} />
                <Bar dataKey="value" radius={[7,7,0,0]}>
                  {barData.map((e,i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="p-3 bg-eco-50/60 dark:bg-eco-900/20 border border-eco-200/50 dark:border-eco-800/30 rounded-xl text-xs text-eco-800 dark:text-eco-300 font-medium">
            🎯 Paris Agreement target: <span className="mono font-bold">2,000 kg</span> per person/year to limit global warming to 1.5°C
          </div>
        </div>
      )}

      {/* Projection */}
      {chart==='projection' && (
        <div className="animate-fadeIn space-y-3">
          <p className="text-2xs text-gray-400 dark:text-gray-500">Monthly CO₂ — current path vs. with your pledges active</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projData} margin={{top:8,right:8,left:-22,bottom:5}}>
                <defs>
                  <linearGradient id="gBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f97316" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gPledge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={grid} />
                <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
                <YAxis tick={ax} axisLine={false} tickLine={false} />
                <Tooltip {...tip} />
                <ReferenceLine y={rv(BENCHMARKS.PARIS_TARGET_KG/12)} stroke="#16a34a"
                  strokeDasharray="5 4" strokeWidth={1.5}
                  label={{ value:'Target', position:'insideTopRight', fontSize:9, fill:'#16a34a', fontFamily:"'JetBrains Mono'" }} />
                <Area type="monotone" dataKey="baseline"   name="Current path" stroke="#f97316" strokeWidth={2} fill="url(#gBase)" />
                <Area type="monotone" dataKey="withPledges" name="With pledges" stroke="#16a34a" strokeWidth={2} fill="url(#gPledge)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-2xs">
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span className="w-4 h-0.5 bg-orange-500 inline-block rounded" />Current path
            </span>
            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span className="w-4 h-0.5 bg-eco-600 inline-block rounded" />With pledges
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCharts;
