import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCoffeeLogsForLastDays, CoffeeLogEntry } from '@/lib/coffeeLog';
import { usePreferences } from '@/hooks/usePreferences';

interface DayData {
  day: string;
  date: string;
  caffeine: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildWeekData(logs: CoffeeLogEntry[]): DayData[] {
  const now = new Date();
  const result: DayData[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextDay = new Date(d);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayLogs = logs.filter(
      (l) => l.consumedAt >= d.getTime() && l.consumedAt < nextDay.getTime()
    );
    const caffeine = dayLogs.reduce((sum, l) => sum + l.caffeineMg, 0);

    result.push({
      day: i === 0 ? 'Today' : DAYS[d.getDay()],
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      caffeine,
    });
  }

  return result;
}

const WeeklyCaffeineChart = () => {
  const [data, setData] = useState<DayData[]>([]);
  const { caffeineLimit } = usePreferences();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const logs = await getCoffeeLogsForLastDays(7);
      if (!cancelled) {
        setData(buildWeekData(logs));
      }
    };

    load();

    // Refresh when a coffee is logged
    const handler = () => load();
    window.addEventListener('coffeeLogged', handler);
    window.addEventListener('coffeeDeleted', handler);

    return () => {
      cancelled = true;
      window.removeEventListener('coffeeLogged', handler);
      window.removeEventListener('coffeeDeleted', handler);
    };
  }, []);

  const maxCaffeine = Math.max(...data.map((d) => d.caffeine), caffeineLimit);

  return (
    <Card>
      <CardHeader className="pb-1 sm:pb-2">
        <CardTitle className="text-base sm:text-lg">Weekly Trends</CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">Daily caffeine intake over the last 7 days</p>
      </CardHeader>
      <CardContent className="px-2 sm:px-4">
        <div className="h-44 sm:h-52 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                domain={[0, Math.ceil(maxCaffeine / 100) * 100]}
                tickFormatter={(v: number) => `${v}`}
                width={30}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as DayData;
                  return (
                    <div className="bg-white border rounded-lg shadow-lg p-1.5 sm:p-2 text-xs sm:text-sm">
                      <div className="font-medium text-gray-900">{d.day} ({d.date})</div>
                      <div className="text-amber-700 font-semibold">{d.caffeine}mg</div>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={caffeineLimit}
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `${caffeineLimit}mg`,
                  position: 'right',
                  fontSize: 11,
                  fill: '#ef4444',
                }}
              />
              <Bar
                dataKey="caffeine"
                fill="#f59e0b"
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyCaffeineChart;
