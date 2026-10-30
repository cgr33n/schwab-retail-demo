"use client";

import { useEffect, useState } from "react";
import securitiesJson from "@/data/securities.json";
import ChangeBadge from "./ChangeBadge";
import { formatMoney } from "@/lib/money";
import { gainPct } from "@/lib/performance";

type PositionLite = {
  symbol: string;
  shares: number;
  costBasisPerShare: number;
};

type Row = {
  symbol: string;
  name: string;
  shares: number;
  price: number;
  dayPct: number;
  value: number;
  costBasis: number;
  gain: number;
  gainPct: number;
};

const SECURITY_META: Record<string, { name: string; sector: string }> = Object.fromEntries(
  securitiesJson.map((s) => [s.symbol, { name: s.name, sector: s.sector }])
);

function buildRows(positions: PositionLite[], quotes: { symbol: string; price: number; changePct: number }[]): Row[] {
  const qmap: Record<string, { price: number; changePct: number }> = Object.fromEntries(
    quotes.map((q) => [q.symbol, { price: q.price, changePct: q.changePct }])
  );

  return positions.map((p) => {
    const q = qmap[p.symbol] ?? { price: 0, changePct: 0 };
    const value = p.shares * q.price;
    const costBasis = p.shares * p.costBasisPerShare;
    return {
      symbol: p.symbol,
      name: SECURITY_META[p.symbol]?.name ?? p.symbol,
      shares: p.shares,
      price: q.price,
      dayPct: q.changePct,
      value,
      costBasis,
      gain: value - costBasis,
      gainPct: gainPct(p.costBasisPerShare, q.price),
    };
  });
}

export default function PositionTable({ positions }: { positions: PositionLite[] }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [sortKey, setSortKey] = useState<string>("value");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  async function loadQuotes() {
    if (positions.length === 0) return;
    const symbols = positions.map((p) => p.symbol).join(",");
    const res = await fetch(`/api/quotes?symbols=${symbols}`);
    const data = await res.json();
    setRows(buildRows(positions, data.quotes ?? []));
  }

  useEffect(() => {
    loadQuotes();
    const timer = setInterval(loadQuotes, 15000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSort(key: string) {
    if (key === sortKey) {
      setDir(dir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setDir("asc");
    }
  }

  // FIXME: pretty sure this is wrong for the numeric columns
  function sortedRows(): Row[] {
    return [...rows].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sortKey];
      const vb = (b as unknown as Record<string, unknown>)[sortKey];
      if (String(va) < String(vb)) return dir === "asc" ? -1 : 1;
      if (String(va) > String(vb)) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }

  if (positions.length === 0) {
    return <p className="muted">No positions in this account.</p>;
  }

  return (
    <div>
      <table className="table">
        <thead>
          <tr>
            <th className="sortable" onClick={() => onSort("symbol")}>Symbol</th>
            <th className="sortable" onClick={() => onSort("name")}>Name</th>
            <th className="sortable right-align" onClick={() => onSort("shares")}>Shares</th>
            <th className="sortable right-align" onClick={() => onSort("price")}>Price</th>
            <th className="right-align">Today</th>
            <th className="sortable right-align" onClick={() => onSort("value")}>Market value</th>
            <th className="sortable right-align" onClick={() => onSort("costBasis")}>Cost basis</th>
            <th className="sortable right-align" onClick={() => onSort("gain")}>Gain / loss</th>
            <th className="sortable right-align" onClick={() => onSort("gainPct")}>%</th>
          </tr>
        </thead>
        <tbody>
          {sortedRows().map((r) => (
            <tr key={r.symbol}>
              <td style={{ fontWeight: 700 }}>{r.symbol}</td>
              <td className="muted">{r.name}</td>
              <td className="right-align">{r.shares.toLocaleString()}</td>
              <td className="right-align">{formatMoney(r.price)}</td>
              <td className="right-align"><ChangeBadge value={r.dayPct} /></td>
              <td className="right-align" style={{ fontWeight: 600 }}>{formatMoney(r.value)}</td>
              <td className="right-align muted">{r.costBasis > 0 ? formatMoney(r.costBasis) : "—"}</td>
              <td className={"right-align " + (r.gain >= 0 ? "up" : "down")}>{formatMoney(r.gain)}</td>
              <td className={"right-align " + (r.gain >= 0 ? "up" : "down")}><ChangeBadge value={r.gainPct} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="foot-note">Quotes are simulated and refresh every 15 seconds.</p>
    </div>
  );
}
