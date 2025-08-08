import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { caffeineRemaining } from "@/lib/caffeine";

interface DecayChartProps {
  mg: number;
  halfLife?: number; // default 5
}

export const DecayChart = ({ mg, halfLife = 5 }: DecayChartProps) => {
  const data = Array.from({ length: 13 }, (_, i) => ({
    h: i,
    remaining: caffeineRemaining(mg, i, halfLife),
  }));

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="h" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} label={{ value: "hours", position: "insideRight", offset: 0 }} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={30} />
          <Tooltip contentStyle={{ borderRadius: 8 }} formatter={(v: any) => [`${v} mg`, "remaining"]} labelFormatter={(l) => `${l}h`} />
          <Line type="monotone" dataKey="remaining" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DecayChart;
