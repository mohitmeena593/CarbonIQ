import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { CalculatorInputs, FootprintBreakdown, EcoScore } from '../utils/calculations';
import { BENCHMARKS } from '../utils/calculations';
import { Send, Bot, User, Sparkles, RefreshCw, Zap } from 'lucide-react';

interface Props {
  inputs: CalculatorInputs;
  breakdown: FootprintBreakdown;
  ecoScore: EcoScore;
}

interface Msg { role: 'user' | 'assistant'; content: string; id: number; }

const QUICK: { icon:string; label:string; prompt:string }[] = [
  { icon:'🎯', label:'Quick wins',        prompt:'What are my 3 highest-impact actions right now, using my exact data?' },
  { icon:'🗓️', label:'30-day plan',       prompt:'Create a personalised 30-day sustainability plan based on my carbon profile.' },
  { icon:'🌱', label:'Explain my score',  prompt:'Explain my eco score, what it means versus global benchmarks, and what I need to do to improve it.' },
  { icon:'🔥', label:'Biggest offenders', prompt:'Which specific habits cause the most damage in my profile and why? Use the numbers.' },
  { icon:'💰', label:'Save money too',    prompt:'Which eco-actions will also save me the most money? Give concrete annual estimates.' },
  { icon:'🌍', label:'Global impact',     prompt:'If 1 million people had my footprint, what would the annual planetary impact be? Put it in perspective.' },
];

function buildSystem(inputs: CalculatorInputs, breakdown: FootprintBreakdown, ecoScore: EcoScore) {
  const regions: Record<string,string> = { us:'United States',eu:'European Union',india:'India',china:'China',world:'Global average' };
  return `You are CarbonIQ AI Coach — a world-class sustainability advisor embedded in CarbonIQ (Hack2Skill PromptWars 2026). You combine climate science, behavioural economics, and personal finance expertise.

## User's Carbon Profile:
- Region: ${regions[inputs.region] || inputs.region}
- Vehicle: ${inputs.carType === 'none' ? 'No car' : inputs.carType} | ${inputs.carType!=='none'?`${inputs.milesDriven} mi/wk`:'car-free'}
- Public transit: ${inputs.transitHours} hrs/week
- Flights: ${inputs.flightsShort} short + ${inputs.flightsLong} long/year
- Electricity: ${inputs.electricity} kWh/month | Gas: ${inputs.naturalGasTherm} therms/month
- Diet: ${inputs.dietType}
- New clothing: ${inputs.newClothingItems} items/year

## Annual Emissions Breakdown:
- Transport (car): ${breakdown.transport.toLocaleString()} kg CO₂e
- Flights: ${breakdown.flights.toLocaleString()} kg CO₂e
- Home energy: ${breakdown.energy.toLocaleString()} kg CO₂e
- Diet: ${breakdown.diet.toLocaleString()} kg CO₂e
- Lifestyle: ${breakdown.lifestyle.toLocaleString()} kg CO₂e
- **TOTAL: ${breakdown.total.toLocaleString()} kg CO₂e/year**

## Eco Score: ${ecoScore.score}/1000 — Grade ${ecoScore.grade} (${ecoScore.label})
Better than ${ecoScore.percentileBetter}% of people globally.

## Global Benchmarks:
- Paris 1.5°C target: ${BENCHMARKS.PARIS_TARGET_KG.toLocaleString()} kg
- World average: ${BENCHMARKS.WORLD_AVERAGE_KG.toLocaleString()} kg
- EU average: ${BENCHMARKS.EU_AVERAGE_KG.toLocaleString()} kg
- US average: ${BENCHMARKS.US_AVERAGE_KG.toLocaleString()} kg

## Coaching style:
- Always use the user's exact numbers — never generic advice
- Be encouraging yet honest; celebrate wins, flag problems clearly
- Cite sources: IPCC AR6, EPA, Our World in Data, Project Drawdown
- Be practical: steps > facts
- Use bullet points; be concise
- Appropriate emojis; warm tone; never preachy`;
}

// Simple inline markdown → React
function renderMd(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## ')) return (
      <p key={i} className="font-bold text-eco-700 dark:text-eco-400 mt-2 mb-1 text-xs">{line.slice(3)}</p>
    );
    if (line.startsWith('- ') || line.startsWith('• ')) {
      const html = line.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      return <li key={i} className="text-xs text-gray-700 dark:text-gray-300 ml-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
    }
    if (!line.trim()) return <br key={i} />;
    const html = line.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
    return <p key={i} className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

let idCounter = 1;
const nextId = () => idCounter++;

function makeWelcome(breakdown: FootprintBreakdown, ecoScore: EcoScore): Msg {
  return {
    role: 'assistant',
    id: nextId(),
    content: `Hey! I'm your CarbonIQ AI Coach, powered by Claude. 👋\n\nI've loaded your full carbon profile — **${breakdown.total.toLocaleString()} kg CO₂e/year** — and I'm ready to help you reduce it.\n\nYour eco score is **${ecoScore.score}/1000** (Grade **${ecoScore.grade}** — ${ecoScore.label}). You're already better than **${ecoScore.percentileBetter}% of people globally**.\n\nPick a quick prompt below or ask me anything! 🌱`,
  };
}

