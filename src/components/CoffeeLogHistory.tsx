import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { CoffeeLogEntry } from '@/lib/coffeeLog';
import { addCoffeeLoggedListener, addCoffeeDeletedListener } from '@/lib/events';

const CoffeeLogHistory = () => {
  const { logs, stats, isLoading, deleteLog, refreshStats, refreshLogs } = useCoffeeLogs();
  const [selectedLog, setSelectedLog] = useState<CoffeeLogEntry | null>(null);
  const [activeTab, setActiveTab] = useState('today');

  // Listen for coffee logged/deleted events to refresh immediately
  useEffect(() => {
    const handleCoffeeLogged = async () => {
      await refreshLogs(); // Refresh logs when coffee is logged
    };

    const handleCoffeeDeleted = async () => {
      await refreshLogs(); // Refresh logs when coffee is deleted
    };

    const removeLoggedListener = addCoffeeLoggedListener(handleCoffeeLogged);
    const removeDeletedListener = addCoffeeDeletedListener(handleCoffeeDeleted);

    return () => {
      removeLoggedListener();
      removeDeletedListener();
    };
  }, [refreshLogs]);

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
        return logs.filter(log => log.timestamp >= startOfToday);
      case 'week':
        return logs.filter(log => log.timestamp >= weekAgo);
      case 'month':
        return logs.filter(log => log.timestamp >= monthAgo);
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
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
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

  const handleDeleteLog = async (id: string) => {
    if (confirm('Are you sure you want to delete this coffee log?')) {
      const success = await deleteLog(id);
      if (success) {
        await refreshStats();
      }
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
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Today's Caffeine</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCaffeineToday}mg</p>
                </div>
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <span className="text-amber-600 text-sm">⚡</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Today's Drinks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalDrinksToday}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">☕</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Weekly Average</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(stats.averageCaffeinePerDay)}mg</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-sm">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Favorite</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{stats.mostConsumedCoffee}</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-sm">❤️</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Log History */}
      <Card>
        <CardHeader>
          <CardTitle>Coffee History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">☕</div>
                  <p className="text-gray-600">No coffee logs found for this period.</p>
                  <p className="text-sm text-gray-500 mt-2">Start logging your coffee consumption!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                          <span className="text-amber-600 text-lg">
                            {getMoodIcon(log.mood)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{log.coffeeName}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{log.servingSize}oz</span>
                            {log.shots > 1 && <span>• {log.shots} shots</span>}
                            {log.location && (
                              <span>• {getLocationIcon(log.location)} {log.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="border-amber-200 text-amber-700">
                          {log.caffeineMg}mg
                        </Badge>
                        <span className="text-xs text-gray-500">{formatTime(log.timestamp)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLog(log.id);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          🗑️
                        </Button>
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
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedLog && (
            <>
              <DialogHeader>
                <DialogTitle>Coffee Log Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{selectedLog.coffeeName}</h3>
                    <Badge variant="outline" className="border-amber-200 text-amber-700">
                      {selectedLog.caffeineMg}mg
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Serving: {selectedLog.servingSize}oz</p>
                    <p>Shots: {selectedLog.shots}</p>
                    {selectedLog.location && (
                      <p>Location: {getLocationIcon(selectedLog.location)} {selectedLog.location}</p>
                    )}
                    {selectedLog.mood && (
                      <p>Mood: {getMoodIcon(selectedLog.mood)} {selectedLog.mood}</p>
                    )}
                    <p>Time: {new Date(selectedLog.timestamp).toLocaleString()}</p>
                  </div>
                </div>

                {selectedLog.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {selectedLog.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedLog(null)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeleteLog(selectedLog.id);
                      setSelectedLog(null);
                    }}
                    className="flex-1"
                  >
                    Delete Log
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoffeeLogHistory;
