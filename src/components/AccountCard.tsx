import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { Account } from "@/lib/types";

const TYPE_LABELS: Record<string, string> = {
  brokerage: "Brokerage",
  ira: "Retirement",
  checking: "Checking",
  savings: "Savings",
  external: "Linked bank",
};

export default function AccountCard({ account }: { account: Account }) {
  return (
    <Link href={`/accounts/${account.id}`} className="acct-card">
      <div className="spread">
        <span style={{ fontWeight: 600 }}>{account.name}</span>
        <span className="badge badge-info">{TYPE_LABELS[account.type]}</span>
      </div>
      <div className="acct-balance">{formatMoney(account.balance)}</div>
      <div className="acct-mask">Account •••• {account.number}</div>
    </Link>
  );
}
