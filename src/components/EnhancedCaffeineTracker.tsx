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
      {/* Hero Status Card */}
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background via-background to-primary/5">
        <div className={`absolute inset-0 bg-gradient-to-br ${getCaffeineGradient(caffeineTracker.currentLevel, caffeineTracker.dailyLimit)}`} />
        <CardContent className="relative p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg transition-transform duration-500 ${isAnimating ? 'scale-110' : ''}`}>
                <Coffee className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Smart Tracker</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {insights.coffeePersonality.type}
                </p>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className="text-base sm:text-lg font-bold px-3 py-1 sm:px-4 sm:py-2 rounded-xl shadow-sm"
            >
              {Math.round(caffeineTracker.currentLevel)}mg
            </Badge>
          </div>

          {/* Current Level Display */}
          <div className="text-center mb-6">
            <div className={`text-4xl sm:text-5xl font-black ${getCaffeineStatusColor(caffeineTracker.currentLevel, caffeineTracker.dailyLimit)} ${isAnimating ? 'animate-pulse' : ''} mb-2`}>
              {Math.round(caffeineTracker.caffeineLevelPercentage)}%
            </div>
            <p className="text-muted-foreground text-sm">current caffeine level</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>0mg</span>
              <span>{caffeineTracker.dailyLimit}mg</span>
            </div>
            <div className="relative">
              <Progress 
                value={caffeineTracker.caffeineLevelPercentage} 
                className="h-3 sm:h-4 bg-muted/50"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-30" />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-4'} text-center`}>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-primary mr-1" />
                <span className="text-lg sm:text-xl font-bold text-primary">{insights.habitScore}</span>
              </div>
              <p className="text-xs text-muted-foreground">Habit Score</p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <div className="flex items-center justify-center mb-1">
                <Timer className="h-4 w-4 text-amber-600 mr-1" />
                <span className="text-lg sm:text-xl font-bold text-amber-600">
                  {caffeineTracker.timeToNextCoffeeFormatted}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Next Coffee</p>
            </div>
            {!isMobile && (
              <>
                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-center mb-1">
                    <Moon className="h-4 w-4 text-blue-600 mr-1" />
                    <span className="text-lg sm:text-xl font-bold text-blue-600">
                      {caffeineTracker.timeToBedtimeFormatted}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">To Bedtime</p>
                </div>
                <div className="bg-card/50 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                  <div className="flex items-center justify-center mb-1">
                    <Activity className="h-4 w-4 text-emerald-600 mr-1" />
                    <span className="text-lg sm:text-xl font-bold text-emerald-600">
                      {insights.consumptionPatterns.averageDailyCaffeine}mg
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Daily Avg</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insights Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 h-12' : 'grid-cols-4 h-14'} bg-muted/50 backdrop-blur-sm rounded-xl p-1`}>
          <TabsTrigger 
            value="insights" 
            className="rounded-lg font-medium text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {isMobile ? 'Tips' : 'Insights'}
          </TabsTrigger>
          <TabsTrigger 
            value="personality" 
            className="rounded-lg font-medium text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Coffee className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Profile
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger 
                value="energy" 
                className="rounded-lg font-medium text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Energy
              </TabsTrigger>
              <TabsTrigger 
                value="mood" 
                className="rounded-lg font-medium text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Mood
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="insights" className="space-y-4 mt-4">
          {/* Weekly Insights */}
          {insights.weeklyInsights.length > 0 && (
            <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  Weekly Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.weeklyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shadow-sm ${
                      insight.type === 'positive' ? 'bg-emerald-500' :
                      insight.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-foreground">{insight.title}</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">{insight.message}</p>
                      {insight.action && (
                        <p className="text-xs sm:text-sm text-primary mt-2 font-medium">{insight.action}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Personalized Recommendations */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-blue-600" />
                </div>
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.personalizedRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-3 w-3 text-primary" />
                    </div>
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="space-y-4 mt-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
            <CardHeader className="text-center pb-3">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <Coffee className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold">Your Coffee Profile</CardTitle>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <span className="w-2 h-2 bg-primary rounded-full"></span>
                <p className="text-base sm:text-lg font-semibold text-primary">{insights.coffeePersonality.type}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{insights.coffeePersonality.description}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-emerald-600 text-sm">✨</span>
                  </div>
                  Your Traits
                </h4>
                <div className="flex flex-wrap gap-2">
                  {insights.coffeePersonality.traits.map((trait, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1 text-xs rounded-full">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  Consumption Patterns
                </h4>
                <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'} text-sm`}>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground block text-xs">First Coffee</span>
                    <p className="font-bold text-foreground">{insights.consumptionPatterns.averageFirstCoffee}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground block text-xs">Last Coffee</span>
                    <p className="font-bold text-foreground">{insights.consumptionPatterns.averageLastCoffee}</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground block text-xs">Peak Hour</span>
                    <p className="font-bold text-foreground">{insights.consumptionPatterns.peakConsumptionHour}:00</p>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-xl">
                    <span className="text-muted-foreground block text-xs">Optimal Timing</span>
                    <p className="font-bold text-foreground">{insights.consumptionPatterns.optimalTimingPercentage}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {!isMobile && (
          <TabsContent value="energy" className="space-y-4 mt-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-amber-600" />
                  </div>
                  Energy Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                {insights.nextEnergyPeak && (
                  <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">Next Energy Peak</h4>
                        <p className="text-xs text-muted-foreground">Expected level: {insights.nextEnergyPeak.level}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{Math.round(insights.nextEnergyPeak.hoursFromNow * 60)}</p>
                        <p className="text-xs text-muted-foreground">minutes</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {insights.energyPredictions.slice(0, 3).map((prediction, index) => {
                    const time = new Date(prediction.timestamp);
                    return (
                      <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-xs font-bold text-foreground">
                              {time.getHours().toString().padStart(2, '0')}:
                              {time.getMinutes().toString().padStart(2, '0')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">{prediction.recommendation}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="px-2 py-1">{prediction.predictedLevel}%</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {!isMobile && (
          <TabsContent value="mood" className="space-y-4 mt-4">
            <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-rose-600" />
                  </div>
                  How are you feeling?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedMood ? (
                  <div className="grid grid-cols-4 gap-3">
                    {(['great', 'good', 'ok', 'bad'] as const).map((mood) => (
                      <Button
                        key={mood}
                        variant="outline"
                        className="h-20 flex-col gap-2 rounded-xl border-2 hover:shadow-md transition-all duration-200"
                        onClick={() => setSelectedMood(mood)}
                      >
                        <span className="text-2xl">{getMoodEmoji(mood)}</span>
                        <span className="text-xs capitalize font-medium">{mood}</span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mb-3">
                        <span className="text-4xl">{getMoodEmoji(selectedMood)}</span>
                      </div>
                      <p className="text-lg font-semibold capitalize">Feeling {selectedMood}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Energy Level: {energyRating}/5</label>
                        <div className="flex gap-2 justify-center">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              variant={energyRating >= rating ? "default" : "outline"}
                              size="sm"
                              className="w-10 h-10 p-0 rounded-lg"
                              onClick={() => setEnergyRating(rating)}
                            >
                              {rating}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-semibold mb-2 block">Focus Level: {focusRating}/5</label>
                        <div className="flex gap-2 justify-center">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              variant={focusRating >= rating ? "default" : "outline"}
                              size="sm"
                              className="w-10 h-10 p-0 rounded-lg"
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
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <h4 className="font-semibold mb-3 text-foreground">Your Mood Insights</h4>
                    <div className="space-y-2">
                      {moodTracking.moodInsights.map((insight, index) => (
                        <p key={index} className="text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg">{insight}</p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Mood Summary */}
            {moodTracking.todaysMoodSummary.entriesCount > 0 && (
              <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Today's Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold text-primary">{moodTracking.todaysMoodSummary.averageMood}/4</p>
                      <p className="text-xs text-muted-foreground">Mood</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold text-amber-600">{moodTracking.todaysMoodSummary.averageEnergy}/5</p>
                      <p className="text-xs text-muted-foreground">Energy</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-xl">
                      <p className="text-2xl font-bold text-blue-600">{moodTracking.todaysMoodSummary.averageFocus}/5</p>
                      <p className="text-xs text-muted-foreground">Focus</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Mobile-only combined Energy & Mood tab */}
        {isMobile && (
          <>
            <TabsContent value="energy" className="space-y-4 mt-4">
              {/* Quick mood selection for mobile */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-rose-600" />
                    </div>
                    Quick Mood Check
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!selectedMood ? (
                    <div className="grid grid-cols-4 gap-2">
                      {(['great', 'good', 'ok', 'bad'] as const).map((mood) => (
                        <Button
                          key={mood}
                          variant="outline"
                          className="h-16 flex-col gap-1 rounded-xl text-xs"
                          onClick={() => setSelectedMood(mood)}
                        >
                          <span className="text-lg">{getMoodEmoji(mood)}</span>
                          <span className="capitalize">{mood}</span>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <span className="text-3xl">{getMoodEmoji(selectedMood)}</span>
                        <p className="mt-1 font-medium capitalize text-sm">Feeling {selectedMood}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-medium">Energy: {energyRating}/5</label>
                          <div className="flex gap-1 mt-1 justify-center">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Button
                                key={rating}
                                variant={energyRating >= rating ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0 text-xs"
                                onClick={() => setEnergyRating(rating)}
                              >
                                {rating}
                              </Button>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium">Focus: {focusRating}/5</label>
                          <div className="flex gap-1 mt-1 justify-center">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Button
                                key={rating}
                                variant={focusRating >= rating ? "default" : "outline"}
                                size="sm"
                                className="w-8 h-8 p-0 text-xs"
                                onClick={() => setFocusRating(rating)}
                              >
                                {rating}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button onClick={handleMoodSubmit} className="flex-1 text-sm h-9">
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedMood(null)} className="text-sm h-9">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Energy Forecast for Mobile */}
              {insights.nextEnergyPeak && (
                <Card className="border-0 shadow-md bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-amber-600" />
                      </div>
                      Energy Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                      <div className="text-center">
                        <h4 className="font-semibold text-sm">Next Energy Peak</h4>
                        <p className="text-2xl font-bold text-primary">{Math.round(insights.nextEnergyPeak.hoursFromNow * 60)} min</p>
                        <p className="text-xs text-muted-foreground">Expected level: {insights.nextEnergyPeak.level}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
};

export default EnhancedCaffeineTracker;