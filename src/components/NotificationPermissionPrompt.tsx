import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { toast } from '@/components/ui/sonner';

const DISMISSED_KEY = 'coffeepolice_notification_prompt_dismissed';
const MIN_DAYS_BEFORE_PROMPT = 3;
const MIN_LOGS_BEFORE_PROMPT = 5;

/**
 * Contextual prompt to request notification permission
 * Shows after:
 * - User has been using the app for 3+ days, OR
 * - User has logged 5+ coffees
 * 
 * Won't show if:
 * - Permission already granted
 * - Permission denied
 * - User dismissed the prompt
 * - Notifications not supported
 */
const NotificationPermissionPrompt = () => {
  const { permission, isSupported, requestPermission } = useNotifications();
  const { stats } = useCoffeeLogs();
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  
  useEffect(() => {
    // Check if we should show the prompt
    if (!isSupported) return;
    if (permission === 'granted' || permission === 'denied') return;
    
    // Check if user dismissed previously
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;
    
    // Check if user has enough activity
    const hasEnoughActivity = 
      (stats?.trackingStreak || 0) >= MIN_DAYS_BEFORE_PROMPT ||
      ((stats?.totalDrinksMonth || 0) >= MIN_LOGS_BEFORE_PROMPT);
    
    if (hasEnoughActivity) {
      // Delay showing the prompt slightly
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [permission, isSupported, stats]);
  
  const handleRequest = async () => {
    setIsRequesting(true);
    const granted = await requestPermission();
    setIsRequesting(false);
    
    if (granted) {
      toast.success('Notifications enabled!', {
        description: "You'll get reminders for your caffeine cutoff.",
        duration: 4000,
      });
    } else {
      toast.info('No problem!', {
        description: 'You can enable notifications later in Settings.',
        duration: 3000,
      });
    }
    
    setIsVisible(false);
  };
  
  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <Card className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-80 z-40 shadow-xl border-amber-200 animate-in slide-in-from-bottom-4 duration-300">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-gray-900 text-sm">
                Stay on track with reminders
              </h4>
              <button 
                onClick={handleDismiss}
                className="p-1 text-gray-400 hover:text-gray-600 rounded -mr-1 -mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1 mb-3">
              Get alerts when your caffeine cutoff is approaching so you can protect your sleep.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleRequest}
                disabled={isRequesting}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
              >
                {isRequesting ? 'Enabling...' : 'Enable'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-gray-500 text-xs"
              >
                Maybe later
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPermissionPrompt;
