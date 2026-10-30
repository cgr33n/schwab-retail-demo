import Link from "next/link";
import { requireSession } from "@/lib/auth";
import learnJson from "@/data/learn.json";

type LearnArticle = {
  slug: string;
  title: string;
  level: string;
  minutes: number;
  blurb: string;
};

const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const instant = false

export default async function LearnPage() {
  await requireSession();
  const articles = learnJson as LearnArticle[];

  return (
    <div>
      <div className="page-title">
        <h1>Learning center</h1>
        <p className="page-sub">Short, practical explainers on investing and everyday money decisions.</p>
      </div>

      {LEVELS.map((level) => {
        const group = articles.filter((a) => a.level === level);
        if (group.length === 0) return null;
        return (
          <div className="card" key={level}>
            <div className="card-title">
              {level}
              <span className="muted" style={{ fontWeight: 400, fontSize: 12.5 }}>
                {group.length} article{group.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid-3">
              {group.map((a) => (
                <Link className="learn-card" key={a.slug} href={`/learn/${a.slug}`}>
                  <span className="badge badge-info">{a.minutes} min read</span>
                  <h3>{a.title}</h3>
                  <p>{a.blurb}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
      {/* TODO: track which articles the user has finished */}
    </div>
  );
}
