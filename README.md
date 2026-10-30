# schwab-retail-demo

Sample retail banking & investing website for demo environments. Everything in
this repo is fictional — it is not affiliated with or endorsed by Charles
Schwab & Co.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000 and sign in with the demo account:

- username: `connor.demo`
- password: `Demo!2026`
- security code: any 6 digits

## What's in it

- Dashboard with net worth, day change, and a live-ish market snapshot
- Accounts & positions (brokerage, IRA, checking, savings, linked external bank)
- Checking & savings overview, transfer scheduling, monthly statements (printable)
- Debit cards with freeze / spending limits / international toggles
- Markets, news, a stock & fund screener, and a small learning center
- A watchlist (work in progress)

## Tests

```bash
npm test
```

vitest, unit tests on the lib helpers. Should all be green.

## Notes

- All data lives in memory and resets when the dev server restarts. There's a
  reset button on `/debug` if a session gets into a weird state.
- Market data is simulated (a random walk around seeded prices).
- Market data endpoints are intentionally unauthenticated; everything that
  touches money or personal data requires a session cookie.
