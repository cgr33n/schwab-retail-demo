import { requireSession } from "@/lib/auth";
import NewsFeed from "@/components/NewsFeed";

export const instant = false

export default async function NewsPage() {
  await requireSession();

  return (
    <div>
      <div className="page-title">
        <h1>News</h1>
        <p className="page-sub">Market, economy, and personal finance headlines. Updated throughout the day.</p>
      </div>
      <NewsFeed />
    </div>
  );
}
