import { describe, expect, it } from "vitest";
import { gainPct, ytdReturn } from "./performance";

describe("gainPct", () => {
  it("computes gains against the cost basis", () => {
    expect(gainPct(100, 150)).toBe(50);
  });

  it("computes losses against the cost basis", () => {
    expect(gainPct(200, 100)).toBe(-50);
  });

  // The two expectations below describe the behavior we WANT:
  //   - transferred-in lots with no carried-over basis should not produce a number
  //   - YTD return should not count deposits as investment gains
  // They're intentionally kept in the suite as the bar for the fix.
  it("returns null for positions with no cost basis", () => {
    expect(gainPct(0, 11565.6)).toBeNull();
  });
});

describe("ytdReturn", () => {
  it("excludes deposits from the calculated return", () => {
    // 105,950.76 current, 90,000 start of year, 5,000 of deposits
    expect(ytdReturn(105950.76, 90000, 5000)).toBeCloseTo(12.17, 2);
  });
});
