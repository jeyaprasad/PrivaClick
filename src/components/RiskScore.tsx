import { RadialBar, RadialBarChart, PolarAngleAxis, ResponsiveContainer } from "recharts";

export function RiskScoreChart({ score }: { score: number }) {
  const level = score < 30 ? "Low" : score < 65 ? "Medium" : "High";

  return (
    <div className="relative h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="76%"
          outerRadius="100%"
          data={[{ name: "risk", value: score, fill: "url(#riskGradient)" }]}
          startAngle={220}
          endAngle={-40}
        >
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand)" />
              <stop offset="100%" stopColor="var(--brand-pink)" />
            </linearGradient>
          </defs>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background={{ fill: "var(--color-muted)" }} dataKey="value" cornerRadius={12} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold">{score}</span>
        <span className="text-xs text-muted-foreground">{level} risk</span>
      </div>
    </div>
  );
}