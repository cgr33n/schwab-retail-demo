import { NextRequest, NextResponse } from "next/server";
import newsJson from "@/data/news.json";

type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  category: string;
  source: string;
  publishedAt: string;
  summary: string;
  body: string[];
  tickers: string[];
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  let articles = newsJson as NewsArticle[];

  if (category && category !== "all") {
    articles = articles.filter((a) => a.category === category);
  }

  if (q) {
    const needle = q.toLowerCase();
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(needle) ||
        a.summary.toLowerCase().includes(needle)
    );
  }

  return NextResponse.json({ articles });
}
