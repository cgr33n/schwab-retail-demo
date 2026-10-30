import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import learnJson from "@/data/learn.json";

type LearnArticle = {
  slug: string;
  title: string;
  level: string;
  minutes: number;
  blurb: string;
  sections: { heading: string; body: string }[];
};

export const instant = false

export default async function LearnArticlePage(props: PageProps<"/learn/[slug]">) {
  await requireSession();
  const { slug } = await props.params;

  const article = (learnJson as LearnArticle[]).find((a) => a.slug === slug);
  if (!article) {
    notFound();
  }

  const related = (learnJson as LearnArticle[])
    .filter((a) => a.slug !== slug && a.level === article.level)
    .slice(0, 2);

  return (
    <div>
      <div className="page-title spread">
        <div>
          <h1>{article.title}</h1>
          <p className="page-sub">
            <span className="badge badge-info">{article.level}</span> · {article.minutes} min read
          </p>
        </div>
        <Link className="btn" href="/learn">
          All articles
        </Link>
      </div>

      <div className="card article-body">
        {article.sections.map((section) => (
          <div key={section.heading}>
            <h3>{section.heading}</h3>
            <p>{section.body}</p>
          </div>
        ))}
      </div>

      {related.length > 0 && (
        <div className="card">
          <div className="card-title">Keep reading</div>
          <div className="grid-2">
            {related.map((a) => (
              <Link className="learn-card" key={a.slug} href={`/learn/${a.slug}`}>
                <h3>{a.title}</h3>
                <p>{a.blurb}</p>
                <span className="muted" style={{ fontSize: 12 }}>
                  {a.level} · {a.minutes} min
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
