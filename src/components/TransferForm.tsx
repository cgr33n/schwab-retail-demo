"use client";

import { useEffect, useState } from "react";

type Account = {
  id: string;
  name: string;
  type: string;
  number: string;
  balance: number;
};

type Transfer = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  frequency: string;
  scheduledFor?: string;
  memo?: string;
  status: "scheduled" | "processing" | "completed" | "failed" | "cancelled";
  createdAt: string;
};

function defaultDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function statusBadge(status: Transfer["status"]) {
  switch (status) {
    case "completed":
      return <span className="badge badge-success">Completed</span>;
    case "scheduled":
      return <span className="badge badge-info">Scheduled</span>;
    case "processing":
      return <span className="badge badge-warning">Processing</span>;
    case "failed":
      return <span className="badge badge-danger">Failed</span>;
    default:
      return <span className="badge badge-muted">Cancelled</span>;
  }
}

export default function TransferForm() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [from, setFrom] = useState("acct_checking");
  const [to, setTo] = useState("acct_savings");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [date, setDate] = useState(defaultDate());
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [acctRes, xferRes] = await Promise.all([
      fetch("/api/accounts"),
      fetch("/api/transfers"),
    ]);
    const acctData = await acctRes.json();
    const xferData = await xferRes.json();
    setAccounts(acctData.accounts ?? []);
    setTransfers(xferData.transfers ?? []);
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);

    // same-day transfers execute immediately, future dates get scheduled
    const scheduledFor = date !== defaultDate() ? date : undefined;

    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromAccountId: from, toAccountId: to, amount, frequency, scheduledFor, memo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setSuccess(
          scheduledFor
            ? `Transfer of $${Number(amount).toFixed(2)} scheduled for ${scheduledFor}.`
            : `Transfer of $${Number(amount).toFixed(2)} completed.`
        );
        setAmount("");
        setMemo("");
        await load();
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function cancelTransfer(id: string) {
    const res = await fetch(`/api/transfers?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not cancel that transfer.");
    } else {
      setSuccess("Transfer cancelled.");
    }
    await load();
  }

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-title">Schedule a transfer</div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="from">From</label>
              <select id="from" value={from} onChange={(e) => setFrom(e.target.value)}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} •••• {a.number}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="to">To</label>
              <select id="to" value={to} onChange={(e) => setTo(e.target.value)}>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} •••• {a.number}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="amount">Amount</label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="frequency">Frequency</label>
              <select id="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                <option value="once">One time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="memo">Memo (optional)</label>
              <input
                id="memo"
                type="text"
                maxLength={60}
                placeholder="e.g. vacation fund"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
              />
            </div>
          </div>

          {frequency !== "once" && (
            <p className="foot-note">
              Recurring transfers repeat on this date. TODO: hook these up to the scheduler.
            </p>
          )}

          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Submitting…" : "Submit transfer"}
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-title">Transfer history</div>
        {transfers.length === 0 && <p className="muted">No transfers yet.</p>}
        {transfers.map((t) => (
          <div key={t.id} className="spread" style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
            <div>
              <div>
                {accountName(t.fromAccountId)} → {accountName(t.toAccountId)}
              </div>
              <div className="muted" style={{ fontSize: 12.5 }}>
                {t.scheduledFor
                  ? new Date(t.scheduledFor).toLocaleDateString() // date it runs
                  : t.createdAt.slice(0, 10)}
                {" · "}
                {t.frequency}
                {t.memo ? ` · ${t.memo}` : ""}
              </div>
            </div>
            <div className="right-align">
              <div style={{ fontWeight: 700 }}>${t.amount.toFixed(2)}</div>
              <div className="row" style={{ justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                {statusBadge(t.status)}
                {t.status === "scheduled" && (
                  <button className="btn btn-danger btn-sm" onClick={() => cancelTransfer(t.id)} type="button">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
