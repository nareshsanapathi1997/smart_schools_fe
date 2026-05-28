"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";

const chartData = [
  { year: "2021", pass: 98 },
  { year: "2022", pass: 99 },
  { year: "2023", pass: 99 },
  { year: "2024", pass: 100 },
  { year: "2025", pass: 100 },
];

export function PassRateChart() {
  return (
    <>
      <div className="h-72 min-h-[288px] w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="year" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis domain={[90, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
              }}
            />
            <Bar dataKey="pass" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(245, 72%, 55%)" />
                <stop offset="100%" stopColor="hsl(280, 85%, 58%)" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 border-t border-border/50 pt-4">
        {chartData.slice(-3).map((d) => (
          <div key={d.year} className="text-center">
            <p className="text-2xl font-bold gradient-text">
              <AnimatedCounter value={`${d.pass}%`} />
            </p>
            <p className="text-xs text-muted-foreground">{d.year}</p>
          </div>
        ))}
      </div>
    </>
  );
}
