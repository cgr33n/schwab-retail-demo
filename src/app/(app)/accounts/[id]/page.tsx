import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { getQuotes } from "@/lib/market";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";
import AccountCard from "@/components/AccountCard";
import AllocationBar from "@/components/AllocationBar";
import ChangeBadge from "@/components/ChangeBadge";
import PositionTable from "@/components/PositionTable";

export const instant = false

export default async function AccountDetailPage(props: PageProps<"/accounts/[id]">) {
  await requireSession();
  const { id } = await props.params;

  const store = getStore();
  const account = store.accounts.find((a) => a.id === id);
  if (!account) {
    notFound();
  }

  const positions = store.positions.filter((p) => p.accountId === id);
  const transactions = store.transactions.filter((t) => t.accountId === id).slice(0, 14);
  const others = store.accounts.filter((a) => a.id !== id && a.type !== "external");
  const isInvestment = account.type === "brokerage" || account.type === "ira";

  // market value + day change for the holdings in this account
  const quotes = getQuotes(positions.map((p) => p.symbol));
  const quoteMap: Record<string, { price: number; prevClose: number }> = Object.fromEntries(
    quotes.map((q) => [q.symbol, { price: q.price, prevClose: q.prevClose }])
  );
  let marketValue = 0;
  let dayChange = 0;
  for (const p of positions) {
    const q = quoteMap[p.symbol];
    if (!q) continue;
    marketValue += p.shares * q.price;
    dayChange += (q.price - q.prevClose) * p.shares;
  }

  const allocation = positions.map((p) => {
    const q = quoteMap[p.symbol];
    return { label: p.symbol, value: p.shares * (q?.price ?? 0) };
  });

  return (
    <div>
      <div className="page-title spread">
        <div>
          <h1>{account.name}</h1>
          <p className="page-sub">Account •••• {account.number} · opened {formatDate(account.openedOn)}</p>
        </div>
        <Link className="btn" href="/transfers">
          Transfer money
        </Link>
      </div>

      <div className="grid-3">
        <div className="card">
          <div className="stat-label">Balance</div>
          <div className="stat-value">{formatMoney(account.balance)}</div>
        </div>
        <div className="card">
          <div className="stat-label">{isInvestment ? "Market value" : "Available balance"}</div>
          <div className="stat-value">{formatMoney(isInvestment ? marketValue : account.balance)}</div>
          {isInvestment && (
            <div className="mt-8">
              <ChangeBadge value={marketValue > 0 ? (dayChange / (marketValue - dayChange)) * 100 : 0} />
              <span className="muted" style={{ marginLeft: 8 }}>today</span>
            </div>
          )}
        </div>
        <div className="card">
          <div className="stat-label">{account.type === "savings" ? "Interest rate" : isInvestment ? "Cash & sweep" : "This month"}</div>
          <div className="stat-value">
            {account.type === "savings" ? `${account.apy}% APY` : formatMoney(isInvestment ? (account.cash ?? 0) : account.balance)}
          </div>
          {account.type === "savings" && (
            <div className="stat-sub mt-8">Interest compounds monthly</div>
          )}
        </div>
      </div>

      {isInvestment && (
        <>
          <div className="card">
            <div className="card-title">Positions</div>
            <PositionTable positions={positions} />
          </div>

          <div className="card">
            <div className="card-title">Allocation</div>
            <AllocationBar segments={allocation} />
          </div>
        </>
      )}

      <div className="card">
        <div className="card-title">
          Recent transactions
          {account.type === "checking" && (
            <Link className="card-link" href="/card">
              Manage debit cards
            </Link>
          )}
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="right-align">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(t.date)}</td>
                <td>
                  {t.description}
                  {t.pending && <span className="badge badge-warning" style={{ marginLeft: 8 }}>Pending</span>}
                </td>
                <td className="muted">{t.category}</td>
                <td className={"right-align " + (t.amount >= 0 ? "up" : "down")}>{formatMoney(t.amount)}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">No transactions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-title">Your other accounts</div>
        <div className="grid-3">
          {others.slice(0, 3).map((a) => (
            <AccountCard key={a.id} account={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
