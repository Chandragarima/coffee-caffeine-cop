import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCaffeineProfile } from '@/hooks/useCaffeineProfile';

const SENSITIVITY_COLORS: Record<string, string> = {
  low: 'text-green-700 bg-green-50',
  moderate: 'text-amber-700 bg-amber-50',
  high: 'text-red-700 bg-red-50',
  unknown: 'text-gray-500 bg-gray-50',
};

const TIMING_ICONS: Record<string, string> = {
  'early-bird': '🌅',
  'steady-sipper': '☕',
  'afternoon-booster': '🌤️',
  unknown: '❓',
};

const CONSUMPTION_ICONS: Record<string, string> = {
  light: '🍃',
  moderate: '☕',
  heavy: '⚡',
  unknown: '❓',
};

const CaffeineProfileCard = () => {
  const { profile } = useCaffeineProfile();

  if (!profile.isUnlocked) {
    const progress = Math.min((profile.daysTracked / 7) * 100, 100);
    return (
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Your Caffeine Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <div className="text-center py-3 sm:py-4">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🔒</div>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {7 - profile.daysTracked} more day{7 - profile.daysTracked !== 1 ? 's' : ''} to unlock your profile
            </p>
            <div className="mt-2 sm:mt-3 max-w-[180px] sm:max-w-[200px] mx-auto">
              <Progress value={progress} className="h-1.5 sm:h-2" />
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5 sm:mt-2">
              {profile.daysTracked}/7 days tracked
            </p>
          </div>

          {/* Blurred preview of what unlocks */}
          <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3 select-none pointer-events-none">
            <div className="blur-[3px] opacity-50">
              <div className="space-y-1">
                <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Sensitivity</div>
                <div className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold text-green-700 bg-green-50">
                  Moderate
                </div>
              </div>
            </div>
            <div className="blur-[3px] opacity-50">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900">Early Bird</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">Morning drinker</div>
                </div>
                <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900">Moderate</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">Balanced intake</div>
                </div>
              </div>
            </div>
            <div className="blur-[3px] opacity-50">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] sm:text-xs font-semibold">
                  Streak Master
                </div>
                <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-400 text-[10px] sm:text-xs font-medium">
                  Sleep Guardian
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const earnedBadges = profile.badges.filter((b) => b.earned);
  const unearnedBadges = profile.badges.filter((b) => !b.earned);

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Your Caffeine Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5">
        {/* Sensitivity */}
        <div className="space-y-1">
          <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">Sensitivity</div>
          <div className={`inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-semibold ${SENSITIVITY_COLORS[profile.sensitivityLevel]}`}>
            {profile.sensitivityLevel === 'unknown' ? 'Unknown' : profile.sensitivityLevel.charAt(0).toUpperCase() + profile.sensitivityLevel.slice(1)}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-600">{profile.sensitivityDescription}</p>
        </div>

        {/* Timing Pattern & Consumption Level */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
            <div className="text-base sm:text-lg mb-0.5 sm:mb-1">{TIMING_ICONS[profile.timingPattern]}</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-900">
              {profile.timingPattern === 'unknown' ? 'Unknown' :
                profile.timingPattern.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{profile.timingDescription}</div>
          </div>
          <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg">
            <div className="text-base sm:text-lg mb-0.5 sm:mb-1">{CONSUMPTION_ICONS[profile.consumptionLevel]}</div>
            <div className="text-xs sm:text-sm font-semibold text-gray-900">
              {profile.consumptionLevel === 'unknown' ? 'Unknown' :
                profile.consumptionLevel.charAt(0).toUpperCase() + profile.consumptionLevel.slice(1)}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{profile.consumptionDescription}</div>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wide">
            Badges ({earnedBadges.length}/{profile.badges.length})
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800"
                title={badge.description}
              >
                <span className="text-xs sm:text-sm">{badge.icon}</span>
                <span className="text-[10px] sm:text-xs font-semibold">{badge.name}</span>
              </div>
            ))}
            {unearnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-400"
                title={badge.description}
              >
                <span className="grayscale opacity-50 text-xs sm:text-sm">{badge.icon}</span>
                <span className="text-[10px] sm:text-xs font-medium">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CaffeineProfileCard;
