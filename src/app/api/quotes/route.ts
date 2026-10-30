// market data is intentionally public, same as on the real site

import { NextRequest, NextResponse } from "next/server";
import { getQuotes } from "@/lib/market";

export async function GET(req: NextRequest) {
  const symbolsParam = new URL(req.url).searchParams.get("symbols");
  const symbols = symbolsParam
    ? symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
    : undefined;

  return NextResponse.json({ quotes: getQuotes(symbols) });
}
