# 🌍 CarbonIQ v2.0 — AI Carbon Footprint Platform

> **Hack2Skill PromptWars 2026 — Main Challenge 3**  
> Build a Carbon Footprint Awareness Platform that tracks individual environmental impact and provides actionable insights to reduce daily carbon emissions.

---

## ✨ Features

### 🧮 Carbon Intelligence Engine
- **Accurate emission calculations** using EPA eGRID 2023, IPCC AR6, ICAO CORSIA, and Project Drawdown data
- **Region-aware grid factors** for US, EU, India, China, and global average
- **5 categories tracked**: Transport, Flights, Home Energy, Diet, Lifestyle
- **Global benchmark comparison**: vs Paris 1.5°C target, world avg, EU avg, US avg

### 🤖 AI Sustainability Coach (Claude-powered)
- Real-time personalized advice based on your exact carbon data
- 6 quick-prompt templates (30-day plan, biggest offenders, money savings, etc.)
- Markdown-rendered responses with actionable bullet points
- Full conversation history within session

### 📊 Interactive Dashboard
- **Donut chart**: Category breakdown with hover tooltips
- **Bar chart**: Your footprint vs global benchmarks
- **Area chart**: Monthly projection — current path vs with pledges
- Smooth animated score ring with grade (S/A/B/C/D/F)
- Animated number counter on footprint total

### 🎯 Climate Pledge Simulator
- 9 live pledges with real-time savings calculation
- Progress bar showing potential reduction
- Trees-equivalent savings metric
- Context-aware disabling (e.g. meatless Mondays disabled for vegans)
- One-click PDF/text report export

### 🏆 Achievements & Gamification
- 16 achievements across 4 rarities (Common → Legendary)
- Categories: Score, Footprint, Lifestyle, Pledges
- Achievement unlock animation
- Progress tracker with completion percentage

### 🎨 UI/UX
- Glassmorphism cards with backdrop blur
- Dark / light mode (persisted in localStorage)
- Animated background with dot grid and radial glows
- Fully responsive — mobile-first
- kg CO₂ / metric tons unit toggle

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure AI Coach (optional but recommended)
cp .env.example .env
# Edit .env and add your Anthropic API key

# 3. Start dev server
npm run dev

# 4. Build for production
npm run build
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_ANTHROPIC_API_KEY` | Optional* | Anthropic API key for AI Coach |

*The app works fully without it — AI Coach will show a setup message instead.

> **Security note**: In production, proxy the Anthropic API through a backend (e.g. a Vercel Edge Function) so the key is never exposed in the browser bundle.

---

## 🌐 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set env var in Vercel dashboard:
# Settings → Environment Variables → VITE_ANTHROPIC_API_KEY
```

The included `vercel.json` handles SPA routing and asset caching automatically.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.tsx           # Logo, unit toggle, dark mode
│   ├── HeroScore.tsx        # Animated score ring + stats grid
│   ├── CalculatorInputs.tsx # Tabbed lifestyle input form
│   ├── DashboardCharts.tsx  # 3-tab chart panel (Recharts)
│   ├── ActionableInsights.tsx # Tips + pledge simulator
│   ├── AICoach.tsx          # Claude-powered chat interface
│   └── AchievementsPanel.tsx # Gamification system
├── utils/
│   └── calculations.ts      # All emission logic + types
├── App.tsx                  # Root state + layout
└── index.css                # Design system (custom CSS + Tailwind)
```

---

## 📐 Emission Factor Sources

| Category | Source | Factor |
|----------|--------|--------|
| Gasoline car | EPA 2023 | 0.404 kg CO₂e/mile |
| Electric car (US) | EPA eGRID 2023 | 0.096 kg CO₂e/mile |
| Flight (short-haul) | ICAO + RF 1.9× | 0.255 kg CO₂e/km |
| Flight (long-haul) | ICAO + RF 1.9× | 0.195 kg CO₂e/km |
| US electricity | EPA eGRID 2023 | 0.386 kg CO₂e/kWh |
| EU electricity | IEA 2023 | 0.233 kg CO₂e/kWh |
| Natural gas | EPA | 5.29 kg CO₂e/therm |
| Vegan diet | Poore & Nemecek 2018 | 1,100 kg CO₂e/yr |
| Average meat diet | IPCC AR6 | 2,800 kg CO₂e/yr |

---

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** (build tool)
- **Tailwind CSS v3** (utility-first styling)
- **Recharts** (charts)
- **Lucide React** (icons)
- **Anthropic Claude API** (AI Coach)
- **Vercel** (deployment)

---

## 📜 License

MIT — built for Hack2Skill PromptWars 2026.
