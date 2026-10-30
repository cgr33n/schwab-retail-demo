import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import { monthLabel } from "@/lib/dates";

export const instant = false

export default async function StatementsPage() {
  await requireSession();
  const store = getStore();

  const statements = [...store.statements].sort((a, b) => (a.month < b.month ? 1 : -1));
  const accountName = (id: string) => store.accounts.find((a) => a.id === id)?.name ?? id;

  return (
    <div>
      <div className="page-title spread">
        <h1>Statements</h1>
        <Link className="card-link" href="/settings">
          Delivery preferences
        </Link>
      </div>

      {!store.user.paperless && (
        <div className="form-error">
          You&apos;re still receiving paper statements by mail. <Link href="/settings">Go paperless</Link> to get everything online.
        </div>
      )}

      <div className="card">
        <div className="card-title">Monthly statements</div>
        <table className="stmt_table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Account</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {statements.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{monthLabel(s.month)}</td>
                <td>{accountName(s.accountId)}</td>
                <td>
                  <span className="badge badge-success">Ready</span>
                </td>
                <td className="right-align">
                  <Link className="btn btn-sm" href={`/statements/${s.id}`}>
                    View / PDF
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="foot-note">
          October 2026 statements are still being prepared and will be available on the 1st.
        </p>
      </div>
    </div>
  );
}
