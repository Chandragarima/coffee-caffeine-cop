import { useMemo } from 'react';
import { useCoffeeLogs } from './useCoffeeLogs';
import { usePreferences } from './usePreferences';
import { 
  analyzeConsumptionPatterns, 
  getCoffeePersonality, 
  generateWeeklyInsights,
  getPersonalizedRecommendations,
  ConsumptionPattern,
  PersonalityType,
  WeeklyInsight
} from '@/lib/insights';

export const useInsights = () => {
  const { logs } = useCoffeeLogs();
  const { bedtime } = usePreferences();

  // Analyze consumption patterns
  const consumptionPatterns = useMemo((): ConsumptionPattern => {
    return analyzeConsumptionPatterns(logs);
  }, [logs]);

  // Get coffee personality
  const coffeePersonality = useMemo((): PersonalityType => {
    return getCoffeePersonality(consumptionPatterns, logs);
  }, [consumptionPatterns, logs]);

  // Generate weekly insights
  const weeklyInsights = useMemo((): WeeklyInsight[] => {
    return generateWeeklyInsights(logs, bedtime);
  }, [logs, bedtime]);

  // Get personalized recommendations
  const personalizedRecommendations = useMemo((): string[] => {
    // Calculate current caffeine level for recommendations
    let currentCaffeineLevel = 0;
    const currentTime = Date.now();
    
    logs.forEach(log => {
      if (log.timestamp <= currentTime) {
        const hoursElapsed = (currentTime - log.timestamp) / (1000 * 60 * 60);
        const remaining = log.caffeineMg * Math.pow(0.5, hoursElapsed / 5);
        currentCaffeineLevel += remaining;
      }
    });

    const now = new Date();
    const timeOfDay = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return getPersonalizedRecommendations(logs, currentCaffeineLevel, bedtime, timeOfDay);
  }, [logs, bedtime]);

  return {
    // Core insights
    consumptionPatterns,
    coffeePersonality,
    weeklyInsights,
    personalizedRecommendations,
    
    // Helper data
    hasEnoughData: logs.length >= 5,
    analysisRange: logs.length > 0 ? {
      start: Math.min(...logs.map(log => log.timestamp)),
      end: Math.max(...logs.map(log => log.timestamp))
    } : null
  };
};