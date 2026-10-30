import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getQuotes } from "@/lib/market";
import { formatMoney, formatPct } from "@/lib/money";
import { formatDate, relativeTime } from "@/lib/dates";
import { ytdReturn } from "@/lib/performance";
import historyJson from "@/data/portfolio-history.json";
import newsJson from "@/data/news.json";
import AccountCard from "@/components/AccountCard";
import ChangeBadge from "@/components/ChangeBadge";
import Sparkline from "@/components/Sparkline";
import MarketsPanel from "@/components/MarketsPanel";

type HistoryPoint = { date: string; value: number };
type NewsLite = { id: string; slug: string; title: string; category: string; publishedAt: string };

export const instant = false

export default async function DashboardPage() {
  await requireSession();
  const store = getStore();
  const user = store.user;

  const ownAccounts = store.accounts.filter((a) => a.type !== "external");
  const netWorth = ownAccounts.reduce((sum, a) => sum + a.balance, 0);

  // day change across our holdings, using the simulated quotes
  const symbols = store.positions.map((p) => p.symbol);
  const quotes = getQuotes(symbols);
  const quoteMap: Record<string, { price: number; prevClose: number }> = Object.fromEntries(
    quotes.map((q) => [q.symbol, { price: q.price, prevClose: q.prevClose }])
  );

  let dayChange = 0;
  let positionsTotal = 0;
  for (const p of store.positions) {
    const q = quoteMap[p.symbol];
    if (!q) continue;
    positionsTotal += p.shares * q.price;
    dayChange += (q.price - q.prevClose) * p.shares;
  }
  const dayChangePct = positionsTotal > 0 ? (dayChange / (positionsTotal - dayChange)) * 100 : 0;

  const cashTotal =
    (store.accounts.find((a) => a.id === "acct_checking")?.balance ?? 0) +
    (store.accounts.find((a) => a.id === "acct_savings")?.balance ?? 0) +
    ownAccounts.reduce((s, a) => s + (a.cash ?? 0), 0);

  const series = (historyJson as HistoryPoint[]).map((h) => h.value);

  // start-of-year value + deposits we've made this year (matches the seed data)
  const ytd = ytdReturn(netWorth, 90000, 5000);

  const hour = new Date().getHours();
  const partOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  const firstName = user.name.split(" ")[0];

  const recentTxs = store.transactions.slice(0, 8);
  const upcoming = store.transfers.filter((t) => t.status === "scheduled").slice(0, 3);
  const accountName = (id: string) => store.accounts.find((a) => a.id === id)?.name ?? id;

  const headlines = ([...newsJson] as NewsLite[])
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 3);

  return (
    <div>
      <div className="page-title">
        <h1>
          Good {partOfDay}, {firstName}
        </h1>
        <p className="page-sub">Here&apos;s where your money stands today, {formatDate(new Date())}.</p>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="stat-label">Net worth</div>
          <div className="stat-value">{formatMoney(netWorth, { cents: false })}</div>
          <div className="row" style={{ justifyContent: "space-between", marginTop: 6 }}>
            <span className="muted">Last 30 days</span>
            <Sparkline points={series} width={150} height={34} />
          </div>
        </div>

        <div className="card">
          <div className="stat-label">Today</div>
          <div className="stat-value" style={{ marginTop: 4 }}>
            <span className={dayChange >= 0 ? "up" : "down"}>{formatMoney(dayChange)}</span>
          </div>
          <div className="mt-8">
            <ChangeBadge value={dayChangePct} />
            <span className="muted" style={{ marginLeft: 8 }}>across all holdings</span>
          </div>
        </div>

        <div className="card">
          <div className="stat-label">YTD return</div>
          <div className="stat-value mt-8">
            <span className="up">{formatPct(ytd)}</span>
          </div>
          <div className="stat-sub mt-8">Cash &amp; sweep: {formatMoney(cashTotal, { cents: false })}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Markets
          <Link className="card-link" href="/markets">
            View markets
          </Link>
        </div>
        <MarketsPanel />
      </div>

      <div className="card">
        <div className="card-title">
          Your accounts
          <Link className="card-link" href="/accounts">
            All accounts
          </Link>
        </div>
        <div className="grid-2">
          {ownAccounts.map((a) => (
            <AccountCard key={a.id} account={a} />
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Recent activity</div>
          <table className="table">
            <tbody>
              {recentTxs.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div>{t.description}</div>
                    <div className="muted" style={{ fontSize: 12 }}>
                      {accountName(t.accountId)} · {formatDate(t.date)}
                      {t.pending ? " · pending" : ""}
                    </div>
                  </td>
                  <td className={"right-align " + (t.amount >= 0 ? "up" : "down")} style={{ whiteSpace: "nowrap" }}>
                    {formatMoney(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="card">
            <div className="card-title">
              Upcoming transfers
              <Link className="card-link" href="/transfers">
                Transfer money
              </Link>
            </div>
            {upcoming.length === 0 && <p className="muted">No scheduled transfers.</p>}
            {upcoming.map((t) => (
              <div key={t.id} className="spread" style={{ marginBottom: 10 }}>
                <div>
                  <div>{accountName(t.fromAccountId)} → {accountName(t.toAccountId)}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {t.scheduledFor ? `Scheduled for ${formatDate(t.scheduledFor)}` : "Processing"} · {t.frequency}
                  </div>
                </div>
                <strong>{formatMoney(t.amount)}</strong>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">
              Latest headlines
              <Link className="card-link" href="/news">
                All news
              </Link>
            </div>
            {headlines.map((h) => (
              <div key={h.id} style={{ marginBottom: 10 }}>
                <Link href="/news">{h.title}</Link>
                <div className="muted" style={{ fontSize: 12 }}>
                  {h.category} · {relativeTime(h.publishedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
