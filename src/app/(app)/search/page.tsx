import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import newsJson from "@/data/news.json";
import learnJson from "@/data/learn.json";
import securitiesJson from "@/data/securities.json";

export const instant = false

export default async function SearchPage(props: PageProps<"/search">) {
  await requireSession();
  const searchParams = await props.searchParams;
  const q = typeof searchParams.q === "string" ? searchParams.q.trim().toLowerCase() : "";

  // note: the search API route exists too, but reading the store directly here
  // was simpler than a round trip back to our own server
  const store = getStore();

  const accounts = q
    ? store.accounts
        .filter((a) => a.name.toLowerCase().includes(q))
        .map((a) => ({ id: a.id, name: a.name, type: a.type }))
    : [];

  const articles = q
    ? (newsJson as { title: string; summary: string; source: string }[])
        .filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q))
        .slice(0, 5)
    : [];

  const courses = q
    ? (learnJson as { slug: string; title: string; blurb: string }[])
        .filter((l) => l.title.toLowerCase().includes(q) || l.blurb.toLowerCase().includes(q))
        .slice(0, 5)
    : [];

  const securities = q
    ? (securitiesJson as { symbol: string; name: string }[])
        .filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
        .slice(0, 5)
    : [];

  const total = accounts.length + articles.length + courses.length + securities.length;

  return (
    <div>
      <div className="page-title">
        <h1>Search</h1>
        <p className="page-sub">
          {q ? (
            <>
              {total} result{total === 1 ? "" : "s"} for <strong>&quot;{q}&quot;</strong>
            </>
          ) : (
            "Use the search bar above to find accounts, articles, courses, and securities."
          )}
        </p>
      </div>

      {q && total === 0 && (
        <div className="card">
          <p className="muted" style={{ margin: 0 }}>
            Nothing matched. Try a symbol like <code>SCHB</code>, or a word like <code>ira</code> or{" "}
            <code>savings</code>.
          </p>
        </div>
      )}

      {accounts.length > 0 && (
        <div className="card">
          <div className="card-title">Accounts</div>
          {accounts.map((a) => (
            <Link key={a.id} href={`/accounts/${a.id}`} style={{ display: "block", marginBottom: 6 }}>
              {a.name} <span className="muted">({a.type})</span>
            </Link>
          ))}
        </div>
      )}

      {securities.length > 0 && (
        <div className="card">
          <div className="card-title">Securities</div>
          {securities.map((s) => (
            <Link key={s.symbol} href="/research" style={{ display: "block", marginBottom: 6 }}>
              {s.symbol} · {s.name}
            </Link>
          ))}
        </div>
      )}

      {articles.length > 0 && (
        <div className="card">
          <div className="card-title">News articles</div>
          {articles.map((a, i) => (
            <Link key={i} href="/news" style={{ display: "block", marginBottom: 6 }}>
              {a.title} <span className="muted">— {a.source}</span>
            </Link>
          ))}
        </div>
      )}

      {courses.length > 0 && (
        <div className="card">
          <div className="card-title">Learning center</div>
          {courses.map((c) => (
            <Link key={c.slug} href={`/learn/${c.slug}`} style={{ display: "block", marginBottom: 6 }}>
              {c.title}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
