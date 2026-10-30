// equity/fund screener. filters are applied server side and the table
// component handles sorting locally.

import { NextRequest, NextResponse } from "next/server";
import securitiesJson from "@/data/securities.json";

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

function num(v: string | null): number | undefined {
  if (v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const sector = searchParams.get("sector");
  const minPrice = num(searchParams.get("minPrice"));
  const maxPrice = num(searchParams.get("maxPrice"));
  const minMarketCap = num(searchParams.get("minMarketCap"));
  const minYield = num(searchParams.get("minYield"));
  const q = searchParams.get("q");
  const sort = searchParams.get("sort"); // TODO: wire up server-side sorting

  const results = (securitiesJson as Security[]).filter((s) => {
    if (type && type !== "all" && s.type !== type) return false;
    if (sector && sector !== "all" && s.sector !== sector) return false;
    if (minPrice !== undefined && s.price < minPrice) return false;
    if (maxPrice !== undefined && s.price <= maxPrice) return false;
    if (minMarketCap !== undefined && s.marketCap < minMarketCap) return false;
    if (minYield !== undefined && s.dividendYield < minYield) return false;
    if (q) {
      const needle = q.toLowerCase();
      return (
        s.symbol.toLowerCase().includes(needle) ||
        s.name.toLowerCase().includes(needle)
      );
    }
    return true;
  });

  return NextResponse.json({ results, count: results.length });
}
