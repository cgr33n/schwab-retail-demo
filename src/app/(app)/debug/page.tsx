import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import ResetButton from "@/components/ResetButton";

// scratch page for poking at the in-memory store while working on the demo.
// TODO: remove this page (or hide it behind an env flag) before we show this to anyone
export const instant = false

export default async function DebugPage() {
  await requireSession();
  const store = getStore();

  const dump = {
    user: store.user,
    accounts: store.accounts,
    positions: store.positions,
    transfers: store.transfers,
    cards: store.cards,
    notificationCount: store.notifications.length,
    transactionCount: store.transactions.length,
  };

  return (
    <div>
      <div className="page-title spread">
        <h1>Debug</h1>
        <ResetButton />
      </div>
      <p className="page-sub">Raw contents of the in-memory store.</p>

      <div className="card">
        <pre
          style={{
            background: "#0b1a2e",
            color: "#c9e2ff",
            padding: 16,
            borderRadius: 8,
            overflowX: "auto",
            fontSize: 12,
          }}
        >
          {JSON.stringify(dump, null, 2)}
        </pre>
      </div>
    </div>
  );
}
