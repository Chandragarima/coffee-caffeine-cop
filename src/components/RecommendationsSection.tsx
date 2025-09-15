import { useState, useMemo, useRef, useEffect } from "react";
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
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const best = useMemo(() => 
    bestPicksForTime(currentTime, currentEnergy, hoursUntilBed, HALF_LIFE_HOURS, 12, 1, 12), 
    [currentTime, currentEnergy, hoursUntilBed, refreshCount]
  );

  // Carousel navigation functions
  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const isMobile = window.innerWidth < 640; // sm breakpoint
      const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024; // lg breakpoint
      
      let cardWidth;
      if (isMobile) {
        cardWidth = container.offsetWidth; // Full width on mobile
      } else if (isTablet) {
        cardWidth = 320; // w-80 = 20rem = 320px
      } else {
        cardWidth = 384; // w-96 = 24rem = 384px
      }
      
      container.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const nextSlide = () => {
    const nextIndex = (currentIndex + 1) % best.length;
    scrollToIndex(nextIndex);
  };

  const prevSlide = () => {
    const prevIndex = currentIndex === 0 ? best.length - 1 : currentIndex - 1;
    scrollToIndex(prevIndex);
  };

  // Auto-scroll detection
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const isMobile = window.innerWidth < 640; // sm breakpoint
      const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024; // lg breakpoint
      
      let cardWidth;
      if (isMobile) {
        cardWidth = container.offsetWidth; // Full width on mobile
      } else if (isTablet) {
        cardWidth = 320; // w-80 = 20rem = 320px
      } else {
        cardWidth = 384; // w-96 = 24rem = 384px
      }
      
      const scrollLeft = container.scrollLeft;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(newIndex);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [best.length]);

  // Sleep Warning Logic
  const showSleepWarning = currentTime === "late_night" && currentEnergy === "high" && hoursUntilBed < 3;
  const decaf = COFFEES.find((c) => c.id === "decaf_coffee");
  const herbal = COFFEES.find((c) => c.id === "herbal_tea");
  const coldBrew = COFFEES.find((c) => c.id === "cold_brew");
  const remainingCold = coldBrew ? Math.round(caffeineRemaining(coldBrew.caffeineMg, hoursUntilBed, HALF_LIFE_HOURS)) : undefined;

  return (
    <div className="mb-4 sm:mb-8">
      {/* Divider for cleaner mobile tab layout */}
      <div className="border-t border-amber-100 pt-4 sm:pt-8 mb-4 sm:mb-6 sm:hidden"></div>
      {/* Section Header */}
      <div className="flex items-start justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
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
        
        {/* Action Buttons - Responsive */}
        <div className="flex items-start gap-2 pt-0">
          {/* Learn More Button - Same size as coffee cup icon */}
          <Button
            variant="outline"
            onClick={() => setShowExplanation(!showExplanation)}
            className="bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-600 hover:text-blue-700 transition-all duration-200 group w-8 h-8 sm:w-10 sm:h-10 p-0 flex items-center justify-center rounded-xl shadow-sm hover:shadow-md"
            title="Learn more about our recommendations"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </Button>

          {/* Refresh Button - Desktop Only */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden sm:flex border-2 border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 disabled:opacity-50 shadow-sm hover:shadow-md text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0"
          >
            <svg 
              className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="ml-1 sm:ml-2">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {/* Caffeine Science Explanation */}
      {showExplanation && (
        <div className="mb-6 sm:mb-8">
          <CaffeineScienceExplanation />
        </div>
      )}

      {/* Coffee Recommendations - Carousel for All Screen Sizes */}
      <div className="mb-6 sm:mb-8">
        {/* Carousel View - All Screen Sizes */}
        <div>
          {/* Carousel Container */}
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {best.map((coffee, index) => (
                <div 
                  key={coffee.id} 
                  className="flex-shrink-0 w-full sm:w-80 lg:w-96 snap-center"
                >
                  <RecommendationCard
                    coffee={coffee}
                    onSelect={onSelect}
                    onLogSuccess={onLogSuccess}
                    currentTime={currentTime}
                    hoursUntilBed={hoursUntilBed}
                    bedtime={bedtime}
                    index={index}
                  />
                </div>
              ))}
            </div>

            {/* Modern Navigation - Compact Design for 12 Items */}
            <div className="flex items-center justify-between mt-4">
              {/* Left Arrow */}
              <button
                onClick={prevSlide}
                className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm border border-amber-200 rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-5 h-5 text-amber-600" />
              </button>

              {/* Compact Dot Indicators - Show only 5 dots max */}
              <div className="flex items-center gap-1">
                {best.length <= 5 ? (
                  // Show all dots if 5 or fewer
                  best.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        index === currentIndex 
                          ? 'bg-amber-500 w-6' 
                          : 'bg-amber-200 hover:bg-amber-300'
                      }`}
                    />
                  ))
                ) : (
                  // Show compact dots for more items
                  <>
                    {currentIndex > 0 && (
                      <div className="w-1 h-1 bg-amber-300 rounded-full" />
                    )}
                    <div className="w-3 h-2 bg-amber-500 rounded-full" />
                    {currentIndex < best.length - 1 && (
                      <div className="w-1 h-1 bg-amber-300 rounded-full" />
                    )}
                  </>
                )}
              </div>

              {/* Right Arrow */}
              <button
                onClick={nextSlide}
                className="flex items-center justify-center w-10 h-10 bg-white/90 backdrop-blur-sm border border-amber-200 rounded-full shadow-lg hover:shadow-xl hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentIndex === best.length - 1}
              >
                <ChevronRight className="w-5 h-5 text-amber-600" />
              </button>
            </div>

            {/* Progress Indicator with Total Count */}
            <div className="mt-3">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>{currentIndex + 1}</span>
                <span>/</span>
                <span>{best.length}</span>
                {/* <span className="text-gray-400 ml-1">recommendations</span> */}
              </div>
            </div>
          </div>
        </div>
      </div>



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
