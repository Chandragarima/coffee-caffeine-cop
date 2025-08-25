import { useState, useEffect, useCallback } from 'react';
import { CoffeeLogEntry, CoffeeLogStats, addCoffeeLog, getCoffeeLogs, getCoffeeLogsForDay, getCoffeeLogsForLastDays, deleteCoffeeLog, updateCoffeeLog, getCoffeeLogStats, initCoffeeLogDB } from '@/lib/coffeeLog';
import { emitCoffeeLogged, emitCoffeeDeleted } from '@/lib/events';

export const useCoffeeLogs = () => {
  const [logs, setLogs] = useState<CoffeeLogEntry[]>([]);
  const [stats, setStats] = useState<CoffeeLogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the database
  useEffect(() => {
    const init = async () => {
      try {
        await initCoffeeLogDB();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize coffee log database:', error);
      }
    };
    init();
  }, []);

  // Load logs and stats when initialized
  useEffect(() => {
    if (isInitialized) {
      loadLogsAndStats();
    }
  }, [isInitialized]);

  const loadLogsAndStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allLogs, allStats] = await Promise.all([
        getCoffeeLogs(),
        getCoffeeLogStats()
      ]);
      setLogs(allLogs);
      setStats(allStats);
    } catch (error) {
      console.error('Failed to load coffee logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new coffee log
  const addLog = useCallback(async (entry: Omit<CoffeeLogEntry, 'id'>): Promise<string | null> => {
    try {
      const id = await addCoffeeLog(entry);
      await loadLogsAndStats(); // Refresh data
      // Emit event for auto-refresh
      emitCoffeeLogged({ id, ...entry });
      return id;
    } catch (error) {
      console.error('Failed to add coffee log:', error);
      return null;
    }
  }, [loadLogsAndStats]);

  // Delete a coffee log
  const deleteLog = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteCoffeeLog(id);
      await loadLogsAndStats(); // Refresh data
      // Emit event for auto-refresh
      emitCoffeeDeleted(id);
      return true;
    } catch (error) {
      console.error('Failed to delete coffee log:', error);
      return false;
    }
  }, [loadLogsAndStats]);

  // Update a coffee log
  const updateLog = useCallback(async (entry: CoffeeLogEntry): Promise<boolean> => {
    try {
      await updateCoffeeLog(entry);
      await loadLogsAndStats(); // Refresh data
      return true;
    } catch (error) {
      console.error('Failed to update coffee log:', error);
      return false;
    }
  }, [loadLogsAndStats]);

  // Get logs for a specific day
  const getLogsForDay = useCallback(async (date: Date): Promise<CoffeeLogEntry[]> => {
    try {
      return await getCoffeeLogsForDay(date);
    } catch (error) {
      console.error('Failed to get logs for day:', error);
      return [];
    }
  }, []);

  // Get logs for the last N days
  const getLogsForLastDays = useCallback(async (days: number): Promise<CoffeeLogEntry[]> => {
    try {
      return await getCoffeeLogsForLastDays(days);
    } catch (error) {
      console.error('Failed to get logs for last days:', error);
      return [];
    }
  }, []);

  // Get logs within a time range
  const getLogsInRange = useCallback(async (startTime?: number, endTime?: number): Promise<CoffeeLogEntry[]> => {
    try {
      return await getCoffeeLogs(startTime, endTime);
    } catch (error) {
      console.error('Failed to get logs in range:', error);
      return [];
    }
  }, []);

  // Refresh stats only
  const refreshStats = useCallback(async () => {
    try {
      const newStats = await getCoffeeLogStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  }, []);

  // Quick log a coffee (simplified version)
  const quickLog = useCallback(async (
    coffeeId: string,
    coffeeName: string,
    caffeineMg: number,
    servingSize: number,
    shots: 1 | 2 | 3 = 1,
    notes?: string
  ): Promise<boolean> => {
    const success = await addLog({
      coffeeId,
      coffeeName,
      caffeineMg,
      servingSize,
      shots,
      timestamp: Date.now(),
      notes
    });
    return success !== null;
  }, [addLog]);

  // Refresh logs only
  const refreshLogs = useCallback(async () => {
    try {
      const newLogs = await getCoffeeLogs();
      setLogs(newLogs);
    } catch (error) {
      console.error('Failed to refresh logs:', error);
    }
  }, []);

  return {
    // State
    logs,
    stats,
    isLoading,
    isInitialized,
    
    // Actions
    addLog,
    deleteLog,
    updateLog,
    quickLog,
    refreshStats,
    refreshLogs,
    
    // Queries
    getLogsForDay,
    getLogsForLastDays,
    getLogsInRange,
    
    // Utilities
    loadLogsAndStats
  };
};
