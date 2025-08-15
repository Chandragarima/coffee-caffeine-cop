import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useCaffeineTracker } from '@/hooks/useCaffeineTracker';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { usePreferences } from '@/hooks/usePreferences';
import CaffeineTracker from '@/components/CaffeineTracker';
import CoffeeLogHistory from '@/components/CoffeeLogHistory';
import RecentLogUndo from '@/components/RecentLogUndo';
import { Link } from 'react-router-dom';
import { getCaffeineColor, getCaffeineBgColor } from '@/lib/caffeineTracker';

const CaffeineTrackerPage = () => {
  const {
    caffeineStatus,
    guidance,
    timeToNextCoffeeFormatted,
    timeToBedtimeFormatted,
    caffeineLevelPercentage,
    getSleepRiskColor,
    getSleepRiskIcon,
    isSafeForNextCoffee,
    refreshCaffeineStatus
  } = useCaffeineTracker();

  const { logs, stats, refreshStats } = useCoffeeLogs();
  const { bedtime, caffeineLimit } = usePreferences();
  // Simple refresh function for coffee stats only
  const handleRefresh = async () => {
    await refreshStats();
    await refreshCaffeineStatus();
  };

  const caffeineColor = getCaffeineColor(caffeineStatus.currentLevel, caffeineStatus.dailyLimit);
  const caffeineBgColor = getCaffeineBgColor(caffeineStatus.currentLevel, caffeineStatus.dailyLimit);

  // Get today's logs for detailed analysis
  const todayLogs = logs.filter(log => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return log.timestamp >= today.getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <img
                src="/lovable-uploads/31c42cd4-bee4-40d8-ba66-0438b1c8dc85.png"
                alt="CoffeePolice mascot logo"
                className="h-12 w-12 rounded-xl shadow-lg"
                loading="lazy"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-amber-600 rounded-xl blur opacity-20"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">Caffeine Tracker</h1>
              <p className="text-gray-600">Real-time caffeine monitoring with smart guidance</p>
            </div>
          </div>
        </div>

        {/* Main Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Tracker */}
          <div className="lg:col-span-2">
            <CaffeineTracker showDetails={true} />
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${caffeineBgColor} mb-3`}>
                    <span className="text-2xl">{guidance.icon}</span>
                  </div>
                  <div className={`text-2xl font-bold ${caffeineColor}`}>
                    {caffeineStatus.currentLevel}mg
                  </div>
                  <div className="text-sm text-gray-600">in your system</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Daily Progress</span>
                    <span className="font-medium">{Math.round(caffeineStatus.dailyProgress)}%</span>
                  </div>
                  <Progress value={caffeineStatus.dailyProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-gray-900">{caffeineStatus.peakLevel}</div>
                    <div className="text-xs text-gray-600">Peak Today</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-bold text-gray-900">{timeToBedtimeFormatted}</div>
                    <div className="text-xs text-gray-600">To Bedtime</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sleep Risk */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sleep Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`p-4 rounded-lg border ${getSleepRiskColor(caffeineStatus.sleepRisk)}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getSleepRiskIcon(caffeineStatus.sleepRisk)}</span>
                    <div>
                      <div className="font-medium">
                        {caffeineStatus.sleepRisk.charAt(0).toUpperCase() + caffeineStatus.sleepRisk.slice(1)} Risk
                      </div>
                      <div className="text-sm opacity-80">
                        {caffeineStatus.sleepRiskMessage}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

                         {/* Quick Actions */}
             <Card>
               <CardHeader>
                 <CardTitle className="text-lg">Quick Actions</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 <Link to="/ask">
                   <Button className="w-full" variant="outline">
                     Browse Coffee
                   </Button>
                 </Link>
                 <Link to="/coffee-log-demo">
                   <Button className="w-full" variant="outline">
                     View History
                   </Button>
                 </Link>
                 <Button 
                   className="w-full" 
                   variant="outline"
                   onClick={handleRefresh}
                 >
                   Refresh Data
                 </Button>
               </CardContent>
             </Card>

                           {/* Recently Logged with Undo */}
              <RecentLogUndo 
                showCount={2} 
                onUndo={refreshStats}
              />
          </div>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="guidance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="guidance">Guidance</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="guidance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Smart Guidance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Next Coffee Recommendation */}
                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${caffeineBgColor}`}>
                      <span className="text-3xl">{guidance.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {guidance.reason}
                      </h3>
                      <p className="text-gray-700 mb-3">
                        {guidance.recommendation}
                      </p>
                      {!isSafeForNextCoffee && (
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="border-amber-200 text-amber-700">
                            ⏰ Wait {timeToNextCoffeeFormatted}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sleep Safety */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🛏️</span>
                      <h4 className="font-semibold text-gray-900">Sleep Safety</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      {caffeineStatus.sleepRiskMessage}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📊</span>
                      <h4 className="font-semibold text-gray-900">Daily Progress</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      You've consumed {Math.round(caffeineStatus.dailyProgress)}% of your daily limit.
                      {caffeineStatus.dailyProgress >= 90 && ' Consider switching to decaf!'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {todayLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">☕</div>
                    <p className="text-gray-600">No coffee logged today yet.</p>
                    <p className="text-sm text-gray-500 mt-2">Start logging your coffee consumption!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todayLogs.map((log, index) => {
                      const time = new Date(log.timestamp);
                      const hoursSince = (Date.now() - log.timestamp) / (1000 * 60 * 60);
                      const remaining = Math.round(log.caffeineMg * Math.pow(0.5, hoursSince / 5));
                      
                      return (
                        <div key={log.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                            <span className="text-amber-600">☕</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">{log.coffeeName}</h4>
                              <Badge variant="outline" className="border-amber-200 text-amber-700">
                                {remaining}mg remaining
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.caffeineMg}mg consumed
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <CoffeeLogHistory />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Insights & Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-2xl font-bold text-amber-700">{stats.totalCaffeineToday}</div>
                      <div className="text-sm text-gray-600">mg Today</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-700">{stats.totalDrinksToday}</div>
                      <div className="text-sm text-gray-600">Drinks Today</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">{Math.round(stats.averageCaffeinePerDay)}</div>
                      <div className="text-sm text-gray-600">mg/day Avg</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-700 truncate">{stats.mostConsumedCoffee}</div>
                      <div className="text-sm text-gray-600">Favorite</div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">💡 Tips for Better Sleep</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Avoid caffeine 8+ hours before bedtime</li>
                    <li>• Your current bedtime is set to {bedtime}</li>
                    <li>• Daily limit: {caffeineLimit}mg</li>
                    <li>• Caffeine half-life: ~5 hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Back to Home */}
        <div className="text-center">
          <Link to="/">
            <Button variant="outline" className="px-8 py-3 text-lg font-medium border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-colors">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CaffeineTrackerPage;
