import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CaffeineScienceExplanationProps {
  className?: string;
}

export const CaffeineScienceExplanation = ({ className = "" }: CaffeineScienceExplanationProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-sm ${className}`}>
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-2 sm:pt-3">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs sm:text-sm">🧪</span>
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-sm sm:text-lg text-blue-900 font-semibold leading-tight">
                How We Recommend
              </CardTitle>
              <p className="text-blue-700 text-xs leading-tight mt-0.5 hidden sm:block">
                Based on caffeine content and nutritionist-backed sleep tips
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 text-xs px-2 sm:px-3 py-1 sm:py-2 h-auto flex-shrink-0 whitespace-nowrap"
          >
            {isExpanded ? "Hide" : "Learn More"}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-3 sm:space-y-6 pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
          {/* The 8-Hour Rule */}
          <div className="bg-white/70 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-xs sm:text-sm">⏰</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">The 8-Hour Rule</h4>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                  <span className="sm:hidden">No caffeine 8+ hours before bedtime</span>
                  <span className="hidden sm:inline">Nutritionists recommend avoiding caffeine consumption <strong>8+ hours before bedtime</strong> to ensure optimal sleep quality.</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs">
                  <div className="bg-red-50 p-2 sm:p-3 rounded-lg border border-red-200">
                    <div className="font-medium text-red-800 mb-1 text-xs">Morning</div>
                    <div className="text-red-700 text-xs">
                      <span className="sm:hidden">Unlimited caffeine</span>
                      <span className="hidden sm:inline">Unlimited caffeine • Peak energy window</span>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-2 sm:p-3 rounded-lg border border-yellow-200">
                    <div className="font-medium text-yellow-800 mb-1 text-xs">Afternoon</div>
                    <div className="text-yellow-700 text-xs">
                      <span className="sm:hidden">Moderate caffeine</span>
                      <span className="hidden sm:inline">Moderate caffeine • Last coffee by 3PM</span>
                    </div>
                  </div>
                  <div className="bg-green-50 p-2 sm:p-3 rounded-lg border border-green-200">
                    <div className="font-medium text-green-800 mb-1 text-xs">Evening</div>
                    <div className="text-green-700 text-xs">
                      <span className="sm:hidden">Light options only</span>
                      <span className="hidden sm:inline">Light options only • Protect sleep</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The 50mg Threshold */}
          <div className="bg-white/70 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-green-100">
            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 text-xs sm:text-sm">😴</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">Sleep Threshold</h4>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3">
                  {/* <span className="sm:hidden">&lt;50mg at bedtime = good sleep</span> */}
                  <span className="hidden sm:inline">Research shows that <strong>less than 50mg of caffeine at bedtime</strong> ensures good sleep quality and minimal sleep disruption.</span>
                </p>
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs px-2 py-1">
                      &lt; 50mg
                    </Badge>
                    <span className="text-xs sm:text-sm text-gray-700">
                      <span className="sm:hidden">Good sleep</span>
                      <span className="hidden sm:inline">Good sleep quality</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs px-2 py-1">
                      50-100mg
                    </Badge>
                    <span className="text-xs sm:text-sm text-gray-700">
                      <span className="sm:hidden">Some tossing and turning</span>
                      <span className="hidden sm:inline">May delay sleep 1-2 hours</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 text-xs px-2 py-1">
                      &gt; 100mg
                    </Badge>
                    <span className="text-xs sm:text-sm text-gray-700">
                      <span className="sm:hidden">Awake past bedtime</span>
                      <span className="hidden sm:inline">Significant sleep disruption</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Caffeine Metabolism */}
          <div className="hidden sm:block bg-white/70 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-purple-100">
            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-xs sm:text-sm">🔄</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">How Caffeine Works in Your Body</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-xs">
                  <div className="bg-purple-50 p-2 sm:p-3 rounded-lg border border-purple-200">
                    <div className="font-medium text-purple-800 mb-1 text-xs">⚡ Peak Effect</div>
                    <div className="text-purple-700 text-xs">
                      <span className="sm:hidden">30-60 min</span>
                      <span className="hidden sm:inline">30-60 minutes after consumption</span>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-2 sm:p-3 rounded-lg border border-purple-200">
                    <div className="font-medium text-purple-800 mb-1 text-xs">🔄 Half-Life</div>
                    <div className="text-purple-700 text-xs">
                      <span className="sm:hidden">5 hours</span>
                      <span className="hidden sm:inline">50% processed every 5 hours</span>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-2 sm:p-3 rounded-lg border border-purple-200">
                    <div className="font-medium text-purple-800 mb-1 text-xs">📊 Clearance</div>
                    <div className="text-purple-700 text-xs">
                      <span className="sm:hidden">8hrs</span>
                      <span className="hidden sm:inline">8 hours to reach &lt;50mg</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How We Calculate */}
          <div className="bg-white/70 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-amber-100">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-amber-600 text-xs sm:text-sm">🧮</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 sm:mb-2">Recommendation Logic </h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 font-medium">1.</span>
                    <span>
                      <span className="sm:hidden"> Check current time</span>
                      <span className="hidden sm:inline">We check the current time</span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 font-medium">2.</span>
                    <span>
                      <span className="sm:hidden">Check caffeine allowance</span>
                      <span className="hidden sm:inline">We check how much caffeine allowance you have for the day</span>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-600 font-medium">3.</span>
                    <span>
                      <span className="sm:hidden">Recommend drinks with &lt;50mg caffeine within 8 hours of bedtime</span>
                      <span className="hidden sm:inline">We only recommend drinks that will leave &lt;50mg at bedtime</span>
                    </span>
                  </div>
                  {/* <div className="flex items-start gap-2">
                    <span className="text-amber-600 font-medium">4.</span>
                    <span>
                      <span className="sm:hidden">Consider time of day</span>
                      <span className="hidden sm:inline">We consider your energy preferences and time of day</span>
                    </span> */}
                  {/* </div> */}
                </div>
              </div>
            </div>
          </div>

          {/* Caffeine Calculation Logic */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Caffeine Calculation</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="sm:hidden">Based on average caffeine amounts found in the most common sizes served at Starbucks, Dunkin', and other major U.S. coffee shops.</span>
              <span className="hidden sm:inline">We base our caffeine amounts on the average levels found in the most common sizes served at Starbucks, Dunkin', and other major U.S. coffee shops.</span>
            </p>
          </div>

          {/* Scientific Basis */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Scientific Basis</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <span className="sm:hidden">Based on sleep medicine research and nutritionist guidelines</span>
              <span className="hidden sm:inline">These recommendations are based on peer-reviewed research from sleep medicine journals, nutrition guidelines from the American Academy of Sleep Medicine, and clinical studies on caffeine's effects on sleep architecture and quality.</span>
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
