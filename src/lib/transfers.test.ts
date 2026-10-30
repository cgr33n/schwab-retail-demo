import { describe, expect, it } from "vitest";
import { validateTransferRequest } from "./transfers";
import type { Account } from "./types";

const accounts: Account[] = [
  { id: "a", name: "Checking", type: "checking", number: "1111", balance: 1000, openedOn: "2020-01-01" },
  { id: "b", name: "Savings", type: "savings", number: "2222", balance: 500, openedOn: "2020-01-01" },
];

describe("validateTransferRequest", () => {
  it("accepts a valid one-time transfer", () => {
    expect(
      validateTransferRequest(
        { fromAccountId: "a", toAccountId: "b", amount: 250, frequency: "once" },
        accounts
      )
    ).toEqual({ ok: true });
  });

  it("rejects transfers between the same account", () => {
    const result = validateTransferRequest(
      { fromAccountId: "a", toAccountId: "a", amount: 10, frequency: "once" },
      accounts
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("two different accounts");
  });

  it("rejects zero and negative amounts", () => {
    expect(
      validateTransferRequest({ fromAccountId: "a", toAccountId: "b", amount: 0, frequency: "once" }, accounts).ok
    ).toBe(false);
    expect(
      validateTransferRequest({ fromAccountId: "a", toAccountId: "b", amount: -5, frequency: "once" }, accounts).ok
    ).toBe(false);
  });

  it("rejects amounts above the available balance", () => {
    const result = validateTransferRequest(
      { fromAccountId: "a", toAccountId: "b", amount: 5000, frequency: "once" },
      accounts
    );
    expect(result.ok).toBe(false);
  });

  it("rejects unknown accounts", () => {
    expect(
      validateTransferRequest({ fromAccountId: "nope", toAccountId: "b", amount: 10, frequency: "once" }, accounts).ok
    ).toBe(false);
  });

  it("rejects a bad frequency", () => {
    expect(
      validateTransferRequest({ fromAccountId: "a", toAccountId: "b", amount: 10, frequency: "whenever" }, accounts).ok
    ).toBe(false);
  });
});
