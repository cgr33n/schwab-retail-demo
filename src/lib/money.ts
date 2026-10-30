// money formatting helpers.
// TODO: consolidate everything on formatMoney, there are still a few places
// calling the quick-and-dirty money() helper below.

export function formatMoney(amount: number, opts: { cents?: boolean } = {}): string {
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.cents === false ? 0 : 2,
    maximumFractionDigits: opts.cents === false ? 0 : 2,
  });
  return fmt.format(amount);
}

// quick and dirty, used in a handful of spots (should probably just use formatMoney everywhere)
export function money(n: number): string {
  return "$" + n.toFixed(2);
}

export function formatPct(p: number): string {
  const sign = p > 0 ? "+" : "";
  return sign + p.toFixed(2) + "%";
}
