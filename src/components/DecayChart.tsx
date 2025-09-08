import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { caffeineRemaining } from "@/lib/caffeine";
import { useIsMobile } from "@/hooks/use-mobile";

interface DecayChartProps {
  mg: number;
  halfLife?: number; // default 5
}

export const DecayChart = ({ mg, halfLife = 5 }: DecayChartProps) => {
  const isMobile = useIsMobile();
  const data = Array.from({ length: 13 }, (_, i) => ({
    h: i,
    remaining: caffeineRemaining(mg, i, halfLife),
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ 
          top: 5, 
          right: isMobile ? 10 : 20, 
          left: isMobile ? 5 : 5, 
          bottom: isMobile ? 15 : 20 
        }}>
          <XAxis 
            dataKey="h" 
            tick={{ fontSize: isMobile ? 10 : 12 }} 
            tickLine={false} 
            axisLine={false} 
            label={{ 
              value: "hours", 
              position: "insideBottomRight", 
              offset: isMobile ? -5 : -10,
              fontSize: isMobile ? 10 : 12
            }} 
          />
          <YAxis 
            tick={{ fontSize: isMobile ? 10 : 12 }} 
            tickLine={false} 
            axisLine={false} 
            width={isMobile ? 25 : 30} 
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: 8,
              fontSize: isMobile ? 11 : 12,
              padding: isMobile ? '6px 8px' : '8px 12px'
            }} 
            formatter={(v: any) => [`${v} mg`, "remaining"]} 
            labelFormatter={(l) => `${l}h`} 
          />
          <Line 
            type="monotone" 
            dataKey="remaining" 
            stroke="hsl(var(--primary))" 
            strokeWidth={isMobile ? 1.5 : 2} 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DecayChart;
