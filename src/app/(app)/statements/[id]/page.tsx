import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { formatDate, monthLabel } from "@/lib/dates";
import PrintButton from "@/components/PrintButton";

export const instant = false

export default async function StatementDetailPage(props: PageProps<"/statements/[id]">) {
  await requireSession();
  const { id } = await props.params;

  const store = getStore();
  const statement = store.statements.find((s) => s.id === id);
  if (!statement) {
    notFound();
  }

  const account = store.accounts.find((a) => a.id === statement.accountId);
  if (!account) {
    notFound();
  }

  // figure out the calendar window for the statement month
  const [y, m] = statement.month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  const periodStart = `${statement.month}-01`;
  const periodEnd = `${statement.month}-${lastDay < 10 ? "0" + lastDay : lastDay}`;

  const txs = store.transactions
    .filter((t) => t.accountId === account.id && t.date >= periodStart && t.date <= `${periodEnd}T23:59:59`)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const isInvestment = account.type === "brokerage" || account.type === "ira";

  return (
    <div>
      <div className="page-title spread no-print">
        <div>
          <h1>{monthLabel(statement.month)} statement</h1>
          <p className="page-sub">
            {account.name} •••• {account.number} · {formatDate(periodStart)} – {formatDate(periodEnd)}
          </p>
        </div>
        <div className="row">
          <Link className="btn" href="/statements">
            Back to statements
          </Link>
          <PrintButton />
        </div>
      </div>

      <div className="card print-area">
        <div className="spread" style={{ marginBottom: 18 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{account.name}</div>
            <div className="muted">Account •••• {account.number}</div>
          </div>
          <div className="right-align">
            <div style={{ fontWeight: 700 }}>Schwab Retail Demo</div>
            <div className="muted">Statement period: {monthLabel(statement.month)}</div>
          </div>
        </div>

        <table className="stmt_table" style={{ maxWidth: 480, marginBottom: 18 }}>
          <tbody>
            <tr>
              <td>Beginning balance</td>
              <td className="right-align">{formatMoney(statement.beginning)}</td>
            </tr>
            <tr>
              <td>Deposits &amp; other credits</td>
              <td className="right-align up">{formatMoney(statement.deposits)}</td>
            </tr>
            <tr>
              <td>Withdrawals &amp; other debits</td>
              <td className="right-align down">{formatMoney(statement.withdrawals)}</td>
            </tr>
            <tr>
              <td>Interest earned</td>
              <td className="right-align up">{formatMoney(statement.interest)}</td>
            </tr>
            {isInvestment && (
              <>
                <tr>
                  <td>Dividends &amp; capital gains</td>
                  <td className="right-align up">{formatMoney(statement.dividends)}</td>
                </tr>
                <tr>
                  <td>Market activity</td>
                  <td className={"right-align " + (statement.marketActivity >= 0 ? "up" : "down")}>
                    {formatMoney(statement.marketActivity)}
                  </td>
                </tr>
              </>
            )}
            <tr>
              <td>Fees</td>
              <td className="right-align">{formatMoney(statement.fees)}</td>
            </tr>
            <tr style={{ fontWeight: 700 }}>
              <td>Ending balance</td>
              <td className="right-align">{formatMoney(statement.ending)}</td>
            </tr>
          </tbody>
        </table>

        <h2>Transactions</h2>
        <table className="stmt_table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="right-align">Amount</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id}>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(t.date)}</td>
                <td>{t.description}</td>
                <td className="muted">{t.category}</td>
                <td className={"right-align " + (t.amount >= 0 ? "up" : "down")}>{formatMoney(t.amount)}</td>
              </tr>
            ))}
            {txs.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No transactions during this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <p className="foot-note">
          This is a demo statement. All institutions, balances, and transactions are fictional.
        </p>
      </div>
    </div>
  );
}
