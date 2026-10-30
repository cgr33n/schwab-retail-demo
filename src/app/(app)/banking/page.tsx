import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/dates";

export const instant = false

export default async function BankingPage() {
  await requireSession();
  const store = getStore();

  const checking = store.accounts.find((a) => a.type === "checking");
  const savings = store.accounts.find((a) => a.type === "savings");
  if (!checking || !savings) {
    return <p className="muted">No banking accounts found.</p>;
  }

  const bankingTxIds = new Set([checking.id, savings.id]);
  const recent = store.transactions
    .filter((t) => bankingTxIds.has(t.accountId))
    .slice(0, 10);

  const interestYTD = store.transactions
    .filter((t) => t.accountId === savings.id && t.category === "Interest")
    .reduce((sum, t) => sum + t.amount, 0);

  const accountName = (id: string) => store.accounts.find((a) => a.id === id)?.name ?? id;

  return (
    <div>
      <div className="page-title spread">
        <h1>Checking &amp; savings</h1>
        <Link className="btn btn-primary" href="/transfers">
          Transfer money
        </Link>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">
            {checking.name} <span className="muted">•••• {checking.number}</span>
          </div>
          <div className="stat-value">{formatMoney(checking.balance)}</div>
          <div className="stat-sub mt-8">Unlimited ATM fee rebates worldwide</div>
          <div className="row mt-16">
            <Link className="btn btn-sm" href="/card">Manage cards</Link>
            <Link className="btn btn-sm" href={`/accounts/${checking.id}`}>Details</Link>
          </div>
        </div>

        <div className="card">
          <div className="card-title">
            {savings.name} <span className="muted">•••• {savings.number}</span>
          </div>
          <div className="stat-value">{formatMoney(savings.balance)}</div>
          <div className="stat-sub mt-8">
            {savings.apy}% APY · {formatMoney(interestYTD)} interest earned this period
          </div>
          <div className="row mt-16">
            <Link className="btn btn-sm" href={`/accounts/${savings.id}`}>Details</Link>
            <Link className="btn btn-sm" href="/statements">Statements</Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          Recent banking activity
          <Link className="card-link" href="/statements">
            View statements
          </Link>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Account</th>
              <th className="right-align">Amount</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t) => (
              <tr key={t.id}>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(t.date)}</td>
                <td>
                  {t.description}
                  {t.pending && <span className="badge badge-warning" style={{ marginLeft: 8 }}>Pending</span>}
                </td>
                <td className="muted">{accountName(t.accountId)}</td>
                <td className={"right-align " + (t.amount >= 0 ? "up" : "down")}>{formatMoney(t.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
