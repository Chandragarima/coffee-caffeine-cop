import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CoffeeItem, COFFEES, HALF_LIFE_HOURS } from "@/data/coffees";
import { TimeOfDay } from "@/hooks/useTimeOfDay";
import { EnergyLevel, bestPicksForTime } from "@/lib/recommendation";
import { SizeOz, adjustedMg } from "@/lib/serving";
import { caffeineRemaining } from "@/lib/caffeine";
import { RecommendationCard } from "@/components/RecommendationCard";

interface RecommendationsSectionProps {
  currentTime: TimeOfDay;
  currentEnergy: EnergyLevel;
  hoursUntilBed: number;
  bedtime: string;
  sizeOz: SizeOz;
  shots: 1 | 2;
  refreshCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onSelect: (coffee: CoffeeItem) => void;
  onLogSuccess: () => void;
}

export const RecommendationsSection = ({
  currentTime,
  currentEnergy,
  hoursUntilBed,
  bedtime,
  sizeOz,
  shots,
  refreshCount,
  isRefreshing,
  onRefresh,
  onSelect,
  onLogSuccess
}: RecommendationsSectionProps) => {
  const best = useMemo(() => 
    bestPicksForTime(currentTime, currentEnergy, hoursUntilBed, HALF_LIFE_HOURS, sizeOz, shots), 
    [currentTime, currentEnergy, hoursUntilBed, sizeOz, shots, refreshCount]
  );

  // Sleep Warning Logic
  const showSleepWarning = currentTime === "late_night" && currentEnergy === "high" && hoursUntilBed < 3;
  const decaf = COFFEES.find((c) => c.id === "decaf_coffee");
  const herbal = COFFEES.find((c) => c.id === "herbal_tea");
  const coldBrew = COFFEES.find((c) => c.id === "cold_brew");
  const remainingCold = coldBrew ? Math.round(caffeineRemaining(adjustedMg(coldBrew, sizeOz, shots), hoursUntilBed, HALF_LIFE_HOURS)) : undefined;

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">☕</span>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Top Picks for You
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Based on preferences • Time of the day • Caffeine amount
              </p>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="lg"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="border-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md"
        >
          <svg 
            className={`w-5 h-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isRefreshing ? 'Refreshing...' : 'Get new picks'}
        </Button>
      </div>

      {/* Sleep Warning Section */}
      {showSleepWarning && (
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 via-orange-100/20 to-red-100/20 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-2 border-red-200/50 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-xl mb-2">Sleep Alert</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your {bedtime} bedtime is approaching. High-caffeine drinks now could significantly impact your sleep quality.
                </p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-3 grid-cols-1 gap-6">
              {decaf && (
                <div className="group p-4 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">✅</span>
                    </div>
                    <h4 className="font-semibold text-green-800">Safe choice</h4>
                  </div>
                  <p className="text-sm text-green-700 leading-relaxed">
                    {decaf.name} - Virtually no impact on sleep, perfect for late-night cravings.
                  </p>
                </div>
              )}
              {herbal && (
                <div className="group p-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">🫖</span>
                    </div>
                    <h4 className="font-semibold text-blue-800">Zero caffeine</h4>
                  </div>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    {herbal.name} - A calming drink to help you wind down naturally.
                  </p>
                </div>
              )}
              {coldBrew && (
                <div className="group p-4 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 text-sm">🚫</span>
                    </div>
                    <h4 className="font-semibold text-red-800">High risk</h4>
                  </div>
                  <p className="text-sm text-red-700 leading-relaxed">
                    Cold Brew - {remainingCold !== undefined ? `~${remainingCold}mg` : "A lot"} would remain in your system at bedtime.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommendation Cards */}
      <div className="grid sm:grid-cols-3 grid-cols-1 gap-8">
        {best.map((coffee, index) => (
          <RecommendationCard
            key={coffee.id}
            coffee={coffee}
            sizeOz={sizeOz}
            shots={shots}
            hoursUntilBed={hoursUntilBed}
            bedtime={bedtime}
            currentTime={currentTime}
            index={index}
            onSelect={onSelect}
            onLogSuccess={onLogSuccess}
          />
        ))}
      </div>
    </div>
  );
};
