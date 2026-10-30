"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/money";
import ChangeBadge from "./ChangeBadge";
import Sparkline from "./Sparkline";

type Security = {
  symbol: string;
  name: string;
  type: string;
  sector: string;
  price: number;
  marketCap: number;
  dividendYield: number;
  peRatio: number | null;
  change1y: number;
};

type Quote = { price: number; changePct: number; sparkline: number[] };

const SECTORS = [
  "Technology",
  "Communication Services",
  "Financials",
  "Health Care",
  "Consumer Discretionary",
  "Consumer Staples",
  "Energy",
  "Industrials",
];

function capLabel(cap: number): string {
  if (cap >= 1e12) return (cap / 1e12).toFixed(2) + "T";
  if (cap >= 1e9) return (cap / 1e9).toFixed(0) + "B";
  return (cap / 1e6).toFixed(0) + "M";
}

export default function ScreenerTable() {
  const [type, setType] = useState("all");
  const [sector, setSector] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minMarketCap, setMinMarketCap] = useState("");
  const [minYield, setMinYield] = useState("");
  const [query, setQuery] = useState("");

  const [results, setResults] = useState<Security[]>([]);
  const [ran, setRan] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sortKey, setSortKey] = useState("symbol");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [quote, setQuote] = useState<Record<string, Quote>>({});

  async function runScreen(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    try {
      const params = new URLSearchParams();
      params.set("type", type);
      params.set("sector", sector);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (minMarketCap) params.set("minMarketCap", minMarketCap);
      if (minYield) params.set("minYield", minYield);
      if (query.trim()) params.set("q", query.trim());

      const res = await fetch(`/api/screener?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setRan(true);
    } finally {
      setBusy(false);
    }
  }

  function resetFilters() {
    setType("all");
    setSector("all");
    setMinPrice("");
    setMaxPrice("");
    setMinMarketCap("");
    setMinYield("");
    setQuery("");
    setResults([]);
    setRan(false);
  }

  function onSort(key: string) {
    if (key === sortKey) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDir("asc");
    }
  }

  function sortedResults(): Security[] {
    return [...results].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sortKey];
      const vb = (b as unknown as Record<string, unknown>)[sortKey];
      if (String(va) < String(vb)) return dir === "asc" ? -1 : 1;
      if (String(va) > String(vb)) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }

  async function toggleExpand(symbol: string) {
    if (expanded === symbol) {
      setExpanded(null);
      return;
    }
    setExpanded(symbol);
    if (!quote[symbol]) {
      const res = await fetch(`/api/quotes?symbols=${symbol}`);
      const data = await res.json();
      const q = data.quotes?.[0];
      if (q) setQuote({ ...quote, [symbol]: q });
    }
  }

  return (
    <div>
      <form onSubmit={runScreen} className="card">
        <div className="form-grid">
          <div className="field">
            <label htmlFor="f-type">Type</label>
            <select id="f-type" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All types</option>
              <option value="stock">Stocks</option>
              <option value="etf">ETFs</option>
              <option value="mutual fund">Mutual funds</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="f-sector">Sector</label>
            <select id="f-sector" value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="all">All sectors</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="f-minprice">Min price ($)</label>
            <input id="f-minprice" type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="f-maxprice">Max price ($)</label>
            <input id="f-maxprice" type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="f-cap">Min market cap ($B)</label>
            <input id="f-cap" type="number" min="0" value={minMarketCap} onChange={(e) => setMinMarketCap(e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="f-yield">Min dividend yield (%)</label>
            <input id="f-yield" type="number" min="0" step="0.1" value={minYield} onChange={(e) => setMinYield(e.target.value)} />
          </div>
        </div>

        <div className="row" style={{ flexWrap: "wrap" }}>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 220 }}>
            <input
              type="search"
              placeholder="Search by symbol or name…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search securities"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Running…" : "Run screen"}
          </button>
          <button className="btn btn-ghost" type="button" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </form>

      {ran && (
        <div className="card">
          <div className="card-title">
            {results.length} result{results.length === 1 ? "" : "s"}
          </div>
          <table className="table">
            <thead>
              <tr>
                <th className="sortable" onClick={() => onSort("symbol")}>Symbol</th>
                <th className="sortable" onClick={() => onSort("name")}>Name</th>
                <th className="sortable" onClick={() => onSort("type")}>Type</th>
                <th className="sortable" onClick={() => onSort("sector")}>Sector</th>
                <th className="sortable right-align" onClick={() => onSort("price")}>Price</th>
                <th className="sortable right-align" onClick={() => onSort("marketCap")}>Market cap</th>
                <th className="sortable right-align" onClick={() => onSort("dividendYield")}>Yield</th>
                <th className="sortable right-align" onClick={() => onSort("peRatio")}>P/E</th>
                <th className="sortable right-align" onClick={() => onSort("change1y")}>1-yr</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults().map((s) => (
                <>
                  <tr key={s.symbol} className="clickable" onClick={() => toggleExpand(s.symbol)}>
                    <td style={{ fontWeight: 700 }}>{s.symbol}</td>
                    <td className="muted">{s.name}</td>
                    <td>{s.type === "mutual fund" ? "Fund" : s.type.toUpperCase()}</td>
                    <td className="muted">{s.sector}</td>
                    <td className="right-align">{formatMoney(s.price)}</td>
                    <td className="right-align">{capLabel(s.marketCap)}</td>
                    <td className="right-align">{s.dividendYield.toFixed(2)}%</td>
                    <td className="right-align">{s.peRatio === null ? "—" : s.peRatio.toFixed(1)}</td>
                    <td className="right-align"><ChangeBadge value={s.change1y} /></td>
                  </tr>
                  {expanded === s.symbol && (
                    <tr key={s.symbol + "-detail"}>
                      <td colSpan={9}>
                        {quote[s.symbol] ? (
                          <div className="row" style={{ gap: 24, padding: "4px 0" }}>
                            <div>
                              <div className="stat-value">{formatMoney(quote[s.symbol].price)}</div>
                              <ChangeBadge value={quote[s.symbol].changePct} />
                            </div>
                            <Sparkline points={quote[s.symbol].sparkline} width={220} height={44} />
                            <span className="muted">Simulated intraday quote</span>
                          </div>
                        ) : (
                          <span className="muted">Loading quote…</span>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={9} className="muted">
                    No securities matched those filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!ran && (
        <p className="muted">
          Set your filters and run the screen. Results cover the demo&apos;s watch universe of ~27 securities.
        </p>
      )}
    </div>
  );
}
