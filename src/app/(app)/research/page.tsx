import { requireSession } from "@/lib/auth";
import ScreenerTable from "@/components/ScreenerTable";

export const instant = false

export default async function ScreenerPage() {
  await requireSession();

  return (
    <div>
      <div className="page-title">
        <h1>Screener</h1>
        <p className="page-sub">
          Filter the demo universe of stocks, ETFs, and index funds. Click a row for a live quote.
        </p>
      </div>
      <ScreenerTable />
    </div>
  );
}
