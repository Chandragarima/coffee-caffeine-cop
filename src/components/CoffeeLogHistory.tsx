import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { CoffeeLogEntry } from '@/lib/coffeeLog';
import { addCoffeeLoggedListener, addCoffeeDeletedListener, addCoffeeUpdatedListener } from '@/lib/events';
import { LogDetailDialog } from './LogDetailDialog';
import { CoffeeDetailDialog } from './CoffeeDetailDialog';
import { CoffeeItem, COFFEES } from '@/data/coffees';

const CoffeeLogHistory = () => {
  const { logs, stats, isLoading, refreshStats, refreshLogs } = useCoffeeLogs();
  const [selectedLog, setSelectedLog] = useState<CoffeeLogEntry | null>(null);
  const [selectedCoffee, setSelectedCoffee] = useState<CoffeeItem | null>(null);
  const [activeTab, setActiveTab] = useState('today');

  // Listen for coffee logged/deleted/updated events to refresh immediately
  useEffect(() => {
    const handleRefresh = async () => {
      await refreshLogs();
    };

    const removeLoggedListener = addCoffeeLoggedListener(handleRefresh);
    const removeDeletedListener = addCoffeeDeletedListener(handleRefresh);
    const removeUpdatedListener = addCoffeeUpdatedListener(handleRefresh);

    return () => {
      removeLoggedListener();
      removeDeletedListener();
      removeUpdatedListener();
    };
  }, [refreshLogs]);

  // Handle viewing drink info from log detail
  const handleViewDrinkInfo = (coffee: CoffeeItem) => {
    setSelectedLog(null); // Close log detail first
    setSelectedCoffee(coffee);
  };

  // Filter logs based on active tab
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.getTime();
    
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

    switch (activeTab) {
      case 'today':
        return logs.filter(log => log.consumedAt >= startOfToday);
      case 'week':
        return logs.filter(log => log.consumedAt >= weekAgo);
      case 'month':
        return logs.filter(log => log.consumedAt >= monthAgo);
      case 'all':
        return logs;
      default:
        return logs;
    }
  }, [logs, activeTab]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // Show actual time for recent entries, with "Just now" for <1 minute
    if (diffMinutes < 1) return 'Just now';
    
    // For today, show time only
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // For older entries, show date + time
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMoodIcon = (mood?: string) => {
    switch (mood) {
      case 'great': return '😍';
      case 'good': return '😊';
      case 'ok': return '😐';
      case 'bad': return '😞';
      default: return '☕';
    }
  };

  const getLocationIcon = (location?: string) => {
    switch (location) {
      case 'home': return '🏠';
      case 'work': return '💼';
      case 'cafe': return '☕';
      case 'restaurant': return '🍽️';
      case 'travel': return '✈️';
      case 'other': return '📍';
      default: return '';
    }
  };


  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2">Loading coffee history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-1">
      {/* Statistics Cards */}
      {/* {stats && ( */}
         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-1 md:gap-2">
          {/* <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Today's Caffeine</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCaffeineToday}mg</p>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-amber-600 text-xs sm:text-sm">⚡</span>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Today's Drinks</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalDrinksToday}</p>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xs sm:text-sm">☕</span>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Weekly Average</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{Math.round(stats.averageCaffeinePerDay)}mg</p>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xs sm:text-sm">📊</span>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Favorite</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{stats.mostConsumedCoffee}</p>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xs sm:text-sm">❤️</span>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      {/* )} */}

      {/* Log History */}
      <Card>
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Coffee History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 h-9 sm:h-10">
              <TabsTrigger value="today" className="text-xs sm:text-sm">Today</TabsTrigger>
              <TabsTrigger value="week" className="text-xs sm:text-sm">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs sm:text-sm">Month</TabsTrigger>
              <TabsTrigger value="all" className="text-xs sm:text-sm">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 sm:mt-6">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">☕</div>
                  <p className="text-sm sm:text-base text-gray-600">No coffee logs found for this period.</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Start logging your coffee consumption!</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <span className="text-amber-600 text-base sm:text-lg">
                            {getMoodIcon(log.mood)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{log.coffeeName}</h3>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
                            <span>{log.servingSize}oz</span>
                            {log.shots > 1 && <span>• {log.shots} shots</span>}
                            {log.location && log.location !== 'none' && (
                              <span className="hidden sm:inline">• {getLocationIcon(log.location)} {log.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Badge variant="outline" className="border-amber-200 text-amber-700 text-xs sm:text-sm px-1.5 sm:px-2">
                          {log.caffeineMg}mg
                        </Badge>
                        <span className="text-xs sm:text-sm text-gray-500">{formatTime(log.consumedAt)}</span>
                        <span className="text-xs sm:text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                          Tap to edit
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <LogDetailDialog
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        onViewDrinkInfo={handleViewDrinkInfo}
      />

      {/* Coffee Detail Dialog (for viewing drink info) */}
      <CoffeeDetailDialog
        coffee={selectedCoffee}
        onClose={() => setSelectedCoffee(null)}
        hoursUntilBed={8}
      />
    </div>
  );
};

export default CoffeeLogHistory;
