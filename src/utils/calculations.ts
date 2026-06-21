// ============================================================
// CarbonIQ v2.0 — Enhanced Carbon Calculation Engine
// Sources: EPA eGRID 2023, IPCC AR6, Our World in Data 2024,
//          Project Drawdown, ICAO Carbon Emissions Calculator
// ============================================================

// ── Emission Factors ──────────────────────────────────────────
export const EMISSION_FACTORS = {
  // Transport per mile (kg CO₂e, includes upstream/indirect)
  CAR_GASOLINE_PER_MILE: 0.404,   // EPA: avg US passenger vehicle
  CAR_HYBRID_PER_MILE: 0.211,     // ~47% lower, Toyota Prius benchmark
  CAR_ELECTRIC_PER_MILE: 0.096,   // US grid avg at 0.245 kWh/mi
  TRANSIT_BUS_PER_MILE: 0.089,    // IPCC: per passenger-mile (avg load)
  TRANSIT_RAIL_PER_MILE: 0.041,   // Commuter rail, per passenger-mile

  // Flights per km (kg CO₂e incl. radiative forcing factor 1.9x)
  FLIGHT_SHORT_PER_KM: 0.255,     // ICAO <1500 km economy
  FLIGHT_LONG_PER_KM: 0.195,      // ICAO >1500 km economy

  // Home Energy
  ELECTRICITY_PER_KWH: 0.386,     // EPA eGRID 2023 US national avg
  NATURAL_GAS_PER_THERM: 5.29,    // EPA: kg CO₂e per therm burned

  // Diet — annual kg CO₂e (Poore & Nemecek 2018 + IPCC AR6 updates)
  DIET: {
    vegan: 1100,
    vegetarian: 1500,
    pescatarian: 1900,
    flexitarian: 2200,
    averageMeat: 2800,
    heavyMeat: 3800,
  },

  // Lifestyle
  CLOTHING_PER_ITEM: 15.0,        // kg CO₂e per new garment avg
} as const;

// ── Global Benchmarks (kg CO₂e / person / year) ───────────────
export const BENCHMARKS = {
  PARIS_TARGET_KG: 2000,          // IPCC: 1.5°C pathway per capita
  WORLD_AVERAGE_KG: 4700,         // Our World in Data 2024
  EU_AVERAGE_KG: 7900,            // EU27 per capita 2023
  US_AVERAGE_KG: 14500,           // EPA US per capita 2023
  INDIA_AVERAGE_KG: 1800,         // Global Carbon Project 2023
  CHINA_AVERAGE_KG: 8400,         // Global Carbon Project 2023
} as const;

// ── Regional Grid Factors (kg CO₂e / kWh) ─────────────────────
export const REGIONAL_GRID: Record<string, number> = {
  us:    0.386,
  eu:    0.233,
  india: 0.708,
  china: 0.581,
  world: 0.475,
};

// ── Types ──────────────────────────────────────────────────────
export type DietType = 'vegan' | 'vegetarian' | 'pescatarian' | 'flexitarian' | 'averageMeat' | 'heavyMeat';
export type CarType  = 'gasoline' | 'hybrid' | 'electric' | 'none';
export type RegionType = 'us' | 'eu' | 'india' | 'china' | 'world';

export interface CalculatorInputs {
  milesDriven:      number;   // per week
  carType:          CarType;
  transitHours:     number;   // per week
  flightsShort:     number;   // per year
  flightsLong:      number;   // per year
  electricity:      number;   // kWh/month
  naturalGasTherm:  number;   // therms/month
  dietType:         DietType;
  newClothingItems: number;   // per year
  region:           RegionType;
}

export interface FootprintBreakdown {
  transport:  number;
  flights:    number;
  energy:     number;
  diet:       number;
  lifestyle:  number;
  total:      number;
}