const AICoach: React.FC<Props> = ({ inputs, breakdown, ecoScore }) => {
  const [msgs, setMsgs]       = useState<Msg[]>(() => [makeWelcome(breakdown, ecoScore)]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');
  const bottomRef             = useRef<HTMLDivElement>(null);

  // Keep the welcome message current when profile changes (only if still at initial state)
  const systemPrompt = useMemo(() => buildSystem(inputs, breakdown, ecoScore), [inputs, breakdown, ecoScore]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, loading]);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    setErr('');
    const userMsg: Msg = { role:'user', content:text, id:nextId() };
    const history = [...msgs, userMsg];
    setMsgs(history);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          ...(import.meta.env.VITE_ANTHROPIC_API_KEY
            ? { 'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true' }
            : {}),
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: systemPrompt,
          messages: history.map(m => ({ role:m.role, content:m.content })),
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(()=>({}));
        throw new Error(e?.error?.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      const reply = (data.content as {type:string;text?:string}[])
        ?.filter(c=>c.type==='text').map(c=>c.text).join('') || '';
      setMsgs(prev => [...prev, { role:'assistant', content:reply, id:nextId() }]);
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Unknown error';
      if (m.includes('401') || m.includes('key') || m.includes('auth') || m.includes('403')) {
        setErr('Add your Anthropic API key: copy .env.example → .env and set VITE_ANTHROPIC_API_KEY, then restart the dev server.');
      } else if (m.includes('Failed to fetch') || m.includes('NetworkError')) {
        setErr('Network error — the Anthropic API requires a backend proxy in production. See README for setup.');
      } else {
        setErr(`Error: ${m}`);
      }
    } finally { setLoading(false); }
  }, [msgs, systemPrompt, loading]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

      {/* Chat panel */}
      <div className="lg:col-span-2 card flex flex-col overflow-hidden" style={{ height:580 }}>
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-eco-400 to-eco-700 flex items-center justify-center shadow-sm">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              CarbonIQ AI Coach
              <span className="badge bg-eco-100 dark:bg-eco-900/40 text-eco-600 dark:text-eco-400">
                <Sparkles className="w-2.5 h-2.5" /> Claude
              </span>
            </h3>
            <p className="text-2xs text-gray-400 dark:text-gray-500">Personalised sustainability guidance</p>
          </div>
          <button onClick={() => setMsgs([makeWelcome(breakdown, ecoScore)])} title="Reset chat"
            className="btn btn-ghost ml-auto p-1.5 text-2xs flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />Reset
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {msgs.map(m => (
            <div key={m.id} className={`flex gap-2.5 animate-fadeUp ${m.role==='user'?'flex-row-reverse':''}`}>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                m.role==='assistant' ? 'bg-gradient-to-br from-eco-400 to-eco-700' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {m.role==='assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-500 dark:text-gray-300" />}
              </div>
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                m.role==='assistant'
                  ? 'bg-gray-50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50'
                  : 'bg-eco-600 text-white'
              }`}>
                {m.role==='assistant'
                  ? <div className="space-y-0.5">{renderMd(m.content)}</div>
                  : <p className="text-xs">{m.content}</p>
                }
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 animate-fadeUp">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-eco-400 to-eco-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200/50 dark:border-gray-800/50 rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-eco-500 dot1" />
                <div className="w-1.5 h-1.5 rounded-full bg-eco-500 dot2" />
                <div className="w-1.5 h-1.5 rounded-full bg-eco-500 dot3" />
              </div>
            </div>
          )}
          {err && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400">
              {err}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-200/50 dark:border-gray-800/50 shrink-0">
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && !e.shiftKey && send(input)}
              placeholder="Ask me anything about your carbon footprint…"
              className="field flex-1 px-3.5 py-2.5 text-xs"
              disabled={loading} />
            <button onClick={() => send(input)} disabled={loading || !input.trim()}
              className="btn btn-primary px-3.5 py-2.5">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        <div className="card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h4 className="font-display font-bold text-sm text-gray-900 dark:text-white">Quick Prompts</h4>
          </div>
          <div className="space-y-1.5">
            {QUICK.map((q,i) => (
              <button key={i} onClick={() => send(q.prompt)} disabled={loading}
                className="w-full text-left p-2.5 rounded-xl border border-gray-200/70 dark:border-gray-800/70 hover:border-eco-300 dark:hover:border-eco-700 hover:bg-eco-50/60 dark:hover:bg-eco-900/20 transition-all text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2.5 disabled:opacity-50">
                <span className="text-base">{q.icon}</span>{q.label}
              </button>
            ))}
          </div>
        </div>

        <div className="card p-4 space-y-2">
          <h4 className="font-display font-bold text-sm text-gray-900 dark:text-white">Your Profile</h4>
          {[
            { l:'Total footprint',  v:`${breakdown.total.toLocaleString()} kg/yr`, hi:true },
            { l:'Eco Score',        v:`${ecoScore.score}/1000 — ${ecoScore.grade}`, hi:true },
            { l:'vs Paris Target',  v: breakdown.total<=2000 ? '✓ On track' : `+${(breakdown.total-2000).toLocaleString()} kg excess`, hi:false },
            { l:'Top emission',     v: [['transport',breakdown.transport+breakdown.flights],['energy',breakdown.energy],['diet',breakdown.diet]].sort((a,b)=>(b[1] as number)-(a[1] as number))[0][0] as string, hi:false },
          ].map((item,i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <span className="text-2xs text-gray-400 dark:text-gray-500">{item.l}</span>
              <span className={`text-2xs font-bold mono ${item.hi?'text-eco-600 dark:text-eco-400':'text-gray-700 dark:text-gray-300'}`}>
                {item.v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AICoach;
