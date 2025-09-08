import { CoffeeLogEntry } from '@/lib/coffeeLog';
import { hoursUntilBedtime } from '@/lib/timeUtils';

export interface ConsumptionPattern {
  averageFirstCoffee: string;
  averageLastCoffee: string;
  peakConsumptionHour: number;
  averageDailyCaffeine: number;
  preferredDrinks: string[];
  weekdayVsWeekendDiff: number;
  optimalTimingPercentage: number;
}

export interface PersonalityType {
  type: 'Early Bird' | 'Steady Sipper' | 'Power Drinker' | 'Night Owl' | 'Weekend Warrior';
  description: string;
  traits: string[];
  recommendations: string[];
}

export interface WeeklyInsight {
  title: string;
  message: string;
  type: 'positive' | 'warning' | 'neutral';
  action?: string;
}

export interface EnergyPrediction {
  timestamp: number;
  predictedLevel: number;
  confidence: number;
  recommendation: string;
}

// Analyze consumption patterns from coffee logs
export const analyzeConsumptionPatterns = (logs: CoffeeLogEntry[]): ConsumptionPattern => {
  if (logs.length === 0) {
    return {
      averageFirstCoffee: '08:00',
      averageLastCoffee: '14:00',
      peakConsumptionHour: 9,
      averageDailyCaffeine: 0,
      preferredDrinks: [],
      weekdayVsWeekendDiff: 0,
      optimalTimingPercentage: 100
    };
  }

  const last30Days = logs.filter(log => 
    Date.now() - log.timestamp < 30 * 24 * 60 * 60 * 1000
  );

  // Group by day
  const dailyLogs = last30Days.reduce((acc, log) => {
    const date = new Date(log.timestamp).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {} as Record<string, CoffeeLogEntry[]>);

  // Calculate first and last coffee times
  const firstCoffeeTimes: number[] = [];
  const lastCoffeeTimes: number[] = [];
  const dailyCaffeine: number[] = [];
  
  Object.values(dailyLogs).forEach(dayLogs => {
    const sorted = dayLogs.sort((a, b) => a.timestamp - b.timestamp);
    if (sorted.length > 0) {
      const firstTime = new Date(sorted[0].timestamp);
      const lastTime = new Date(sorted[sorted.length - 1].timestamp);
      
      firstCoffeeTimes.push(firstTime.getHours() + firstTime.getMinutes() / 60);
      lastCoffeeTimes.push(lastTime.getHours() + lastTime.getMinutes() / 60);
      
      const totalCaffeine = dayLogs.reduce((sum, log) => sum + log.caffeineMg, 0);
      dailyCaffeine.push(totalCaffeine);
    }
  });

  // Find peak consumption hour
  const hourCounts = new Array(24).fill(0);
  last30Days.forEach(log => {
    const hour = new Date(log.timestamp).getHours();
    hourCounts[hour] += log.caffeineMg;
  });
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

  // Find preferred drinks
  const drinkCounts: Record<string, number> = {};
  last30Days.forEach(log => {
    drinkCounts[log.coffeeName] = (drinkCounts[log.coffeeName] || 0) + 1;
  });
  const preferredDrinks = Object.entries(drinkCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name]) => name);

  // Calculate weekday vs weekend difference
  const weekdayLogs = last30Days.filter(log => {
    const day = new Date(log.timestamp).getDay();
    return day >= 1 && day <= 5;
  });
  const weekendLogs = last30Days.filter(log => {
    const day = new Date(log.timestamp).getDay();
    return day === 0 || day === 6;
  });

  const weekdayAvg = weekdayLogs.length > 0 ? 
    weekdayLogs.reduce((sum, log) => sum + log.caffeineMg, 0) / weekdayLogs.length : 0;
  const weekendAvg = weekendLogs.length > 0 ? 
    weekendLogs.reduce((sum, log) => sum + log.caffeineMg, 0) / weekendLogs.length : 0;

  // Calculate optimal timing percentage (coffees consumed before 2 PM)
  const optimalCoffees = last30Days.filter(log => {
    const hour = new Date(log.timestamp).getHours();
    return hour < 14;
  });
  const optimalPercentage = last30Days.length > 0 ? 
    (optimalCoffees.length / last30Days.length) * 100 : 100;

  const avgFirstCoffee = firstCoffeeTimes.length > 0 ? 
    firstCoffeeTimes.reduce((a, b) => a + b) / firstCoffeeTimes.length : 8;
  const avgLastCoffee = lastCoffeeTimes.length > 0 ? 
    lastCoffeeTimes.reduce((a, b) => a + b) / lastCoffeeTimes.length : 14;
  const avgDaily = dailyCaffeine.length > 0 ? 
    dailyCaffeine.reduce((a, b) => a + b) / dailyCaffeine.length : 0;

  return {
    averageFirstCoffee: `${Math.floor(avgFirstCoffee).toString().padStart(2, '0')}:${Math.round((avgFirstCoffee % 1) * 60).toString().padStart(2, '0')}`,
    averageLastCoffee: `${Math.floor(avgLastCoffee).toString().padStart(2, '0')}:${Math.round((avgLastCoffee % 1) * 60).toString().padStart(2, '0')}`,
    peakConsumptionHour: peakHour,
    averageDailyCaffeine: Math.round(avgDaily),
    preferredDrinks,
    weekdayVsWeekendDiff: Math.round(weekendAvg - weekdayAvg),
    optimalTimingPercentage: Math.round(optimalPercentage)
  };
};

