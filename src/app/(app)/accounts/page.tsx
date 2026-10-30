import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import AccountCard from "@/components/AccountCard";

export const instant = false

export default async function AccountsPage() {
  await requireSession();
  const store = getStore();

  const own = store.accounts.filter((a) => a.type !== "external");
  const linked = store.accounts.filter((a) => a.type === "external");
  const total = own.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div>
      <div className="page-title spread">
        <h1>Accounts</h1>
        <a className="btn" href="#" title="Not available in the demo">
          Open a new account
        </a>
      </div>

      <div className="card">
        <div className="stat-label">Total balance across accounts</div>
        <div className="stat-value">{formatMoney(total)}</div>
      </div>

      <div className="grid-2">
        {own.map((a) => (
          <AccountCard key={a.id} account={a} />
        ))}
      </div>

      <div className="card">
        <div className="card-title">Linked external accounts</div>
        {linked.map((a) => (
          <div key={a.id} className="spread" style={{ marginBottom: 8 }}>
            <span>
              {a.name} <span className="muted">•••• {a.number}</span>
            </span>
            <span className="badge badge-muted">Linked for transfers</span>
          </div>
        ))}
        {linked.length === 0 && <p className="muted">No external accounts linked.</p>}
      </div>
    </div>
  );
}
