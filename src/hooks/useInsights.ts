import { useState, useEffect, useMemo } from 'react';
import { useCoffeeLogs } from './useCoffeeLogs';
import { usePreferences } from './usePreferences';
import { 
  analyzeConsumptionPatterns, 
  getCoffeePersonality, 
  generateWeeklyInsights,
  predictEnergyLevels,
  getPersonalizedRecommendations,
  ConsumptionPattern,
  PersonalityType,
  WeeklyInsight,
  EnergyPrediction
} from '@/lib/insights';

export const useInsights = () => {
  const { logs } = useCoffeeLogs();
  const { bedtime } = usePreferences();
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update current time every 30 minutes for energy predictions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30 * 60 * 1000); // Update every 30 minutes

    return () => clearInterval(interval);
  }, []);

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

  // Predict energy levels for next 6 hours
  const energyPredictions = useMemo((): EnergyPrediction[] => {
    return predictEnergyLevels(logs, currentTime);
  }, [logs, currentTime]);

  // Get personalized recommendations
  const personalizedRecommendations = useMemo((): string[] => {
    // Calculate current caffeine level for recommendations
    let currentCaffeineLevel = 0;
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
  }, [logs, currentTime, bedtime]);

  // Get next energy peak timing
  const nextEnergyPeak = useMemo(() => {
    const predictions = energyPredictions;
    if (predictions.length === 0) return null;
    
    const peak = predictions.reduce((max, pred) => 
      pred.predictedLevel > max.predictedLevel ? pred : max
    );
    
    return {
      time: new Date(peak.timestamp),
      level: peak.predictedLevel,
      hoursFromNow: (peak.timestamp - currentTime) / (1000 * 60 * 60)
    };
  }, [energyPredictions, currentTime]);

  // Calculate habit score (0-100)
  const habitScore = useMemo(() => {
    const patterns = consumptionPatterns;
    let score = 50; // Base score
    
    // Timing score (40 points max)
    score += (patterns.optimalTimingPercentage / 100) * 40;
    
    // Consistency score (30 points max)
    if (Math.abs(patterns.weekdayVsWeekendDiff) < 50) {
      score += 30;
    } else if (Math.abs(patterns.weekdayVsWeekendDiff) < 100) {
      score += 15;
    }
    
    // Moderation score (30 points max)
    if (patterns.averageDailyCaffeine <= 400) {
      score += 30;
    } else if (patterns.averageDailyCaffeine <= 500) {
      score += 15;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }, [consumptionPatterns]);

  return {
    // Core insights
    consumptionPatterns,
    coffeePersonality,
    weeklyInsights,
    energyPredictions,
    personalizedRecommendations,
    
    // Derived insights
    nextEnergyPeak,
    habitScore,
    
    // Helper data
    hasEnoughData: logs.length >= 5,
    analysisRange: logs.length > 0 ? {
      start: Math.min(...logs.map(log => log.timestamp)),
      end: Math.max(...logs.map(log => log.timestamp))
    } : null
  };
};