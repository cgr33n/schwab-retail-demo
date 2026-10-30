// ---------------------------------------------------------------
// Transfers API - handles moving money between the demo accounts.
// External (linked) accounts are one-way sinks for our purposes.
// ---------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAccount, getStore, nextId } from "@/lib/db";
import { validateTransferRequest } from "@/lib/transfers";
import type { Transfer } from "@/lib/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({ transfers: getStore().transfers });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const store = getStore();
  const body = await req.json().catch(() => null);

  const validation = validateTransferRequest(body, store.accounts);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { fromAccountId, toAccountId, amount, frequency, scheduledFor, memo } =
    body as {
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      frequency: Transfer["frequency"];
      scheduledFor?: string;
      memo?: string;
    };

  const from = getAccount(fromAccountId);
  const to = getAccount(toAccountId);
  if (!from || !to) {
    return NextResponse.json({ error: "Account not found." }, { status: 400 });
  }

  const amt = Number(amount);
  console.log(`[transfers] ${from.id} -> ${to.id} $${amt} (${frequency})`); // TODO take out before the demo

  // small artificial delay so the demo feels like it's hitting a real ACH
  // processor instead of an in-memory object
  await new Promise((resolve) => setTimeout(resolve, 150));

  const isFuture = Boolean(scheduledFor);

  if (!isFuture) {
    from.balance -= amt;
    if (to.type !== "external") {
      to.balance += amt;
    }
  }

  const transfer: Transfer = {
    id: nextId("tr"),
    fromAccountId,
    toAccountId,
    amount: amt,
    frequency,
    scheduledFor: isFuture ? scheduledFor : undefined,
    memo: memo || undefined,
    status: isFuture ? "scheduled" : "completed",
    createdAt: new Date().toISOString(),
  };
  store.transfers.unshift(transfer);

  // book matching transactions on both accounts
  if (!isFuture) {
    store.transactions.unshift({
      id: nextId("tx"),
      accountId: fromAccountId,
      date: new Date().toISOString(),
      description: `Transfer to ${to.name}`,
      amount: -amt,
      category: "Transfer",
    });
    if (to.type !== "external") {
      store.transactions.unshift({
        id: nextId("tx"),
        accountId: toAccountId,
        date: new Date().toISOString(),
        description: `Transfer from ${from.name}`,
        amount: amt,
        category: "Transfer",
      });
    }
  }

  return NextResponse.json({ transfer });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing transfer id." }, { status: 400 });
  }

  const store = getStore();
  const transfer = store.transfers.find((t) => t.id === id);
  if (!transfer) {
    return NextResponse.json({ error: "Transfer not found." }, { status: 404 });
  }
  if (transfer.status !== "scheduled") {
    return NextResponse.json(
      { error: "Only scheduled transfers can be cancelled." },
      { status: 400 }
    );
  }

  transfer.status = "cancelled";
  return NextResponse.json({ ok: true });
}
