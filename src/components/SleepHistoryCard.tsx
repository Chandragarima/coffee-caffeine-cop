import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSleepCheckins, SleepCheckin } from '@/lib/sleepCheckin';

const QUALITY_CONFIG: Record<SleepCheckin['quality'], { icon: string; label: string; color: string; bg: string }> = {
  poor: { icon: '😞', label: 'Poor', color: 'text-red-700', bg: 'bg-red-50' },
  ok: { icon: '😐', label: 'OK', color: 'text-amber-700', bg: 'bg-amber-50' },
  great: { icon: '😊', label: 'Great', color: 'text-green-700', bg: 'bg-green-50' },
};

const SleepHistoryCard = () => {
  const checkins = useMemo(() => {
    return getSleepCheckins()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 7);
  }, []);

  if (checkins.length === 0) {
    return null;
  }

  const qualityCounts = checkins.reduce(
    (acc, c) => { acc[c.quality]++; return acc; },
    { poor: 0, ok: 0, great: 0 } as Record<SleepCheckin['quality'], number>
  );

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
          <span className="text-sm sm:text-base">😴</span> Sleep Quality
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Summary row */}
        <div className="flex gap-2 sm:gap-3">
          {(['great', 'ok', 'poor'] as const).map((q) => (
            <div key={q} className={`flex-1 text-center p-2 sm:p-3 rounded-lg ${QUALITY_CONFIG[q].bg}`}>
              <div className="text-lg sm:text-xl">{QUALITY_CONFIG[q].icon}</div>
              <div className={`text-sm sm:text-base font-bold ${QUALITY_CONFIG[q].color}`}>{qualityCounts[q]}</div>
              <div className="text-[10px] sm:text-xs text-gray-500">{QUALITY_CONFIG[q].label}</div>
            </div>
          ))}
        </div>

        {/* Recent check-ins list */}
        <div className="space-y-1.5 sm:space-y-2">
          {checkins.map((c) => {
            const cfg = QUALITY_CONFIG[c.quality];
            const date = new Date(c.timestamp);
            return (
              <div key={c.id} className="flex items-center justify-between p-2 sm:p-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 sm:gap-2.5">
                  <span className="text-sm sm:text-base">{cfg.icon}</span>
                  <div>
                    <div className="text-xs sm:text-sm font-medium text-gray-900">{cfg.label}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">
                      {date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    {c.yesterdayCaffeineMg}mg caffeine
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-400">
                    Last at {c.yesterdayLastCoffeeHour > 12
                      ? `${c.yesterdayLastCoffeeHour - 12} PM`
                      : c.yesterdayLastCoffeeHour === 0
                        ? '12 AM'
                        : `${c.yesterdayLastCoffeeHour} AM`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepHistoryCard;
