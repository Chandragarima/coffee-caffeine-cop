import { useState, useEffect, useCallback } from 'react';
import { usePreferences } from './usePreferences';
import { addCoffeeLoggedListener } from '@/lib/events';
import { CoffeeLogEntry } from '@/lib/coffeeLog';

export interface ActivePeakEnergy {
  id: string;
  coffeeName: string;
  caffeineMg: number;
  consumedAt: number;
  loggedAt: number;
}

/**
 * Hook to manage peak energy display state
 * - Tracks the most recently logged coffee
 * - Shows peak energy countdown when enabled in preferences
 * - Auto-dismisses after 2 hours or when user dismisses
 */
export const usePeakEnergy = () => {
  const { showPeakEnergy } = usePreferences();
  const [activePeak, setActivePeak] = useState<ActivePeakEnergy | null>(null);
  
  // Listen for new coffee logs
  useEffect(() => {
    if (!showPeakEnergy) {
      setActivePeak(null);
      return;
    }
    
    const handleCoffeeLogged = (event: CustomEvent<CoffeeLogEntry>) => {
      const log = event.detail;
      
      // Only show peak energy for recent logs (within last 5 minutes)
      // This prevents showing peak energy for retroactive logs from hours ago
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      const isRecent = log.consumedAt >= fiveMinutesAgo;
      
      if (isRecent) {
        setActivePeak({
          id: log.id,
          coffeeName: log.coffeeName,
          caffeineMg: log.caffeineMg,
          consumedAt: log.consumedAt,
          loggedAt: Date.now(),
        });
      }
    };
    
    const removeListener = addCoffeeLoggedListener(handleCoffeeLogged as any);
    
    return () => {
      removeListener();
    };
  }, [showPeakEnergy]);
  
  // Auto-dismiss after 2 hours
  useEffect(() => {
    if (!activePeak) return;
    
    const twoHours = 2 * 60 * 60 * 1000;
    const timeUntilAutoDismiss = (activePeak.consumedAt + twoHours) - Date.now();
    
    if (timeUntilAutoDismiss <= 0) {
      setActivePeak(null);
      return;
    }
    
    const timer = setTimeout(() => {
      setActivePeak(null);
    }, timeUntilAutoDismiss);
    
    return () => clearTimeout(timer);
  }, [activePeak]);
  
  const dismissPeak = useCallback(() => {
    setActivePeak(null);
  }, []);
  
  return {
    activePeak,
    dismissPeak,
    showPeakEnergy,
  };
};