export interface Pledges {
  bikeToWork:      boolean;
  meatlessMondays: boolean;
  thermostatAdjust:boolean;
  lineDryClothes:  boolean;
  ledBulbs:        boolean;
  buyLocal:        boolean;
  reduceFlights:   boolean;
  solarSwitch:     boolean;
  publicTransit:   boolean;
}

export interface PledgeSavingsBreakdown {
  bikeToWork:      number;
  meatlessMondays: number;
  thermostatAdjust:number;
  lineDryClothes:  number;
  ledBulbs:        number;
  buyLocal:        number;
  reduceFlights:   number;
  solarSwitch:     number;
  publicTransit:   number;
  totalSavings:    number;
}

export interface EcoScore {
  score:            number;   // 0–1000
  grade:            'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  label:            string;
  color:            string;
  percentileBetter: number;
}

// ── Defaults ──────────────────────────────────────────────────
export const INITIAL_INPUTS: CalculatorInputs = {
  milesDriven:      150,
  carType:          'gasoline',
  transitHours:     3,
  flightsShort:     1,
  flightsLong:      1,
  electricity:      450,
  naturalGasTherm:  0,
  dietType:         'averageMeat',
  newClothingItems: 12,
  region:           'us',
};

export const INITIAL_PLEDGES: Pledges = {
  bikeToWork:      false,
  meatlessMondays: false,
  thermostatAdjust:false,
  lineDryClothes:  false,
  ledBulbs:        false,
  buyLocal:        false,
  reduceFlights:   false,
  solarSwitch:     false,
  publicTransit:   false,
};

// ── Core Calculator ───────────────────────────────────────────
export function calculateFootprint(inputs: CalculatorInputs): FootprintBreakdown {
  const grid = REGIONAL_GRID[inputs.region] ?? 0.386;

  const carFactor =
    inputs.carType === 'gasoline' ? EMISSION_FACTORS.CAR_GASOLINE_PER_MILE
    : inputs.carType === 'hybrid' ? EMISSION_FACTORS.CAR_HYBRID_PER_MILE
    : inputs.carType === 'electric' ? grid * 0.245  // ~0.245 kWh/mile EV avg
    : 0;

  const transport = inputs.milesDriven * 52 * carFactor
    + inputs.transitHours * 52 * 15 * EMISSION_FACTORS.TRANSIT_BUS_PER_MILE;

  const flights =
    inputs.flightsShort * 1200 * EMISSION_FACTORS.FLIGHT_SHORT_PER_KM
    + inputs.flightsLong * 9000 * EMISSION_FACTORS.FLIGHT_LONG_PER_KM;

  const energy =
    inputs.electricity * 12 * grid
    + inputs.naturalGasTherm * 12 * EMISSION_FACTORS.NATURAL_GAS_PER_THERM;

  const diet = EMISSION_FACTORS.DIET[inputs.dietType];

  const lifestyle = inputs.newClothingItems * EMISSION_FACTORS.CLOTHING_PER_ITEM;

  const total = transport + flights + energy + diet + lifestyle;

  return {
    transport:  Math.round(transport),
    flights:    Math.round(flights),
    energy:     Math.round(energy),
    diet:       Math.round(diet),
    lifestyle:  Math.round(lifestyle),
    total:      Math.round(total),
  };
}

