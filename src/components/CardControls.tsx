"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/dates";

// the purchase categories that run through the debit cards
const CARD_CATEGORIES = ["Groceries", "Dining", "Gas", "Subscription"];

type CardInfo = {
  id: string;
  accountId: string;
  label: string;
  last4: string;
  number: string;
  cvv: string;
  expiry: string;
  frozen: boolean;
  dailyLimit: number;
  international: boolean;
  openedOn: string;
};

type CardTx = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  pending?: boolean;
};

export default function CardControls({ transactions }: { transactions: CardTx[] }) {
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [sorted, setSorted] = useState<CardInfo[]>([]);
  const [limits, setLimits] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function load() {
    const res = await fetch("/api/card");
    const data = await res.json();
    const list: CardInfo[] = data.cards ?? [];
    setCards(list);
    // newest card first
    setSorted([...list].sort((a, b) => (a.openedOn < b.openedOn ? 1 : -1)));
    setLimits(Object.fromEntries(list.map((c) => [c.id, String(c.dailyLimit)])));
  }

  async function toggleFreeze(idx: number) {
    // idx is the position of the card in the displayed list
    const card = cards[idx];
    if (!card) return;

    const action = card.frozen ? "unfreeze" : "freeze";
    setBusyId(card.id);
    try {
      const res = await fetch("/api/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, action }),
      });
      const data = await res.json();
      setError(res.ok ? null : data.error ?? "Something went wrong.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function saveLimit(card: CardInfo) {
    setBusyId(card.id);
    try {
      const res = await fetch("/api/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, action: "limit", value: Number(limits[card.id]) }),
      });
      const data = await res.json();
      setError(res.ok ? null : data.error ?? "Something went wrong.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function toggleInternational(card: CardInfo) {
    setBusyId(card.id);
    try {
      const res = await fetch("/api/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, action: "international", value: !card.international }),
      });
      const data = await res.json();
      setError(res.ok ? null : data.error ?? "Something went wrong.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const cardTxs = transactions.filter((t) => CARD_CATEGORIES.includes(t.category));

  return (
    <div>
      {error && <div className="form-error">{error}</div>}

      <div className="grid-2">
        {sorted.map((card, idx) => (
          <div key={card.id}>
            <div className={card.frozen ? "debit-card frozen" : "debit-card"}>
              <div className="debit-card-top">
                <span>{card.label}</span>
                <span>VISA</span>
              </div>
              <div className="debit-card-num">
                {revealed[card.id] ? card.number : `•••• •••• •••• ${card.last4}`}
              </div>
              <div className="debit-card-bottom">
                <span>
                  EXP {card.expiry} · CVV {revealed[card.id] ? card.cvv : "•••"}
                </span>
                <span>{card.frozen ? "FROZEN" : "ACTIVE"}</span>
              </div>
            </div>

            <div className="row" style={{ flexWrap: "wrap", marginBottom: 10 }}>
              <button className="btn btn-sm" onClick={() => toggleFreeze(idx)} disabled={busyId === card.id} type="button">
                {card.frozen ? "Unfreeze card" : "Freeze card"}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setRevealed({ ...revealed, [card.id]: !revealed[card.id] })}
                type="button"
              >
                {revealed[card.id] ? "Hide number" : "Reveal number"}
              </button>
              <span className="muted" style={{ fontSize: 12 }}>
                Opened {formatDate(card.openedOn)}
              </span>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div className="field" style={{ marginBottom: 10 }}>
                <label htmlFor={`limit-${card.id}`}>Daily spending limit</label>
                <div className="row">
                  <input
                    id={`limit-${card.id}`}
                    type="number"
                    min="10"
                    max="5000"
                    value={limits[card.id] ?? ""}
                    onChange={(e) => setLimits({ ...limits, [card.id]: e.target.value })}
                    style={{ width: 120 }}
                  />
                  <button className="btn btn-sm" onClick={() => saveLimit(card)} disabled={busyId === card.id} type="button">
                    Save
                  </button>
                </div>
              </div>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={card.international}
                  onChange={() => toggleInternational(card)}
                  disabled={busyId === card.id}
                />
                <span>
                  Allow international transactions
                  <div className="muted" style={{ fontSize: 12 }}>
                    Off by default for security.
                  </div>
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title">Recent card activity</div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant</th>
              <th>Category</th>
              <th className="right-align">Amount</th>
            </tr>
          </thead>
          <tbody>
            {cardTxs.slice(0, 8).map((t) => (
              <tr key={t.id}>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(t.date)}</td>
                <td>
                  {t.description}
                  {t.pending && <span className="badge badge-warning" style={{ marginLeft: 8 }}>Pending</span>}
                </td>
                <td className="muted">{t.category}</td>
                <td className="right-align down">{`$${(-t.amount).toFixed(2)}`}</td>
              </tr>
            ))}
            {cardTxs.length === 0 && (
              <tr>
                <td colSpan={4} className="muted">
                  No recent card activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
