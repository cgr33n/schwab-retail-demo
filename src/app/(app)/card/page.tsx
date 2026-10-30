import { requireSession } from "@/lib/auth";
import { getStore } from "@/lib/db";
import CardControls from "@/components/CardControls";

export const instant = false

export default async function CardsPage() {
  await requireSession();
  const store = getStore();

  const checking = store.accounts.find((a) => a.type === "checking");
  const cardTxs = store.transactions.filter((t) => t.accountId === checking?.id);

  return (
    <div>
      <div className="page-title">
        <h1>Debit cards</h1>
        <p className="page-sub">
          Freeze, limits, and settings for the cards on {checking?.name} •••• {checking?.number}.
        </p>
      </div>

      <CardControls transactions={cardTxs} />
    </div>
  );
}
