import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { usePreferences } from '@/hooks/usePreferences';
import { useCaffeineTracker } from '@/hooks/useCaffeineTracker';
import CoffeeLogHistory from '@/components/CoffeeLogHistory';
import QuickLogButton from '@/components/QuickLogButton';
import { COFFEES } from '@/data/coffees';
import { adjustedMg, SizeOz } from '@/lib/serving';
import { clearAllCoffeeLogs } from '@/lib/coffeeLog';

const CoffeeLogDemo = () => {
  const { logs, stats, isLoading, quickLog, refreshStats } = useCoffeeLogs();
  const { refreshCaffeineStatus } = useCaffeineTracker();
  
  // Simple refresh function for coffee stats only
  const handleRefresh = async () => {
    await refreshStats();
  };
  const { servingSize, shots } = usePreferences();

  const handleQuickLog = async (coffeeId: string, coffeeName: string) => {
    const coffee = COFFEES.find(c => c.id === coffeeId);
    if (!coffee) return;

    const caffeineMg = adjustedMg(coffee, servingSize as SizeOz, shots);
    await quickLog(coffeeId, coffeeName, caffeineMg, servingSize, shots);
  };

  const handleClearAllLogs = async () => {
    if (confirm('Are you sure you want to clear all coffee logs? This cannot be undone.')) {
      await clearAllCoffeeLogs();
      window.location.reload(); // Refresh to update the UI
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30 p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2">Loading coffee logging system...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/30 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Coffee Logging Demo</h1>
          <p className="text-gray-600">Test the coffee logging system with IndexedDB storage</p>
        </div>

        {/* Quick Log Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Log Coffee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {COFFEES.slice(0, 6).map((coffee) => {
                const caffeineMg = adjustedMg(coffee, servingSize as SizeOz, shots);
                return (
                  <div key={coffee.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{coffee.name}</h3>
                      <Badge variant="outline" className="border-amber-200 text-amber-700">
                        {caffeineMg}mg
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{coffee.description}</p>
                                         <QuickLogButton 
                       coffee={coffee} 
                       variant="default" 
                       size="sm" 
                       className="w-full"
                       showDialog={true}
                       onLogSuccess={refreshStats}
                     />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        {stats && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            </CardContent>
          </Card>
        )}

        {/* Coffee Log History */}
        <CoffeeLogHistory />

        {/* Debug Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleClearAllLogs}
              >
                Clear All Logs
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('Current logs:', logs);
                  console.log('Current stats:', stats);
                }}
              >
                Log to Console
              </Button>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>💡 Try logging some coffees and then refresh the page to see persistence!</p>
              <p>🔍 Check browser dev tools → Application → IndexedDB → CoffeePoliceDB to see stored data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoffeeLogDemo;
