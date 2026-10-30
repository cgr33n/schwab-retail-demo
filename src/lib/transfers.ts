// validation for incoming transfer requests. kept separate from the route so
// it can be unit tested. the actual balance mutation happens in the route.

import type { Account } from "./types";

export type TransferInput = {
  fromAccountId: string;
  toAccountId: string;
  amount: number | string;
  frequency: string;
  scheduledFor?: string;
  memo?: string;
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; error: string };

export function validateTransferRequest(
  input: any,
  accounts: Account[]
): ValidationResult {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Invalid request." };
  }

  const { fromAccountId, toAccountId, amount, frequency, scheduledFor } = input as TransferInput;

  if (!fromAccountId || !toAccountId) {
    return { ok: false, error: "Please choose both a from and to account." };
  }
  if (fromAccountId === toAccountId) {
    return { ok: false, error: "Choose two different accounts." };
  }

  const from = accounts.find((a) => a.id === fromAccountId);
  const to = accounts.find((a) => a.id === toAccountId);
  if (!from || !to) {
    return { ok: false, error: "One of those accounts could not be found." };
  }

  const amt = Number(amount);
  if (!amt || Number.isNaN(amt) || amt <= 0) {
    return { ok: false, error: "Enter a transfer amount greater than zero." };
  }
  if (amt > 250000) {
    return { ok: false, error: "Transfers over $250,000 need to be scheduled by phone." };
  }

  if (frequency !== "once" && frequency !== "weekly" && frequency !== "monthly") {
    return { ok: false, error: "Choose a transfer frequency." };
  }

  if (from.balance < amt) {
    return { ok: false, error: `Insufficient available balance in ${from.name}.` };
  }

  if (scheduledFor) {
    const d = new Date(scheduledFor);
    if (Number.isNaN(d.getTime())) {
      return { ok: false, error: "Enter a valid date." };
    }
    if (d.getTime() < Date.now()) {
      return { ok: false, error: "Scheduled date is in the past." };
    }
  }

  return { ok: true };
}
