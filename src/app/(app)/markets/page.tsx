import { requireSession } from "@/lib/auth";
import securitiesJson from "@/data/securities.json";
import marketsJson from "@/data/markets.json";
import { getQuotes } from "@/lib/market";
import MarketsPanel from "@/components/MarketsPanel";
import ChangeBadge from "@/components/ChangeBadge";
import { formatMoney } from "@/lib/money";

type Sector = { sector: string; dayPct: number };

export const instant = false

export default async function MarketsPage() {
  await requireSession();

  // movers across the screener universe
  const symbols = securitiesJson.map((s) => s.symbol);
  const quotes = getQuotes(symbols);
  const ranked = [...quotes].sort((a, b) => b.changePct - a.changePct);
  const gainers = ranked.slice(0, 5);
  const losers = [...ranked].reverse().slice(0, 5);

  const sectors = marketsJson.sectors as Sector[];
  const maxAbs = Math.max(...sectors.map((s) => Math.abs(s.dayPct)), 1);

  const now = new Date();
  const weekday = now.getDay() >= 1 && now.getDay() <= 5;
  const hour = now.getHours();
  const marketOpen = weekday && hour >= 9 && hour < 16;

  return (
    <div>
      <div className="page-title spread">
        <div>
          <h1>Markets</h1>
          <p className="page-sub">
            Simulated market data for the demo.{" "}
            <span className={marketOpen ? "up" : "muted"} style={{ fontWeight: 600 }}>
              {marketOpen ? "Market open" : "Market closed"}
            </span>
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Major indices</div>
        <MarketsPanel />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Top gainers</div>
          <table className="table">
            <tbody>
              {gainers.map((q) => (
                <tr key={q.symbol}>
                  <td style={{ fontWeight: 700 }}>{q.symbol}</td>
                  <td className="muted">{q.name}</td>
                  <td className="right-align">{formatMoney(q.price)}</td>
                  <td className="right-align"><ChangeBadge value={q.changePct} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">Top losers</div>
          <table className="table">
            <tbody>
              {losers.map((q) => (
                <tr key={q.symbol}>
                  <td style={{ fontWeight: 700 }}>{q.symbol}</td>
                  <td className="muted">{q.name}</td>
                  <td className="right-align">{formatMoney(q.price)}</td>
                  <td className="right-align"><ChangeBadge value={q.changePct} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Sector performance</div>
        {sectors.map((s) => (
          <div key={s.sector} className="sector-row">
            <div className="spread">
              <span>{s.sector}</span>
              <span className={s.dayPct >= 0 ? "up" : "down"} style={{ fontWeight: 600 }}>
                {s.dayPct >= 0 ? "+" : ""}{s.dayPct.toFixed(2)}%
              </span>
            </div>
            <div className="sector-bar-track">
              <div
                className="sector-bar-fill"
                style={{
                  width: `${(Math.abs(s.dayPct) / maxAbs) * 100}%`,
                  background: s.dayPct >= 0 ? "var(--green)" : "var(--red)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
