import { requireSession } from "@/lib/auth";
import TransferForm from "@/components/TransferForm";

export const instant = false

export default async function TransfersPage() {
  await requireSession();

  return (
    <div>
      <div className="page-title">
        <h1>Transfers</h1>
        <p className="page-sub">Move money between your accounts or a linked bank.</p>
      </div>
      <TransferForm />
    </div>
  );
}