// Determine coffee personality based on patterns
export const getCoffeePersonality = (patterns: ConsumptionPattern, logs: CoffeeLogEntry[]): PersonalityType => {
  const avgFirstHour = parseFloat(patterns.averageFirstCoffee.split(':')[0]);
  const avgLastHour = parseFloat(patterns.averageLastCoffee.split(':')[0]);
  const dailyAvg = patterns.averageDailyCaffeine;

  // Early Bird: First coffee before 7 AM, good timing
  if (avgFirstHour < 7 && patterns.optimalTimingPercentage > 80) {
    return {
      type: 'Early Bird',
      description: 'You start your day early and make smart timing choices',
      traits: ['Early riser', 'Great timing', 'Consistent habits'],
      recommendations: [
        'Keep up your excellent timing!',
        'Consider a second cup around 10 AM for sustained energy',
        'Your habits support great sleep quality'
      ]
    };
  }

  // Power Drinker: High daily caffeine, frequent consumption
  if (dailyAvg > 300) {
    return {
      type: 'Power Drinker',
      description: 'You rely heavily on caffeine for sustained energy',
      traits: ['High tolerance', 'Frequent consumer', 'Energy dependent'],
      recommendations: [
        'Consider spacing your coffee more evenly',
        'Try switching some cups to green tea',
        'Monitor your sleep quality closely'
      ]
    };
  }

  // Night Owl: Last coffee after 4 PM frequently
  if (avgLastHour > 16 || patterns.optimalTimingPercentage < 50) {
    return {
      type: 'Night Owl',
      description: 'You enjoy coffee later in the day',
      traits: ['Late drinker', 'May affect sleep', 'Flexible schedule'],
      recommendations: [
        'Try moving your last coffee earlier',
        'Consider decaf for afternoon cravings',
        'Monitor how late coffee affects your sleep'
      ]
    };
  }

  // Weekend Warrior: Big difference between weekday and weekend consumption
  if (Math.abs(patterns.weekdayVsWeekendDiff) > 100) {
    return {
      type: 'Weekend Warrior',
      description: 'Your coffee habits change dramatically on weekends',
      traits: ['Variable patterns', 'Lifestyle driven', 'Social drinker'],
      recommendations: [
        'Try to maintain more consistent patterns',
        'Weekend coffee can be a treat, not a necessity',
        'Consider your weekend sleep schedule'
      ]
    };
  }

  // Default: Steady Sipper
  return {
    type: 'Steady Sipper',
    description: 'You have consistent, moderate coffee habits',
    traits: ['Balanced approach', 'Consistent timing', 'Mindful consumption'],
    recommendations: [
      'Your habits are well-balanced!',
      'Experiment with timing to optimize energy',
      'Consider tracking how coffee affects your mood'
    ]
  };
};

