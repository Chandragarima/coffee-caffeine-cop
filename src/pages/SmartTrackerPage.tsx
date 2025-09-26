import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedCaffeineTracker from '@/components/EnhancedCaffeineTracker';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { useCaffeineTracker } from '@/hooks/useCaffeineTracker';
import CoffeeLogHistory from '@/components/CoffeeLogHistory';
import RecentLogUndo from '@/components/RecentLogUndo';
import QuickLogButton from '@/components/QuickLogButton';
import { COFFEES } from '@/data/coffees';
import { CaffeineGuidance } from '@/lib/caffeineTracker';

// Helper component to render guidance icons (SVG or emoji)
const GuidanceIcon = ({ guidance, className = "" }: { guidance: CaffeineGuidance, className?: string }) => {
  if (guidance.iconType === 'svg' && guidance.iconPath) {
    return (
      <img 
        src={guidance.iconPath} 
        alt={guidance.reason}
        className={`w-full h-full object-contain ${className}`}
      />
    );
  }
  
  // Fallback to emoji
  return <span className={className}>{guidance.icon}</span>;
};

const SmartTrackerPage = () => {
  const { logs, refreshStats } = useCoffeeLogs();
  const {
    caffeineStatus,
    guidance,
    timeToNextCoffeeFormatted,
    refreshCaffeineStatus
  } = useCaffeineTracker();

  const [activeTab, setActiveTab] = useState('overview');

  // Simple refresh function for coffee stats
  const handleRefresh = async () => {
    await refreshStats();
    await refreshCaffeineStatus();
  };

  // Get today's logs for timeline
  const todayLogs = logs.filter(log => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return log.consumedAt >= today.getTime();
  });

  // Quick coffee options for logging
  const quickCoffees = COFFEES.filter(coffee => 
    ['Single Espresso', 'Drip Coffee', 'Small Americano', 'Latte'].includes(coffee.name)
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50/30 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="relative">
              <img
                src="/coffee-caffeine-cop/lovable-uploads/64b50735-018a-49d7-8568-11d380b32163.png"
                alt="CoffeePolice mascot logo"
                className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl shadow-lg"
                loading="lazy"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-600 rounded-xl blur opacity-20"></div>
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Tracker
              </h1>
              <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Intelligent caffeine monitoring with real-time insights</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-3 sm:mb-6">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-3">Overview</TabsTrigger>
            <TabsTrigger value="log" className="text-xs sm:text-sm px-2 sm:px-3">Log</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm px-2 sm:px-3">History</TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm px-2 sm:px-3">Tips</TabsTrigger>
          </TabsList>

          {/* Overview Tab - Main Smart Tracker */}
          <TabsContent value="overview" className="space-y-3 sm:space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 sm:gap-6">
              {/* Main Smart Tracker */}
              <div className="xl:col-span-3">
                <EnhancedCaffeineTracker />
              </div>

              {/* Side Panel */}
              <div className="space-y-3 sm:space-y-4">
                {/* Current Status Quick View */}
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <GuidanceIcon guidance={guidance} className="text-lg sm:text-xl" />
                      Current Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                        {caffeineStatus.currentLevel}mg
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">active caffeine</div>
                    </div>

                    <div className="space-y-2">
                      <Badge 
                        variant="outline" 
                        className={`w-full justify-center py-2 ${
                          guidance.color === 'green' ? 'border-green-200 text-green-700 bg-green-50' : 
                          guidance.color === 'yellow' ? 'border-yellow-200 text-yellow-700 bg-yellow-50' : 
                          'border-red-200 text-red-700 bg-red-50'
                        }`}
                      >
                        {guidance.reason}
                      </Badge>
                      
                      {!caffeineStatus.isSafeForNextCoffee && (
                        <div className="text-center text-sm text-gray-600">
                          Next coffee in <span className="font-semibold text-amber-600">{timeToNextCoffeeFormatted}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-base sm:text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    <Button 
                      onClick={() => setActiveTab('log')} 
                      className="w-full bg-blue-500 hover:bg-blue-600 text-sm sm:text-base h-9 sm:h-10"
                    >
                      <span className="mr-1 sm:mr-2">☕</span>
                      Log Coffee
                    </Button>
                    <Link to="/ask">
                      <Button variant="outline" className="w-full text-sm sm:text-base h-9 sm:h-10">
                        Browse Coffee Types
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      className="w-full text-sm sm:text-base h-9 sm:h-10"
                      onClick={handleRefresh}
                    >
                      Refresh Data
                    </Button>
                  </CardContent>
                </Card>

                {/* Recent Logs with Undo */}
                <RecentLogUndo 
                  showCount={3} 
                  onUndo={handleRefresh}
                />
              </div>
            </div>
          </TabsContent>

          {/* Quick Log Tab */}
          <TabsContent value="log" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Coffee Options */}
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    Quick Log
                  </CardTitle>
                  <p className="text-sm text-gray-600">Log your coffee consumption instantly</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {quickCoffees.map((coffee) => (
                      <QuickLogButton
                        key={coffee.id}
                        coffee={coffee}
                        onLogSuccess={handleRefresh}
                        className="h-auto p-4"
                        source="quick_log"
                      />
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <Link to="/ask">
                      <Button variant="outline" className="w-full">
                        Browse All Coffee Types
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Timeline */}
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    Today's Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayLogs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">☕</div>
                      <p className="text-gray-600">No coffee logged today yet.</p>
                      <p className="text-sm text-gray-500 mt-2">Start tracking your caffeine!</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {todayLogs.map((log) => {
                                        const time = new Date(log.consumedAt);
                const hoursSince = (Date.now() - log.consumedAt) / (1000 * 60 * 60);
                        const remaining = Math.round(log.caffeineMg * Math.pow(0.5, hoursSince / 5));
                        
                        return (
                          <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-amber-600 text-sm">☕</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900 text-sm truncate">{log.coffeeName}</h4>
                                <Badge variant="outline" className="border-amber-200 text-amber-700 text-xs">
                                  {remaining}mg left
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600">
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {log.caffeineMg}mg
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <CoffeeLogHistory />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Caffeine Science */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="text-2xl">🧪</span>
                    Caffeine Science
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-white/60 rounded-lg border border-blue-100">
                      <div className="font-medium text-blue-900 mb-1">⚡ Peak Effect</div>
                      <div className="text-gray-600 text-sm">
                        Caffeine reaches peak levels 30-60 minutes after consumption
                      </div>
                    </div>
                    <div className="p-3 bg-white/60 rounded-lg border border-green-100">
                      <div className="font-medium text-green-900 mb-1">🔄 Half-Life</div>
                      <div className="text-gray-600 text-sm">
                        Your body processes 50% of caffeine every 5 hours
                      </div>
                    </div>
                    <div className="p-3 bg-white/60 rounded-lg border border-purple-100">
                      <div className="font-medium text-purple-900 mb-1">😴 Sleep Quality</div>
                      <div className="text-gray-600 text-sm">
                        Less than 50mg at bedtime ensures good sleep quality
                      </div>
                    </div>
                    <div className="p-3 bg-white/60 rounded-lg border border-red-100">
                      <div className="font-medium text-red-900 mb-1">⏰ 8-Hour Rule</div>
                      <div className="text-gray-600 text-sm">
                        Nutritionists recommend no caffeine 8+ hours before bedtime
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips & Recommendations */}
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    Smart Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-white/60 rounded-lg border border-amber-100">
                      <div className="font-medium text-amber-900 mb-1">🌅 Morning Coffee</div>
                      <div className="text-gray-600 text-sm">
                        Wait 1-2 hours after waking for optimal caffeine effectiveness
                      </div>
                    </div>
                    <div className="p-3 bg-white/60 rounded-lg border border-orange-100">
                      <div className="font-medium text-orange-900 mb-1">⏰ Timing Matters</div>
                      <div className="text-gray-600 text-sm">
                        Avoid caffeine 8+ hours before your planned bedtime
                      </div>
                    </div>
                    <div className="p-3 bg-white/60 rounded-lg border border-red-100">
                      <div className="font-medium text-red-900 mb-1">💧 Stay Hydrated</div>
                      <div className="text-gray-600 text-sm">
                        Drink water alongside coffee to prevent dehydration
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to Home */}
        <div className="text-center pt-4 sm:pt-6">
          <Link to="/">
            <Button variant="outline" className="px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-lg font-medium border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SmartTrackerPage;
