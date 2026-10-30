import { NextRequest, NextResponse } from "next/server";
import newsJson from "@/data/news.json";
import learnJson from "@/data/learn.json";
import securitiesJson from "@/data/securities.json";
import { getStore } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
  if (!q) {
    return NextResponse.json({ accounts: [], articles: [], courses: [], securities: [] });
  }

  const store = getStore();

  const accounts = store.accounts
    .filter((a) => a.name.toLowerCase().includes(q))
    .map((a) => ({ id: a.id, name: a.name, type: a.type }));

  const articles = (newsJson as { title: string; summary: string; slug: string; source: string }[])
    .filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q))
    .slice(0, 5);

  const courses = (learnJson as { slug: string; title: string; blurb: string }[])
    .filter((l) => l.title.toLowerCase().includes(q) || l.blurb.toLowerCase().includes(q))
    .slice(0, 5);

  const securities = (securitiesJson as { symbol: string; name: string }[])
    .filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
    .slice(0, 5);

  return NextResponse.json({ accounts, articles, courses, securities });
}
