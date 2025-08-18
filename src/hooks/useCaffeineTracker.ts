import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCoffeeLogs } from './useCoffeeLogs';
import { usePreferences } from './usePreferences';
import { 
  CaffeineStatus, 
  getCaffeineStatus, 
  getCaffeineGuidance,
  formatDuration 
} from '@/lib/caffeineTracker';
import { addCoffeeLoggedListener, addCoffeeDeletedListener } from '@/lib/events';

export const useCaffeineTracker = () => {
  const { logs, refreshStats, refreshLogs } = useCoffeeLogs();
  const { bedtime, caffeineLimit } = usePreferences();
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [forceUpdate, setForceUpdate] = useState(0);

  // Update current time every minute for real-time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Auto-refresh when coffee is logged or deleted
  useEffect(() => {
    const handleCoffeeLogged = async () => {
      await refreshLogs(); // Make sure logs are refreshed first
      setCurrentTime(Date.now());
      setForceUpdate(prev => prev + 1);
    };

    const handleCoffeeDeleted = async () => {
      await refreshLogs(); // Make sure logs are refreshed first
      setCurrentTime(Date.now());
      setForceUpdate(prev => prev + 1);
    };

    const removeLoggedListener = addCoffeeLoggedListener(handleCoffeeLogged);
    const removeDeletedListener = addCoffeeDeletedListener(handleCoffeeDeleted);

    return () => {
      removeLoggedListener();
      removeDeletedListener();
    };
  }, [refreshLogs]);

  // Calculate caffeine status - always recalculate when logs change
  const caffeineStatus = useMemo((): CaffeineStatus => {
    return getCaffeineStatus(logs, bedtime, caffeineLimit);
  }, [logs, bedtime, caffeineLimit, currentTime, forceUpdate]);

  // Get guidance for next coffee
  const guidance = useMemo(() => {
    return getCaffeineGuidance(
      caffeineStatus.currentLevel,
      caffeineStatus.timeToNextCoffee,
      caffeineStatus.dailyLimit,
      caffeineStatus.dailyProgress,
      caffeineStatus.timeToBedtime
    );
  }, [caffeineStatus, forceUpdate]);

  // Format time to next coffee
  const timeToNextCoffeeFormatted = useMemo(() => {
    return formatDuration(caffeineStatus.timeToNextCoffee);
  }, [caffeineStatus.timeToNextCoffee, forceUpdate]);

  // Format time to bedtime
  const timeToBedtimeFormatted = useMemo(() => {
    return formatDuration(caffeineStatus.timeToBedtime);
  }, [caffeineStatus.timeToBedtime, forceUpdate]);

  // Check if caffeine level is changing (for animations)
  const isLevelChanging = useMemo(() => {
    // This could be used to trigger animations when caffeine level changes
    return caffeineStatus.currentLevel > 0;
  }, [caffeineStatus.currentLevel]);

  // Get caffeine level percentage
  const caffeineLevelPercentage = useMemo(() => {
    return Math.min(100, (caffeineStatus.currentLevel / caffeineStatus.dailyLimit) * 100);
  }, [caffeineStatus.currentLevel, caffeineStatus.dailyLimit, forceUpdate]);

  // Get sleep risk color
  const getSleepRiskColor = useCallback((risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }, []);

  // Get sleep risk icon
  const getSleepRiskIcon = useCallback((risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return '😴';
      case 'medium': return '😐';
      case 'high': return '😵';
      default: return '😴';
    }
  }, []);

  // Refresh caffeine status (useful after logging new coffee)
  const refreshCaffeineStatus = useCallback(async () => {
    await refreshStats();
    await refreshLogs(); // Ensure logs are refreshed
    setCurrentTime(Date.now());
    setForceUpdate(prev => prev + 1); // Force recalculation
  }, [refreshStats, refreshLogs]);

  return {
    // Core status
    caffeineStatus,
    guidance,
    
    // Formatted values
    timeToNextCoffeeFormatted,
    timeToBedtimeFormatted,
    caffeineLevelPercentage,
    
    // Helper functions
    getSleepRiskColor,
    getSleepRiskIcon,
    refreshCaffeineStatus,
    
    // State indicators
    isLevelChanging,
    isSafeForNextCoffee: caffeineStatus.isSafeForNextCoffee,
    
    // Raw values for custom calculations
    currentLevel: caffeineStatus.currentLevel,
    peakLevel: caffeineStatus.peakLevel,
    dailyProgress: caffeineStatus.dailyProgress,
    dailyLimit: caffeineStatus.dailyLimit
  };
};
