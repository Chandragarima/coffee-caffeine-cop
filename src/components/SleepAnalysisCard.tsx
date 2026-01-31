import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getSleepCheckins, SleepCheckin } from '@/lib/sleepCheckin';

interface QualityStats {
  count: number;
  avgCaffeine: number;
  avgLastCoffeeHour: number;
}

function computeStats(checkins: SleepCheckin[]): Record<SleepCheckin['quality'], QualityStats> {
  const groups: Record<SleepCheckin['quality'], SleepCheckin[]> = { great: [], ok: [], poor: [] };
  for (const c of checkins) {
    groups[c.quality].push(c);
  }

  const calc = (arr: SleepCheckin[]): QualityStats => ({
    count: arr.length,
    avgCaffeine: arr.length > 0 ? Math.round(arr.reduce((s, c) => s + c.yesterdayCaffeineMg, 0) / arr.length) : 0,
    avgLastCoffeeHour: arr.length > 0 ? Math.round(arr.reduce((s, c) => s + c.yesterdayLastCoffeeHour, 0) / arr.length) : 0,
  });

  return { great: calc(groups.great), ok: calc(groups.ok), poor: calc(groups.poor) };
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
}

const SleepAnalysisCard = () => {
  const checkins = useMemo(() => getSleepCheckins(), []);

  const stats = useMemo(() => computeStats(checkins), [checkins]);

  if (checkins.length < 3) {
    return (
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
        <CardHeader className="pb-2 sm:pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base">🔬</span> Sleep Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs sm:text-sm text-gray-600">
            Log {3 - checkins.length} more sleep check-in{3 - checkins.length > 1 ? 's' : ''} to unlock your caffeine-sleep analysis.
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Check-ins appear when you log your first coffee each morning.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Derive insight
  const insight = deriveInsight(stats);

  // Bar widths based on max caffeine across qualities
  const maxCaffeine = Math.max(stats.great.avgCaffeine, stats.ok.avgCaffeine, stats.poor.avgCaffeine, 1);

  return (
    <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center gap-1.5 sm:gap-2">
          <span className="text-sm sm:text-base">🔬</span> Sleep Analysis
        </CardTitle>
        <p className="text-xs sm:text-sm text-gray-500">
          How your caffeine habits affect sleep quality ({checkins.length} check-ins)
        </p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5">
        {/* Caffeine vs Sleep Quality bars */}
        <div className="space-y-2 sm:space-y-3">
          <div className="text-xs sm:text-sm font-medium text-gray-700">Avg caffeine on days before...</div>
          {([
            { quality: 'great' as const, label: 'Great Sleep', emoji: '😊', color: 'bg-green-400', textColor: 'text-green-700' },
            { quality: 'ok' as const, label: 'OK Sleep', emoji: '😐', color: 'bg-amber-400', textColor: 'text-amber-700' },
            { quality: 'poor' as const, label: 'Poor Sleep', emoji: '😞', color: 'bg-red-400', textColor: 'text-red-700' },
          ]).map(({ quality, label, emoji, color, textColor }) => {
            const s = stats[quality];
            if (s.count === 0) return null;
            const pct = Math.max((s.avgCaffeine / maxCaffeine) * 100, 8);
            return (
              <div key={quality} className="space-y-0.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <span>{emoji}</span>
                    <span className={`font-medium ${textColor}`}>{label}</span>
                    <span className="text-gray-400">({s.count})</span>
                  </span>
                  <span className="font-semibold text-gray-800">{s.avgCaffeine}mg</span>
                </div>
                <div className="h-2.5 sm:h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Timing analysis */}
        <div className="space-y-2 sm:space-y-3">
          <div className="text-xs sm:text-sm font-medium text-gray-700">Avg last coffee time on days before...</div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {([
              { quality: 'great' as const, emoji: '😊', bg: 'bg-green-50', border: 'border-green-200', textColor: 'text-green-700' },
              { quality: 'ok' as const, emoji: '😐', bg: 'bg-amber-50', border: 'border-amber-200', textColor: 'text-amber-700' },
              { quality: 'poor' as const, emoji: '😞', bg: 'bg-red-50', border: 'border-red-200', textColor: 'text-red-700' },
            ]).map(({ quality, emoji, bg, border, textColor }) => {
              const s = stats[quality];
              if (s.count === 0) return <div key={quality} />;
              return (
                <div key={quality} className={`text-center p-2 sm:p-3 rounded-lg ${bg} border ${border}`}>
                  <div className="text-sm sm:text-base">{emoji}</div>
                  <div className={`text-sm sm:text-base font-bold ${textColor}`}>
                    {formatHour(s.avgLastCoffeeHour)}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">last coffee</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Personalized Insight */}
        {insight && (
          <div className="p-3 sm:p-4 bg-white/70 rounded-lg border border-indigo-100">
            <div className="text-xs sm:text-sm font-medium text-indigo-800 mb-1">{insight.icon} {insight.title}</div>
            <div className="text-xs sm:text-sm text-gray-600">{insight.body}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

function deriveInsight(stats: Record<SleepCheckin['quality'], QualityStats>): { icon: string; title: string; body: string } | null {
  const { great, ok, poor } = stats;

  // Timing insight
  if (great.count > 0 && poor.count > 0) {
    const timeDiff = poor.avgLastCoffeeHour - great.avgLastCoffeeHour;
    const caffeineDiff = poor.avgCaffeine - great.avgCaffeine;

    if (timeDiff >= 2) {
      return {
        icon: '⏰',
        title: 'Timing matters for you',
        body: `On poor sleep days, your last coffee was around ${formatHour(poor.avgLastCoffeeHour)} — about ${Math.round(timeDiff)} hours later than on great sleep days (${formatHour(great.avgLastCoffeeHour)}). Try cutting off earlier.`,
      };
    }

    if (caffeineDiff > 100) {
      return {
        icon: '📊',
        title: 'Amount matters for you',
        body: `Poor sleep days averaged ${poor.avgCaffeine}mg — that's ${caffeineDiff}mg more than great sleep days (${great.avgCaffeine}mg). Consider keeping total intake under ${great.avgCaffeine + 50}mg.`,
      };
    }
  }

  if (great.count >= 3 && poor.count === 0) {
    return {
      icon: '🌟',
      title: 'Your habits are working',
      body: `You've had ${great.count} great sleep nights with an average of ${great.avgCaffeine}mg caffeine and last coffee around ${formatHour(great.avgLastCoffeeHour)}. Keep it up!`,
    };
  }

  if (poor.count >= 3 && great.count === 0) {
    return {
      icon: '💡',
      title: 'Room for improvement',
      body: `Your average intake is ${poor.avgCaffeine}mg with last coffee around ${formatHour(poor.avgLastCoffeeHour)}. Try reducing intake or stopping earlier to see if sleep improves.`,
    };
  }

  return null;
}

export default SleepAnalysisCard;
