import React, { useState, useEffect } from 'react';
import { useCaffeineTracker } from '@/hooks/useCaffeineTracker';
import { useInsights } from '@/hooks/useInsights';
import { useMoodTracking } from '@/hooks/useMoodTracking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Coffee, TrendingUp, Clock, Heart, Brain, Zap } from 'lucide-react';

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
    if (percentage < 30) return 'text-green-600';
    if (percentage < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMoodEmoji = (mood: 'great' | 'good' | 'ok' | 'bad') => {
    const emojis = { great: '😄', good: '😊', ok: '😐', bad: '😔' };
    return emojis[mood];
  };

  if (!insights.hasEnoughData) {
    return (
      <Card className={`${className} border-dashed`}>
        <CardContent className="pt-6 text-center">
          <Coffee className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Start Your Coffee Journey</h3>
          <p className="text-muted-foreground mb-4">
            Log a few coffees to unlock personalized insights and smart recommendations.
          </p>
          <p className="text-sm text-muted-foreground">
            Need at least 5 coffee entries to generate insights.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Status Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className={`transition-transform duration-500 ${isAnimating ? 'scale-110' : ''}`}>
                  <Coffee className="h-5 w-5 text-primary" />
                </div>
                Caffeine Status
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {insights.coffeePersonality.type} • {insights.consumptionPatterns.averageDailyCaffeine}mg daily avg
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {Math.round(caffeineTracker.currentLevel)}mg
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative space-y-4">
          {/* Caffeine Level Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Level</span>
              <span className={getCaffeineStatusColor(caffeineTracker.currentLevel, caffeineTracker.dailyLimit)}>
                {Math.round(caffeineTracker.caffeineLevelPercentage)}%
              </span>
            </div>
            <Progress 
              value={caffeineTracker.caffeineLevelPercentage} 
              className="h-3"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{insights.habitScore}</p>
              <p className="text-xs text-muted-foreground">Habit Score</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-secondary">
                {caffeineTracker.timeToNextCoffeeFormatted}
              </p>
              <p className="text-xs text-muted-foreground">Next Coffee</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-accent">
                {caffeineTracker.timeToBedtimeFormatted}
              </p>
              <p className="text-xs text-muted-foreground">Until Bedtime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="personality">Profile</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="mood">Mood</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {/* Weekly Insights */}
          {insights.weeklyInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Weekly Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.weeklyInsights.map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      insight.type === 'positive' ? 'bg-green-500' :
                      insight.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
                      {insight.action && (
                        <p className="text-sm text-primary mt-2 font-medium">{insight.action}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Personalized Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.personalizedRecommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                    <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Coffee Personality</CardTitle>
              <p className="text-lg font-medium text-primary">{insights.coffeePersonality.type}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{insights.coffeePersonality.description}</p>
              
              <div>
                <h4 className="font-medium mb-2">Your Traits</h4>
                <div className="flex flex-wrap gap-2">
                  {insights.coffeePersonality.traits.map((trait, index) => (
                    <Badge key={index} variant="secondary">{trait}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Consumption Patterns</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">First Coffee:</span>
                    <p className="font-medium">{insights.consumptionPatterns.averageFirstCoffee}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last Coffee:</span>
                    <p className="font-medium">{insights.consumptionPatterns.averageLastCoffee}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peak Hour:</span>
                    <p className="font-medium">{insights.consumptionPatterns.peakConsumptionHour}:00</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Optimal Timing:</span>
                    <p className="font-medium">{insights.consumptionPatterns.optimalTimingPercentage}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="energy" className="space-y-4">
          {/* Energy Predictions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Energy Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights.nextEnergyPeak && (
                <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10">
                  <h4 className="font-medium">Next Energy Peak</h4>
                  <p className="text-2xl font-bold text-primary">{Math.round(insights.nextEnergyPeak.hoursFromNow * 60)} min</p>
                  <p className="text-sm text-muted-foreground">
                    Expected level: {insights.nextEnergyPeak.level}%
                  </p>
                </div>
              )}
              
              <div className="space-y-3">
                {insights.energyPredictions.slice(0, 3).map((prediction, index) => {
                  const time = new Date(prediction.timestamp);
                  return (
                    <div key={index} className="flex justify-between items-center p-2 rounded border">
                      <div>
                        <p className="font-medium">
                          {time.getHours().toString().padStart(2, '0')}:
                          {time.getMinutes().toString().padStart(2, '0')}
                        </p>
                        <p className="text-sm text-muted-foreground">{prediction.recommendation}</p>
                      </div>
                      <Badge variant="outline">{prediction.predictedLevel}%</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-4">
          {/* Mood Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                How are you feeling?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedMood ? (
                <div className="grid grid-cols-4 gap-2">
                  {(['great', 'good', 'ok', 'bad'] as const).map((mood) => (
                    <Button
                      key={mood}
                      variant="outline"
                      className="h-16 flex-col gap-1"
                      onClick={() => setSelectedMood(mood)}
                    >
                      <span className="text-xl">{getMoodEmoji(mood)}</span>
                      <span className="text-xs capitalize">{mood}</span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-3xl">{getMoodEmoji(selectedMood)}</span>
                    <p className="mt-2 font-medium capitalize">Feeling {selectedMood}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Energy Level: {energyRating}/5</label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant={energyRating >= rating ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setEnergyRating(rating)}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Focus Level: {focusRating}/5</label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            variant={focusRating >= rating ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setFocusRating(rating)}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleMoodSubmit} className="flex-1">
                      Save Mood
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedMood(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Mood Insights */}
              {moodTracking.hasData && (
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium mb-2">Your Mood Insights</h4>
                  <div className="space-y-2">
                    {moodTracking.moodInsights.map((insight, index) => (
                      <p key={index} className="text-sm text-muted-foreground">{insight}</p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Mood Summary */}
          {moodTracking.todaysMoodSummary.entriesCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{moodTracking.todaysMoodSummary.averageMood}/4</p>
                    <p className="text-xs text-muted-foreground">Mood</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{moodTracking.todaysMoodSummary.averageEnergy}/5</p>
                    <p className="text-xs text-muted-foreground">Energy</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{moodTracking.todaysMoodSummary.averageFocus}/5</p>
                    <p className="text-xs text-muted-foreground">Focus</p>
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