import { useState, useEffect, useMemo } from 'react';
import { useCoffeeLogs } from './useCoffeeLogs';

export type MoodEntry = {
  id: string;
  timestamp: number;
  mood: 'great' | 'good' | 'ok' | 'bad';
  energy: number; // 1-5 scale
  focus: number; // 1-5 scale
  notes?: string;
};

export type MoodCorrelation = {
  mood: 'great' | 'good' | 'ok' | 'bad';
  averageCaffeine: number;
  count: number;
  bestTiming: string; // Time of day for best mood
};

const MOOD_STORAGE_KEY = 'coffee-police-mood-entries';

export const useMoodTracking = () => {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logs } = useCoffeeLogs();

  // Load mood entries from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(MOOD_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setMoodEntries(parsed);
      }
    } catch (error) {
      console.error('Error loading mood entries:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save mood entries to localStorage
  const saveMoodEntries = (entries: MoodEntry[]) => {
    try {
      localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(entries));
      setMoodEntries(entries);
    } catch (error) {
      console.error('Error saving mood entries:', error);
    }
  };

  // Add a new mood entry
  const addMoodEntry = (mood: 'great' | 'good' | 'ok' | 'bad', energy: number, focus: number, notes?: string) => {
    const newEntry: MoodEntry = {
      id: `mood-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      mood,
      energy,
      focus,
      notes
    };

    const updatedEntries = [...moodEntries, newEntry];
    saveMoodEntries(updatedEntries);
    return newEntry.id;
  };

  // Get mood entries for a specific day
  const getMoodEntriesForDay = (date: Date) => {
    const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
    const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();
    
    return moodEntries.filter(entry => 
      entry.timestamp >= dayStart && entry.timestamp <= dayEnd
    );
  };

  // Calculate mood-caffeine correlation
  const moodCorrelation = useMemo((): MoodCorrelation[] => {
    if (moodEntries.length === 0 || logs.length === 0) return [];

    const correlations: Record<string, { caffeine: number[], times: string[] }> = {
      great: { caffeine: [], times: [] },
      good: { caffeine: [], times: [] },
      ok: { caffeine: [], times: [] },
      bad: { caffeine: [], times: [] }
    };

    moodEntries.forEach(moodEntry => {
      // Find caffeine consumed in the 6 hours before this mood entry
      const sixHoursBefore = moodEntry.timestamp - (6 * 60 * 60 * 1000);
      const relevantLogs = logs.filter(log => 
        log.timestamp >= sixHoursBefore && log.timestamp <= moodEntry.timestamp
      );

      const totalCaffeine = relevantLogs.reduce((sum, log) => sum + log.caffeineMg, 0);
      const moodTime = new Date(moodEntry.timestamp);
      const timeString = `${moodTime.getHours().toString().padStart(2, '0')}:${moodTime.getMinutes().toString().padStart(2, '0')}`;

      correlations[moodEntry.mood].caffeine.push(totalCaffeine);
      correlations[moodEntry.mood].times.push(timeString);
    });

    return Object.entries(correlations).map(([mood, data]) => {
      const averageCaffeine = data.caffeine.length > 0 
        ? data.caffeine.reduce((a, b) => a + b) / data.caffeine.length 
        : 0;

      // Find most common time for this mood (simplified)
      const timeCounts: Record<string, number> = {};
      data.times.forEach(time => {
        const hour = time.split(':')[0];
        timeCounts[hour] = (timeCounts[hour] || 0) + 1;
      });
      
      const bestHour = Object.entries(timeCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '12';
      const bestTiming = `${bestHour}:00`;

      return {
        mood: mood as 'great' | 'good' | 'ok' | 'bad',
        averageCaffeine: Math.round(averageCaffeine),
        count: data.caffeine.length,
        bestTiming
      };
    }).filter(correlation => correlation.count > 0);
  }, [moodEntries, logs]);

  // Get today's mood summary
  const todaysMoodSummary = useMemo(() => {
    const today = new Date();
    const todaysEntries = getMoodEntriesForDay(today);
    
    if (todaysEntries.length === 0) {
      return {
        averageMood: null,
        averageEnergy: null,
        averageFocus: null,
        entriesCount: 0
      };
    }

    const moodValues = { great: 4, good: 3, ok: 2, bad: 1 };
    const avgMood = todaysEntries.reduce((sum, entry) => 
      sum + moodValues[entry.mood], 0
    ) / todaysEntries.length;

    const avgEnergy = todaysEntries.reduce((sum, entry) => 
      sum + entry.energy, 0
    ) / todaysEntries.length;

    const avgFocus = todaysEntries.reduce((sum, entry) => 
      sum + entry.focus, 0
    ) / todaysEntries.length;

    return {
      averageMood: Math.round(avgMood * 10) / 10,
      averageEnergy: Math.round(avgEnergy * 10) / 10,
      averageFocus: Math.round(avgFocus * 10) / 10,
      entriesCount: todaysEntries.length
    };
  }, [moodEntries]);

  // Get mood insights
  const moodInsights = useMemo(() => {
    const insights: string[] = [];

    if (moodCorrelation.length === 0) {
      return ['Track your mood to see how caffeine affects you!'];
    }

    // Find best mood correlation
    const bestMood = moodCorrelation.find(corr => corr.mood === 'great');
    if (bestMood && bestMood.count >= 3) {
      insights.push(`You feel great with around ${bestMood.averageCaffeine}mg of caffeine`);
      insights.push(`Your best mood time is around ${bestMood.bestTiming}`);
    }

    // Find concerning patterns
    const badMood = moodCorrelation.find(corr => corr.mood === 'bad');
    if (badMood && badMood.averageCaffeine > 400) {
      insights.push('High caffeine intake may be affecting your mood negatively');
    }

    if (insights.length === 0) {
      insights.push('Keep tracking to discover your personal caffeine-mood patterns');
    }

    return insights;
  }, [moodCorrelation]);

  return {
    // Data
    moodEntries,
    moodCorrelation,
    todaysMoodSummary,
    moodInsights,
    
    // Actions
    addMoodEntry,
    getMoodEntriesForDay,
    
    // State
    isLoading,
    hasData: moodEntries.length > 0
  };
};