"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "@/lib/dates";

const CATEGORIES = ["All", "Markets", "Economy", "Retirement", "Banking", "Investing"];

type Article = {
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

export default function NewsFeed() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // debounce the text search so we aren't hammering the api on each keystroke
    const timer = setTimeout(() => {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (query.trim()) params.set("q", query.trim());

      fetch(`/api/news?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => {
          setArticles(d.articles ?? []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [category, query]);

  return (
    <div>
      <div className="chips">
        {CATEGORIES.map((c) => {
          const value = c === "All" ? "all" : c.toLowerCase();
          return (
            <button
              key={c}
              className={category === value ? "chip active" : "chip"}
              onClick={() => setCategory(value)}
              type="button"
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="field" style={{ maxWidth: 360 }}>
        <input
          type="search"
          placeholder="Search headlines…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search news"
        />
      </div>

      {loading && <p className="muted">Loading…</p>}

      {!loading && articles.length === 0 && (
        <p className="muted">No articles found{query ? ` for "${query}"` : ""}.</p>
      )}

      {articles.map((a) => (
        <div key={a.id} className="news-card">
          <div className="news-title">{a.title}</div>
          <div className="news-meta">
            {a.category} · {a.source} · {relativeTime(a.publishedAt)}
            {a.tickers.length > 0 && ` · ${a.tickers.join(", ")}`}
          </div>
          <p className="news-summary">{a.summary}</p>

          {expanded === a.id && (
            <div className="news-body">
              {a.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded(expanded === a.id ? null : a.id)}
            type="button"
          >
            {expanded === a.id ? "Close" : "Read more"}
          </button>
        </div>
      ))}
    </div>
  );
}
