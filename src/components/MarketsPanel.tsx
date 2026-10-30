"use client";

import { useEffect, useState } from "react";
import ChangeBadge from "./ChangeBadge";
import Sparkline from "./Sparkline";

const SYMBOLS = ["SPX", "NDX", "DJI", "RUT", "VIX"];

type Quote = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  sparkline: number[];
};

export default function MarketsPanel() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const res = await fetch(`/api/quotes?symbols=${SYMBOLS.join(",")}`);
        const data = await res.json();
        if (alive) setQuotes(data.quotes ?? []);
      } catch {
        // polling errors are fine to swallow here
      }
    }

    load();
    const timer = setInterval(load, 10000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
      {quotes.map((q) => (
        <div key={q.symbol} className="index-tile">
          <div className="index-name">{q.name}</div>
          <div className="index-value">
            {q.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="spread">
            <ChangeBadge value={q.changePct} />
            <Sparkline points={q.sparkline} width={90} height={26} />
          </div>
        </div>
      ))}
      {quotes.length === 0 && <span className="muted">Loading market data…</span>}
    </div>
  );
}
