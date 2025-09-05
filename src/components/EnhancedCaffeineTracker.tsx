import React, { useState, useEffect } from 'react';
import { useCaffeineTracker } from '@/hooks/useCaffeineTracker';
import { useInsights } from '@/hooks/useInsights';
import { useMoodTracking } from '@/hooks/useMoodTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coffee, TrendingUp, Clock, Heart, Brain, Zap, Activity, Target, Timer, Moon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface EnhancedCaffeineTrackerProps {
  className?: string;
}

const EnhancedCaffeineTracker: React.FC<EnhancedCaffeineTrackerProps> = ({ className = '' }) => {
  const caffeineTracker = useCaffeineTracker();
  const insights = useInsights();
  const moodTracking = useMoodTracking();
  const [selectedMood, setSelectedMood] = useState<'great' | 'good' | 'ok' | 'bad' | null>(null);
  const [energyRating, setEnergyRating] = useState(3);
  const [focusRating, setFocusRating] = useState(3);

  // Animation state for caffeine level changes
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevLevel, setPrevLevel] = useState(caffeineTracker.currentLevel);

  useEffect(() => {
    if (caffeineTracker.currentLevel !== prevLevel) {
      setIsAnimating(true);
      setPrevLevel(caffeineTracker.currentLevel);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [caffeineTracker.currentLevel, prevLevel]);

  const handleMoodSubmit = () => {
    if (selectedMood) {
      moodTracking.addMoodEntry(selectedMood, energyRating, focusRating);
      setSelectedMood(null);
      setEnergyRating(3);
      setFocusRating(3);
    }
  };

  const getCaffeineStatusColor = (level: number, limit: number) => {
    const percentage = (level / limit) * 100;
    if (percentage < 30) return 'text-emerald-600';
    if (percentage < 70) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getCaffeineGradient = (level: number, limit: number) => {
    const percentage = (level / limit) * 100;
    if (percentage < 30) return 'from-emerald-500/20 to-teal-500/20';
    if (percentage < 70) return 'from-amber-500/20 to-orange-500/20';
    return 'from-rose-500/20 to-red-500/20';
  };

  const getMoodEmoji = (mood: 'great' | 'good' | 'ok' | 'bad') => {
    const emojis = { great: '😄', good: '😊', ok: '😐', bad: '😔' };
    return emojis[mood];
  };

  const isMobile = useIsMobile();

  if (!insights.hasEnoughData) {
    return (
      <Card className={`${className} border-dashed border-2 bg-gradient-to-br from-primary/5 to-secondary/10`}>
        <CardContent className="p-8 text-center">
          <div className="mb-6 relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
              <Coffee className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -top-2 -right-8 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
          </div>
          <h3 className="text-xl font-bold mb-3 text-foreground">Start Your Coffee Journey</h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Log a few coffees to unlock personalized insights and smart recommendations.
          </p>
          <Badge variant="outline" className="px-4 py-2 text-sm">
            Need at least 5 coffee entries
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Main Status Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Coffee className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">Smart Tracker</h2>
                <p className="text-muted-foreground text-sm sm:text-lg">
                  {insights.coffeePersonality.type}
                </p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className="text-s sm:text-xl font-semi-bold px-2 py-1.5 sm:px-6 sm:py-3 rounded-xl bg-primary/10 text-primary border-2 border-primary/20"
            >
              {Math.round(caffeineTracker.currentLevel)}mg
            </Badge>
          </div>

          {/* Caffeine Level Display */}
          <div className="text-center mb-6 sm:mb-8">
            <div className={`text-3xl sm:text-4xl font-black mb-2 sm:mb-3 ${getCaffeineStatusColor(caffeineTracker.currentLevel, caffeineTracker.dailyLimit)} ${isAnimating ? 'animate-pulse' : ''}`}>
              {Math.round(caffeineTracker.caffeineLevelPercentage)}%
            </div>
            <p className="text-muted-foreground text-sm sm:text-lg">Current caffeine level</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
              <span>0mg</span>
              <span>{caffeineTracker.dailyLimit}mg</span>
            </div>
            <div className="relative">
              <Progress 
                value={caffeineTracker.caffeineLevelPercentage} 
                className="h-3 sm:h-4 bg-muted/50"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-40" />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/50 text-center">
              <div className="flex items-center justify-center mb-2">
                <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 mr-1 sm:mr-2" />
              </div>
              <div className="text-sm sm:text-xl font-bold text-amber-600 mb-2">
                {caffeineTracker.timeToNextCoffeeFormatted}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">For Next Coffee</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/50 text-center">
              <div className="flex items-center justify-center mb-2">
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-1 sm:mr-2" />
              </div>
              <div className="text-sm sm:text-xl font-bold text-blue-600 mb-2">
                {caffeineTracker.timeToBedtimeFormatted}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">To Bedtime</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-border/50 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 mr-1 sm:mr-2" />
              </div>
              <div className="text-sm sm:text-xl font-bold text-emerald-600 mb-2">
                {insights.consumptionPatterns.averageDailyCaffeine}mg
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Daily Average</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12 sm:h-14 bg-muted/30 backdrop-blur-sm rounded-xl p-1">
          <TabsTrigger 
            value="insights" 
            className="rounded-lg font-medium text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Insights</span>
            <span className="sm:hidden">Tips</span>
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="rounded-lg font-medium text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Coffee className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger 
            value="mood" 
            className="rounded-lg font-medium text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Mood
          </TabsTrigger>
        </TabsList>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {/* Weekly Insights */}
          {insights.weeklyInsights.length > 0 && (
            <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  </div>
                  Weekly Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {insights.weeklyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-white/70 border border-emerald-100">
                    <div className={`w-3 h-3 rounded-full mt-1.5 sm:mt-2 shadow-sm ${
                      insight.type === 'positive' ? 'bg-emerald-500' :
                      insight.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">{insight.title}</h4>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-1 sm:mb-2">{insight.message}.  
                      {/* {insight.action && ( */}
                        <span className="text-xs sm:text-sm text-emerald-700 font-medium"> {insight.action}.</span></p>
                      {/* )} */}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Smart Recommendations */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.personalizedRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-white/70 border border-blue-100">
                    {/* <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Brain className="h-3 w-3 text-blue-600" />
                    </div> */}
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
            <CardHeader className="text-center pb-3 sm:pb-4">
              {/* <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
                <Coffee className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600" />
              </div> */}
              <CardTitle className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{insights.coffeePersonality.type}</CardTitle>
              <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent my-2 sm:my-3"></div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground text-xs sm:text-base leading-relaxed">{insights.coffeePersonality.description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mt-6 mb-3 sm:mb-4 text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-600 text-sm">✨</span>
                  </div>
                  Your Traits
                </h4>
                <div className="flex flex-wrap gap-2">
                  {insights.coffeePersonality.traits.map((trait, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full bg-white/70 border border-purple-200">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mt-6 mb-3 sm:mb-4 text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  Consumption Patterns
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="p-3 sm:p-4 bg-white/70 rounded-xl border border-purple-100">
                    <span className="text-muted-foreground block text-xs mb-1">First Coffee</span>
                    <p className="font-bold text-foreground text-sm sm:text-lg">{insights.consumptionPatterns.averageFirstCoffee}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/70 rounded-xl border border-purple-100">
                    <span className="text-muted-foreground block text-xs mb-1">Last Coffee</span>
                    <p className="font-bold text-foreground text-sm sm:text-lg">{insights.consumptionPatterns.averageLastCoffee}</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/70 rounded-xl border border-purple-100">
                    <span className="text-muted-foreground block text-xs mb-1">Peak Hour</span>
                    <p className="font-bold text-foreground text-sm sm:text-lg">{insights.consumptionPatterns.peakConsumptionHour}:00</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/70 rounded-xl border border-purple-100">
                    <span className="text-muted-foreground block text-xs mb-1">Optimal Timing</span>
                    <p className="font-bold text-foreground text-sm sm:text-lg">{insights.consumptionPatterns.optimalTimingPercentage}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mood Tab */}
        <TabsContent value="mood" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card className="border-0 shadow-md bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-100 rounded-xl flex items-center justify-center">
                  <Heart className="h-4 w-4 sm:h-5 sm:w-5 text-rose-600" />
                </div>
                How are you feeling?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {!selectedMood ? (
                <div className="grid grid-cols-4 gap-3 sm:gap-4">
                  {(['great', 'good', 'ok', 'bad'] as const).map((mood) => (
                    <Button
                      key={mood}
                      variant="outline"
                      className="h-20 sm:h-24 flex-col gap-2 rounded-xl border-2 hover:shadow-md transition-all duration-200 bg-white/70 border-rose-200 hover:border-rose-300"
                      onClick={() => setSelectedMood(mood)}
                    >
                      <span className="text-2xl sm:text-3xl">{getMoodEmoji(mood)}</span>
                      <span className="text-xs sm:text-sm capitalize font-medium">{mood}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                      <span className="text-4xl sm:text-5xl">{getMoodEmoji(selectedMood)}</span>
                    </div>
                    <p className="text-lg sm:text-xl font-semibold capitalize">Feeling {selectedMood}</p>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="text-sm font-semibold mb-2 sm:mb-3 block">Energy Level: {energyRating}/5</label>
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant={energyRating >= rating ? "default" : "outline"}
                            size="sm"
                            className="w-10 h-10 sm:w-12 sm:h-12 p-0 rounded-lg"
                            onClick={() => setEnergyRating(rating)}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-semibold mb-2 sm:mb-3 block">Focus Level: {focusRating}/5</label>
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant={focusRating >= rating ? "default" : "outline"}
                            size="sm"
                            className="w-10 h-10 sm:w-12 sm:h-12 p-0 rounded-lg"
                            onClick={() => setFocusRating(rating)}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={handleMoodSubmit} className="flex-1 rounded-xl">
                      Save Mood
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedMood(null)} className="rounded-xl">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Mood Insights */}
              {moodTracking.hasData && (
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-rose-200">
                  <h4 className="font-semibold mb-3 sm:mb-4 text-foreground">Your Mood Insights</h4>
                  <div className="space-y-2 sm:space-y-3">
                    {moodTracking.moodInsights.map((insight, index) => (
                      <p key={index} className="text-xs sm:text-sm text-muted-foreground p-2 sm:p-3 bg-white/70 rounded-lg border border-rose-100">{insight}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Mood Summary */}
          {moodTracking.todaysMoodSummary.entriesCount > 0 && (
            <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-lg sm:text-xl">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="p-3 sm:p-4 bg-white/70 rounded-xl border border-amber-100">
                    <p className="text-xl sm:text-2xl font-bold text-primary">{moodTracking.todaysMoodSummary.averageMood}/4</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Mood</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/70 rounded-xl border border-amber-100">
                    <p className="text-xl sm:text-2xl font-bold text-amber-600">{moodTracking.todaysMoodSummary.averageEnergy}/5</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Energy</p>
                  </div>
                  <div className="p-3 sm:p-4 bg-white/70 rounded-xl border border-amber-100">
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{moodTracking.todaysMoodSummary.averageFocus}/5</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">Focus</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedCaffeineTracker;