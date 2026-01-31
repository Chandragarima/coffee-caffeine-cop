import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTodayCheckin, SleepCheckin } from '@/lib/sleepCheckin';
import { useCaffeineProfile } from '@/hooks/useCaffeineProfile';
import { toast } from '@/components/ui/sonner';

const QUALITY_CONFIG: Record<SleepCheckin['quality'], { icon: string; label: string; color: string; bg: string }> = {
  poor: { icon: '😞', label: 'Poor', color: 'text-red-700', bg: 'bg-red-50' },
  ok: { icon: '😐', label: 'OK', color: 'text-amber-700', bg: 'bg-amber-50' },
  great: { icon: '😊', label: 'Great', color: 'text-green-700', bg: 'bg-green-50' },
};

const SleepHistoryCard = () => {
  const { checkins, submitCheckin, getYesterdayStats } = useCaffeineProfile();
  const [showManualPrompt, setShowManualPrompt] = useState(false);

  const sortedCheckins = [...checkins]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 7);

  const hasTodayCheckin = !!getTodayCheckin();
  const { count: yesterdayCount, totalMg } = getYesterdayStats();
  const canLogToday = !hasTodayCheckin && yesterdayCount > 0;

  const handleManualCheckin = (quality: SleepCheckin['quality']) => {
    submitCheckin(quality);
    setShowManualPrompt(false);
    toast.info(`Sleep logged as ${quality}. You had ${totalMg}mg caffeine yesterday.`, { duration: 4000 });
  };

  const qualityCounts = sortedCheckins.reduce(
    (acc, c) => { acc[c.quality]++; return acc; },
    { poor: 0, ok: 0, great: 0 } as Record<SleepCheckin['quality'], number>
  );

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base">😴</span> Sleep Quality
          </CardTitle>
          {canLogToday && !showManualPrompt && (
            <button
              onClick={() => setShowManualPrompt(true)}
              className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              + Log today
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Manual check-in prompt */}
        {showManualPrompt && (
          <div className="p-3 sm:p-4 bg-indigo-50 rounded-lg border border-indigo-200 space-y-2">
            <div className="text-xs sm:text-sm font-medium text-indigo-800">How did you sleep last night?</div>
            <p className="text-xs sm:text-sm text-indigo-600">You had {totalMg}mg caffeine yesterday</p>
            <div className="flex gap-2">
              {(['poor', 'ok', 'great'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleManualCheckin(q)}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-center font-semibold transition-all ${QUALITY_CONFIG[q].bg} border-current ${QUALITY_CONFIG[q].color}`}
                >
                  <div className="text-lg">{QUALITY_CONFIG[q].icon}</div>
                  <div className="text-xs">{QUALITY_CONFIG[q].label}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowManualPrompt(false)}
              className="text-xs text-gray-400 hover:text-gray-600 w-full text-center"
            >
              Cancel
            </button>
          </div>
        )}

        {sortedCheckins.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500 text-center py-4">
            No sleep check-ins yet. Log your first coffee tomorrow morning to get prompted!
          </p>
        ) : (
          <>
            {/* Summary row */}
            <div className="flex gap-2 sm:gap-3">
              {(['great', 'ok', 'poor'] as const).map((q) => (
                <div key={q} className={`flex-1 text-center p-2 sm:p-3 rounded-lg ${QUALITY_CONFIG[q].bg}`}>
                  <div className="text-lg sm:text-xl">{QUALITY_CONFIG[q].icon}</div>
                  <div className={`text-sm sm:text-base font-bold ${QUALITY_CONFIG[q].color}`}>{qualityCounts[q]}</div>
                  <div className="text-xs sm:text-sm text-gray-500">{QUALITY_CONFIG[q].label}</div>
                </div>
              ))}
            </div>

            {/* Recent check-ins list */}
            <div className="space-y-1.5 sm:space-y-2">
              {sortedCheckins.map((c) => {
                const cfg = QUALITY_CONFIG[c.quality];
                const date = new Date(c.timestamp);
                return (
                  <div key={c.id} className="flex items-center justify-between p-2 sm:p-2.5 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <span className="text-sm sm:text-base">{cfg.icon}</span>
                      <div>
                        <div className="text-xs sm:text-sm font-medium text-gray-900">{cfg.label}</div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          {date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm text-gray-500">
                        {c.yesterdayCaffeineMg}mg caffeine
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SleepHistoryCard;