// Generate weekly insights
export const generateWeeklyInsights = (logs: CoffeeLogEntry[], bedtime: string): WeeklyInsight[] => {
  const insights: WeeklyInsight[] = [];
  const weekLogs = logs.filter(log => 
    Date.now() - log.timestamp < 7 * 24 * 60 * 60 * 1000
  );

  if (weekLogs.length === 0) return insights;

  // Sleep timing insight
  const lateCoffees = weekLogs.filter(log => {
    const coffeeTime = new Date(log.timestamp);
    const hoursUntilBed = hoursUntilBedtime(bedtime);
    const coffeeHour = coffeeTime.getHours();
    const bedHour = parseInt(bedtime.split(':')[0]);
    
    // Consider coffee "late" if within 6 hours of bedtime
    const adjustedBedHour = bedHour > 12 ? bedHour : bedHour + 24;
    const adjustedCoffeeHour = coffeeHour < 12 ? coffeeHour + 24 : coffeeHour;
    
    return (adjustedBedHour - adjustedCoffeeHour) < 6;
  });

  if (lateCoffees.length > 2) {
    insights.push({
      title: 'Sleep Impact Alert',
      message: `You had ${lateCoffees.length} coffees within 6 hours of bedtime this week`,
      type: 'warning',
      action: 'Try moving your last coffee earlier for better sleep'
    });
  }

  // Consistency insight
  const dailyConsumption = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
    const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();
    
    return weekLogs.filter(log => 
      log.timestamp >= dayStart && log.timestamp <= dayEnd
    ).reduce((sum, log) => sum + log.caffeineMg, 0);
  });

  const avgDaily = dailyConsumption.reduce((a, b) => a + b) / 7;
  const maxVariation = Math.max(...dailyConsumption) - Math.min(...dailyConsumption);

  if (maxVariation > 200) {
    insights.push({
      title: 'Inconsistent Patterns',
      message: 'Your caffeine intake varies significantly day to day',
      type: 'neutral',
      action: 'Try maintaining more consistent daily amounts'
    });
  } else if (avgDaily > 0 && avgDaily < 300) {
    insights.push({
      title: 'Great Consistency!',
      message: 'Your caffeine intake has been nicely balanced this week',
      type: 'positive'
    });
  }

  // Timing insight
  const patterns = analyzeConsumptionPatterns(weekLogs);
  if (patterns.optimalTimingPercentage > 80) {
    insights.push({
      title: 'Excellent Timing',
      message: `${Math.round(patterns.optimalTimingPercentage)}% of your coffee was consumed at optimal times`,
      type: 'positive'
    });
  }

  return insights;
};

// Predict energy levels for the next few hours
export const predictEnergyLevels = (logs: CoffeeLogEntry[], currentTime: number = Date.now()): EnergyPrediction[] => {
  const predictions: EnergyPrediction[] = [];
  const hourlySteps = 6; // Predict next 6 hours
  
  for (let i = 1; i <= hourlySteps; i++) {
    const futureTime = currentTime + (i * 60 * 60 * 1000);
    
    // Calculate caffeine level at future time
    let predictedCaffeine = 0;
    logs.forEach(log => {
      if (log.timestamp <= futureTime) {
        const hoursElapsed = (futureTime - log.timestamp) / (1000 * 60 * 60);
        const remaining = log.caffeineMg * Math.pow(0.5, hoursElapsed / 5); // 5-hour half-life
        predictedCaffeine += remaining;
      }
    });

    // Convert caffeine level to energy score (0-100)
    const energyLevel = Math.min(100, (predictedCaffeine / 200) * 100);
    const confidence = logs.length > 5 ? 0.8 : 0.5;

    let recommendation = '';
    if (energyLevel < 20) {
      recommendation = 'Perfect time for your next coffee';
    } else if (energyLevel < 50) {
      recommendation = 'Good time for a small coffee boost';
    } else {
      recommendation = 'High energy - hold off on more caffeine';
    }

    predictions.push({
      timestamp: futureTime,
      predictedLevel: Math.round(energyLevel),
      confidence,
      recommendation
    });
  }

  return predictions;
};

// Get personalized recommendations based on current context
export const getPersonalizedRecommendations = (
  logs: CoffeeLogEntry[], 
  currentCaffeineLevel: number,
  bedtime: string,
  timeOfDay: string
): string[] => {
  const recommendations: string[] = [];
  const patterns = analyzeConsumptionPatterns(logs);
  const personality = getCoffeePersonality(patterns, logs);
  const currentHour = new Date().getHours();
  const hoursUntilBed = hoursUntilBedtime(bedtime);

  // Time-based recommendations
  if (currentHour < 10) {
    recommendations.push("Morning is your optimal caffeine window - enjoy!");
  } else if (currentHour > 14 && hoursUntilBed < 8) {
    recommendations.push("Consider switching to decaf to protect your sleep");
  }

  // Pattern-based recommendations
  if (patterns.optimalTimingPercentage < 70) {
    recommendations.push("Try having your last coffee by 2 PM for better sleep");
  }

  // Personality-based recommendations
  recommendations.push(...personality.recommendations.slice(0, 1));

  // Current level recommendations
  if (currentCaffeineLevel > 300) {
    recommendations.push("You're well-caffeinated - consider waiting 2-3 hours");
  } else if (currentCaffeineLevel < 50 && currentHour < 15) {
    recommendations.push("Perfect time for a coffee boost!");
  }

  return recommendations.slice(0, 3); // Limit to 3 recommendations
};