// ── Eco Score ─────────────────────────────────────────────────
export function calculateEcoScore(totalKg: number): EcoScore {
  const maxBad = 20000, minGood = 800;
  const raw = Math.max(0, Math.min(1, (maxBad - totalKg) / (maxBad - minGood)));
  const score = Math.round(raw * 1000);

  const percentileBetter = totalKg < BENCHMARKS.WORLD_AVERAGE_KG
    ? Math.min(95, Math.round(60 + (BENCHMARKS.WORLD_AVERAGE_KG - totalKg) / 100))
    : Math.max(5, Math.round(50 - (totalKg - BENCHMARKS.WORLD_AVERAGE_KG) / 200));

  if (score >= 850) return { score, grade: 'S', label: 'Climate Champion', color: '#059669', percentileBetter };
  if (score >= 650) return { score, grade: 'A', label: 'Eco Leader',        color: '#16a34a', percentileBetter };
  if (score >= 500) return { score, grade: 'B', label: 'Green Conscious',   color: '#65a30d', percentileBetter };
  if (score >= 350) return { score, grade: 'C', label: 'Average Impact',    color: '#d97706', percentileBetter };
  if (score >= 200) return { score, grade: 'D', label: 'High Footprint',    color: '#ea580c', percentileBetter };
  return               { score, grade: 'F', label: 'Critical Impact',    color: '#dc2626', percentileBetter };
}

// ── Pledge Savings ────────────────────────────────────────────
export function calculatePledgeSavings(
  inputs: CalculatorInputs,
  pledges: Pledges
): PledgeSavingsBreakdown {
  const grid = REGIONAL_GRID[inputs.region] ?? 0.386;
  const maxCar    = inputs.milesDriven * 52 * EMISSION_FACTORS.CAR_GASOLINE_PER_MILE;
  const maxEnergy = inputs.electricity * 12 * grid;

  const bikeToWork      = pledges.bikeToWork      ? Math.min(600, maxCar * 0.3) : 0;
  const meatlessMondays = pledges.meatlessMondays && ['averageMeat','heavyMeat'].includes(inputs.dietType)
    ? (inputs.dietType === 'heavyMeat' ? 380 : 280) : 0;
  const thermostatAdjust= pledges.thermostatAdjust ? Math.min(250, maxEnergy * 0.15) : 0;
  const lineDryClothes  = pledges.lineDryClothes  ? Math.min(170, maxEnergy * 0.10) : 0;
  const ledBulbs        = pledges.ledBulbs        ? Math.min(110, maxEnergy * 0.08) : 0;
  const buyLocal        = pledges.buyLocal        ? 130 : 0;
  const reduceFlights   = pledges.reduceFlights
    ? Math.min(900, inputs.flightsShort * 1200 * EMISSION_FACTORS.FLIGHT_SHORT_PER_KM) : 0;
  const solarSwitch     = pledges.solarSwitch     ? Math.min(maxEnergy * 0.8, 1200) : 0;
  const publicTransit   = pledges.publicTransit && inputs.milesDriven > 50
    ? Math.min(500, maxCar * 0.2) : 0;

  const totalSavings = Math.round(
    bikeToWork + meatlessMondays + thermostatAdjust + lineDryClothes +
    ledBulbs + buyLocal + reduceFlights + solarSwitch + publicTransit
  );

  return {
    bikeToWork: Math.round(bikeToWork),
    meatlessMondays: Math.round(meatlessMondays),
    thermostatAdjust: Math.round(thermostatAdjust),
    lineDryClothes: Math.round(lineDryClothes),
    ledBulbs: Math.round(ledBulbs),
    buyLocal: Math.round(buyLocal),
    reduceFlights: Math.round(reduceFlights),
    solarSwitch: Math.round(solarSwitch),
    publicTransit: Math.round(publicTransit),
    totalSavings,
  };
}

// ── Monthly Projection ────────────────────────────────────────
export function generateMonthlyProjection(
  currentKg: number,
  pledgedSavingsKg: number
): { month: string; baseline: number; withPledges: number; target: number }[] {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const base = currentKg / 12;
  const saved = pledgedSavingsKg / 12;
  const tgt = BENCHMARKS.PARIS_TARGET_KG / 12;
  return months.map((month, i) => ({
    month,
    baseline: Math.round(base * (1 + Math.sin(i * 0.5) * 0.08)),
    withPledges: Math.round(Math.max(tgt, (base - saved) * (1 + Math.sin(i * 0.5) * 0.08))),
    target: Math.round(tgt),
  }));
}
