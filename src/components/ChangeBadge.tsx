import { formatPct } from "@/lib/money";

export default function ChangeBadge({ value }: { value: number }) {
  const cls = value >= 0 ? "up" : "down";
  const arrow = value >= 0 ? "▲" : "▼";
  return (
    <span className={cls} style={{ fontWeight: 600, fontSize: 12.5 }}>
      {arrow} {formatPct(value)}
    </span>
  );
}
