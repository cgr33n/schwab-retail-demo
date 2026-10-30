import { describe, expect, it } from "vitest";
import { formatMoney, formatPct, money } from "./money";

describe("formatMoney", () => {
  it("formats with cents by default", () => {
    expect(formatMoney(1234.5)).toBe("$1,234.50");
  });

  it("drops cents when asked", () => {
    expect(formatMoney(1234.5, { cents: false })).toBe("$1,235");
  });

  it("handles zero", () => {
    expect(formatMoney(0)).toBe("$0.00");
  });
});

describe("money", () => {
  it("formats positive amounts", () => {
    expect(money(12.5)).toBe("$12.50");
  });

  it("formats negative amounts (a bit ugly, but that's what it does today)", () => {
    expect(money(-50.1)).toBe("$-50.10");
  });
});

describe("formatPct", () => {
  it("adds a plus sign for gains", () => {
    expect(formatPct(12.346)).toBe("+12.35%");
  });

  it("keeps the minus sign for losses", () => {
    expect(formatPct(-3.2)).toBe("-3.20%");
  });
});
