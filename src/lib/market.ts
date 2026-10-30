// simulated market data. quotes random-walk around a seeded base price and
// get cached in a global so polling doesn't reset everything each request.
// good enough for a demo, obviously not good enough for production.

import securitiesJson from "@/data/securities.json";
import marketsJson from "@/data/markets.json";

export type Quote = {
  symbol: string;
  name: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  dayHigh: number;
  dayLow: number;
  sparkline: number[];
};

type QuoteState = { prevClose: number; price: number; spark: number[] };

const SPARK_POINTS = 40;

function rnd(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function buildSpark(from: number, to: number): number[] {
  const points: number[] = [from];
  for (let i = 1; i < SPARK_POINTS - 1; i++) {
    const prev = points[points.length - 1];
    const pull = (to - prev) * 0.12;
    points.push(Math.max(0.01, prev + pull + prev * rnd(-0.004, 0.004)));
  }
  points.push(to);
  return points;
}

const universe: { symbol: string; name: string; base: number }[] = [
  ...marketsJson.indices.map((i) => ({ symbol: i.symbol, name: i.name, base: i.prevClose })),
  ...securitiesJson.map((s) => ({ symbol: s.symbol, name: s.name, base: s.price })),
];

export function getQuotes(symbols?: string[]): Quote[] {
  const g = globalThis as any;
  const state: Record<string, QuoteState> = (g.__quoteState ??= {});

  const wanted = symbols && symbols.length
    ? universe.filter((u) => symbols.includes(u.symbol))
    : universe;

  const quotes: Quote[] = [];
  for (const u of wanted) {
    let st = state[u.symbol];
    if (!st) {
      const prevClose = u.base;
      const price = u.base * (1 + rnd(-0.008, 0.012));
      st = { prevClose, price, spark: buildSpark(prevClose, price) };
      state[u.symbol] = st;
    } else {
      // small tick so the page feels alive when it polls
      st.price = Math.max(0.01, st.price * (1 + rnd(-0.002, 0.002)));
      if (Math.random() < 0.4) {
        st.spark = [...st.spark.slice(1), st.price];
      }
    }

    const change = st.price - st.prevClose;
    quotes.push({
      symbol: u.symbol,
      name: u.name,
      price: round2(st.price),
      prevClose: st.prevClose,
      change: round2(change),
      changePct: round2((change / st.prevClose) * 100),
      dayHigh: round2(Math.max(...st.spark)),
      dayLow: round2(Math.min(...st.spark)),
      sparkline: st.spark.map(round2),
    });
  }
  return quotes;
}

export function getQuote(symbol: string): Quote | undefined {
  return getQuotes([symbol])[0];
}
