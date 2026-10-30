"use client";

// tiny inline svg sparkline, no chart library needed for these

export default function Sparkline({
  points,
  width = 140,
  height = 36,
}: {
  points: number[];
  width?: number;
  height?: number;
}) {
  if (!points || points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = width / (points.length - 1);

  const path = points
    .map((p, i) => {
      const x = (i * step).toFixed(1);
      const y = (height - ((p - min) / range) * (height - 4) - 2).toFixed(1);
      return `${x},${y}`;
    })
    .join(" ");

  const color = points[points.length - 1] >= points[0] ? "var(--green)" : "var(--red)";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <polyline points={path} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}
