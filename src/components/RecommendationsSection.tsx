import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CoffeeItem, COFFEES, HALF_LIFE_HOURS } from "@/data/coffees";
import { CaffeineScienceExplanation } from "./CaffeineScienceExplanation";
import { bestPicksForTime } from "@/lib/recommendation";
import { caffeineRemaining } from "@/lib/caffeine";
import { TimeOfDay } from "@/hooks/useTimeOfDay";
import { EnergyLevel } from "@/lib/recommendation";
import { SizeOz, adjustedMg } from "@/lib/serving";
import { RecommendationCard } from "@/components/RecommendationCard";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface RecommendationsSectionProps {
  currentTime: TimeOfDay;
  currentEnergy: EnergyLevel;
  hoursUntilBed: number;
  bedtime: string;
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
  refreshCount,
  isRefreshing,
  onRefresh,
  onSelect,
  onLogSuccess
}: RecommendationsSectionProps) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const isMobile = useIsMobile();
  
  const best = useMemo(() => 
    bestPicksForTime(currentTime, currentEnergy, hoursUntilBed, HALF_LIFE_HOURS), 
    [currentTime, currentEnergy, hoursUntilBed, refreshCount]
  );

  // Sleep Warning Logic
  const showSleepWarning = currentTime === "late_night" && currentEnergy === "high" && hoursUntilBed < 3;
  const decaf = COFFEES.find((c) => c.id === "decaf_coffee");
  const herbal = COFFEES.find((c) => c.id === "herbal_tea");
  const coldBrew = COFFEES.find((c) => c.id === "cold_brew");
  const remainingCold = coldBrew ? Math.round(caffeineRemaining(coldBrew.caffeineMg, hoursUntilBed, HALF_LIFE_HOURS)) : undefined;

  return (
    <div className="mb-4 sm:mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-base sm:text-lg font-bold">☕</span>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Top Picks for You
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1 hidden sm:block">
                Based on Sleep Time • Caffeine amount
              </p>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="border-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0"
        >
          <svg 
            className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="hidden sm:inline ml-1 sm:ml-2">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
      </div>

      {/* Caffeine Science Explanation */}
      {showExplanation && (
        <div className="mb-6 sm:mb-8">
          <CaffeineScienceExplanation />
        </div>
      )}

      {/* Coffee Recommendations */}
      {isMobile ? (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full mb-6"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {best.map((coffee, index) => (
              <CarouselItem key={coffee.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2">
                <RecommendationCard
                  coffee={coffee}
                  onSelect={onSelect}
                  onLogSuccess={onLogSuccess}
                  currentTime={currentTime}
                  hoursUntilBed={hoursUntilBed}
                  bedtime={bedtime}
                  index={index}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 h-8 w-8 bg-white/90 shadow-lg border-2 border-amber-200 hover:bg-amber-50" />
          <CarouselNext className="right-2 h-8 w-8 bg-white/90 shadow-lg border-2 border-amber-200 hover:bg-amber-50" />
        </Carousel>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {best.map((coffee, index) => (
            <RecommendationCard
              key={coffee.id}
              coffee={coffee}
              onSelect={onSelect}
              onLogSuccess={onLogSuccess}
              currentTime={currentTime}
              hoursUntilBed={hoursUntilBed}
              bedtime={bedtime}
              index={index}
            />
          ))}
        </div>
      )}

      {/* Subtle Learn More Section - After Recommendations */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowExplanation(!showExplanation)}
          className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group px-4 py-2 h-auto flex items-center gap-2 text-sm"
          title="Learn more about our recommendations"
        >
          <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>{showExplanation ? 'Hide Details' : 'Learn More'}</span>
        </Button>
      </div>

      {/* Caffeine Science Explanation - Conditionally Rendered */}
      {showExplanation && (
        <div className="mb-6 sm:mb-8">
          <CaffeineScienceExplanation />
        </div>
      )}

      {/* Sleep Warning Section */}
      {showSleepWarning && (
        <div className="mb-6 sm:mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-red-100/20 via-orange-100/20 to-red-100/20 rounded-2xl sm:rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-2 border-red-200/50 shadow-xl">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-lg sm:text-xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-1 sm:mb-2">Sleep Alert</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  Your {bedtime} bedtime is approaching. High-caffeine drinks now could significantly impact your sleep quality.
                </p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-3 grid-cols-1 gap-3 sm:gap-6">
              {decaf && (
                <div className="group p-3 sm:p-4 rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-xs sm:text-sm">✅</span>
                    </div>
                    <h4 className="font-semibold text-green-800 text-sm sm:text-base">Safe choice</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-green-700 leading-relaxed">
                    {decaf.name} - Virtually no impact on sleep, perfect for late-night cravings.
                  </p>
                </div>
              )}
              {herbal && (
                <div className="group p-3 sm:p-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-xs sm:text-sm">🫖</span>
                    </div>
                    <h4 className="font-semibold text-blue-800 text-sm sm:text-base">Zero caffeine</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                    {herbal.name} - A calming drink to help you wind down naturally.
                  </p>
                </div>
              )}
              {coldBrew && (
                <div className="group p-3 sm:p-4 rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 text-xs sm:text-sm">🚫</span>
                    </div>
                    <h4 className="font-semibold text-red-800 text-sm sm:text-base">High risk</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
                    Cold Brew - {remainingCold !== undefined ? `~${remainingCold}mg` : "A lot"} would remain in your system at bedtime.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
