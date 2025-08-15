import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { CoffeeLogEntry } from '@/lib/coffeeLog';
import { addCoffeeLoggedListener, addCoffeeDeletedListener } from '@/lib/events';
import Toast from './Toast';

interface RecentLogUndoProps {
  className?: string;
  showCount?: number; // Number of recent logs to show
  onUndo?: () => void; // Callback when a log is undone
}

const RecentLogUndo = ({ 
  className = '', 
  showCount = 3,
  onUndo 
}: RecentLogUndoProps) => {
  const { logs, deleteLog, refreshStats, refreshLogs } = useCoffeeLogs();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  // Get all recent logs (last 24 hours) for count
  const allRecentLogs = logs.filter(log => {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    return log.timestamp >= oneDayAgo;
  });

  // Get limited recent logs for display
  const recentLogs = allRecentLogs
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, showCount);

  const handleUndoLog = async (log: CoffeeLogEntry) => {
    setIsDeleting(log.id);
    try {
      const success = await deleteLog(log.id);
      if (success) {
        setToastMessage(`${log.coffeeName} removed from your log`);
        setShowToast(true);
        await refreshStats();
        onUndo?.();
      } else {
        setToastMessage('Failed to remove coffee log');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Failed to delete log:', error);
      setToastMessage('Failed to remove coffee log');
      setShowToast(true);
    } finally {
      setIsDeleting(null);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - timestamp;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleTimeString([], { 
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

  if (allRecentLogs.length === 0) {
    return null;
  }

  return (
    <>
      <Card className={`${className} border-amber-200 bg-amber-50/30`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Recently Logged</h3>
            <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
              {allRecentLogs.length} coffee{allRecentLogs.length > 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div 
                key={log.id} 
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100 shadow-sm"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 text-sm">
                      {getMoodIcon(log.mood)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {log.coffeeName}
                      </span>
                      <Badge variant="outline" className="text-xs border-amber-200 text-amber-700">
                        {log.caffeineMg}mg
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatTime(log.timestamp)}</span>
                      {log.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate">{log.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUndoLog(log)}
                  disabled={isDeleting === log.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                >
                  {isDeleting === log.id ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-sm">↶</span>
                      <span className="ml-1 text-xs">Undo</span>
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            💡 You can undo recent logs if you made a mistake or were just testing
          </div>
        </CardContent>
      </Card>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export default RecentLogUndo;
