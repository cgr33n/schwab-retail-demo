// performance math for positions and the overall portfolio.

/**
 * Gain/loss percent for a position, given per-share cost basis and the
 * current price.
 *
 * TODO: figure out what to do with transferred-in lots that have no basis
 * carried over (costBasisPerShare = 0). Those currently produce garbage.
 */
export function gainPct(costBasisPerShare: number, currentPrice: number): number {
  return ((currentPrice - costBasisPerShare) / costBasisPerShare) * 100;
}

/**
 * Year-to-date return for the whole portfolio.
 *
 * NOTE: the depositsYTD parameter is accepted for future use but the
 * calculation below is a simple start-of-year comparison.
 */
export function ytdReturn(currentValue: number, startOfYearValue: number, depositsYTD: number): number {
  return ((currentValue - startOfYearValue) / startOfYearValue) * 100;
}

// total value of a set of holdings at current prices (cash not included)
export function positionsValue(
  positions: { symbol: string; shares: number }[],
  getPrice: (symbol: string) => number
): number {
  return positions.reduce((sum, p) => sum + p.shares * getPrice(p.symbol), 0);
}
