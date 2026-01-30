import { useState, useEffect, useCallback, useRef } from 'react';
import { CoffeeLogEntry, CoffeeLogStats, addCoffeeLog, getCoffeeLogs, getCoffeeLogsForDay, getCoffeeLogsForLastDays, deleteCoffeeLog, updateCoffeeLog, getCoffeeLogStats, initCoffeeLogDB } from '@/lib/coffeeLog';
import { emitCoffeeLogged, emitCoffeeDeleted, emitCoffeeUpdated } from '@/lib/events';

export const useCoffeeLogs = () => {
  const [logs, setLogs] = useState<CoffeeLogEntry[]>([]);
  const [stats, setStats] = useState<CoffeeLogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const selfEmitRef = useRef(false);

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

  // Load logs and stats when initialized
  useEffect(() => {
    if (isInitialized) {
      loadLogsAndStats();
    }
  }, [isInitialized, loadLogsAndStats]);

  // Listen for coffee events to keep all hook instances in sync
  useEffect(() => {
    if (!isInitialized) return;
    const refresh = () => {
      // Skip if this instance just emitted the event
      if (selfEmitRef.current) {
        selfEmitRef.current = false;
        return;
      }
      loadLogsAndStats();
    };
    window.addEventListener('coffeeLogged', refresh);
    window.addEventListener('coffeeDeleted', refresh);
    window.addEventListener('coffeeUpdated', refresh);
    return () => {
      window.removeEventListener('coffeeLogged', refresh);
      window.removeEventListener('coffeeDeleted', refresh);
      window.removeEventListener('coffeeUpdated', refresh);
    };
  }, [isInitialized, loadLogsAndStats]);

  // Add a new coffee log
  const addLog = useCallback(async (entry: Omit<CoffeeLogEntry, 'id'>): Promise<string | null> => {
    try {
      const id = await addCoffeeLog(entry);
      await loadLogsAndStats();
      selfEmitRef.current = true;
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
      await loadLogsAndStats();
      selfEmitRef.current = true;
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
      await loadLogsAndStats();
      selfEmitRef.current = true;
      emitCoffeeUpdated(entry);
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
    notes?: string,
    consumedAt?: number
  ): Promise<boolean> => {
    const success = await addLog({
      coffeeId,
      coffeeName,
      caffeineMg,
      servingSize,
      shots,
      timestamp: Date.now(),
      consumedAt: consumedAt || Date.now(),
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
