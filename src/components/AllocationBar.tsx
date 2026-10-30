import { formatMoney } from "@/lib/money";

const COLORS = ["#0d6db7", "#04244d", "#1e7b34", "#9a6b00", "#8d6bd4", "#b93a2e", "#5b6b7d"];

export default function AllocationBar({
  segments,
}: {
  segments: { label: string; value: number }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <div>
      <div className="alloc-bar">
        {segments.map((s, i) => (
          <div
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, background: COLORS[i % COLORS.length] }}
            title={`${s.label}: ${formatMoney(s.value)}`}
          />
        ))}
      </div>
      <div className="alloc-legend">
        {segments.map((s, i) => (
          <span key={s.label}>
            <span className="alloc-dot" style={{ background: COLORS[i % COLORS.length] }} />
            {s.label} · {formatMoney(s.value)}
          </span>
        ))}
      </div>
    </div>
  );
}
