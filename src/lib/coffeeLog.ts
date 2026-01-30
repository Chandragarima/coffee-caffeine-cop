// Coffee logging system using IndexedDB
export interface CoffeeLogEntry {
  id: string;                    // Unique identifier
  coffeeId: string;              // Reference to coffee from data/coffees.ts
  coffeeName: string;            // Coffee name for display
  caffeineMg: number;            // Caffeine amount in mg
  servingSize: number;           // Serving size in oz
  shots: 1 | 2 | 3;             // Number of espresso shots
  timestamp: number;             // Unix timestamp when logged (for backward compatibility)
  consumedAt: number;            // Unix timestamp when actually consumed
  notes?: string;                // Optional user notes
  location?: string;             // Optional location (home, work, cafe, etc.)
  mood?: 'great' | 'good' | 'ok' | 'bad'; // How it made them feel
}

export interface CoffeeLogStats {
  totalCaffeineToday: number;
  totalCaffeineWeek: number;
  totalCaffeineMonth: number;
  averageCaffeinePerDay: number;
  totalDrinksToday: number;
  totalDrinksWeek: number;
  totalDrinksMonth: number;
  mostConsumedCoffee: string;
  mostConsumedCount: number;
  topFavoriteTied: number; // how many drinks share the top count
  peakConsumptionHour: number;
  lastConsumptionTime: number;
  trackingStreak: number;
  totalDaysWithLogs: number; // distinct days (all time) with at least one log
}

// IndexedDB setup
const DB_NAME = 'CoffeePoliceDB';
const DB_VERSION = 1;
const COFFEE_LOGS_STORE = 'coffeeLogs';

class CoffeeLogDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create coffee logs store
        if (!db.objectStoreNames.contains(COFFEE_LOGS_STORE)) {
          const store = db.createObjectStore(COFFEE_LOGS_STORE, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('coffeeId', 'coffeeId', { unique: false });
        }
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Add a new coffee log entry
  async addLog(entry: Omit<CoffeeLogEntry, 'id'>): Promise<string> {
    const db = await this.getDB();
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure consumedAt is set (default to timestamp if not provided for backward compatibility)
    const fullEntry: CoffeeLogEntry = { 
      ...entry, 
      id,
      consumedAt: entry.consumedAt || entry.timestamp
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COFFEE_LOGS_STORE], 'readwrite');
      const store = transaction.objectStore(COFFEE_LOGS_STORE);
      const request = store.add(fullEntry);

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all logs within a time range
  async getLogs(startTime?: number, endTime?: number): Promise<CoffeeLogEntry[]> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COFFEE_LOGS_STORE], 'readonly');
      const store = transaction.objectStore(COFFEE_LOGS_STORE);
      const index = store.index('timestamp');
      
      let request: IDBRequest;
      
      if (startTime && endTime) {
        request = index.getAll(IDBKeyRange.bound(startTime, endTime));
      } else if (startTime) {
        request = index.getAll(IDBKeyRange.lowerBound(startTime));
      } else if (endTime) {
        request = index.getAll(IDBKeyRange.upperBound(endTime));
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const logs = request.result as CoffeeLogEntry[];
        
        // Handle backward compatibility: if consumedAt is missing, use timestamp
        const processedLogs = logs.map(log => ({
          ...log,
          consumedAt: log.consumedAt || log.timestamp
        }));
        
        resolve(processedLogs.sort((a, b) => b.timestamp - a.timestamp)); // Sort by newest first
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Get logs for a specific day
  async getLogsForDay(date: Date): Promise<CoffeeLogEntry[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const allLogs = await this.getLogs();
    return allLogs.filter(log => log.consumedAt >= startOfDay.getTime() && log.consumedAt <= endOfDay.getTime());
  }

  // Get logs for the last N days
  async getLogsForLastDays(days: number): Promise<CoffeeLogEntry[]> {
    const endTime = Date.now();
    const startTime = endTime - (days * 24 * 60 * 60 * 1000);
    const allLogs = await this.getLogs();
    return allLogs.filter(log => log.consumedAt >= startTime && log.consumedAt <= endTime);
  }

  // Delete a log entry
  async deleteLog(id: string): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COFFEE_LOGS_STORE], 'readwrite');
      const store = transaction.objectStore(COFFEE_LOGS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Update a log entry
  async updateLog(entry: CoffeeLogEntry): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COFFEE_LOGS_STORE], 'readwrite');
      const store = transaction.objectStore(COFFEE_LOGS_STORE);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get statistics
  async getStats(): Promise<CoffeeLogStats> {
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.getTime();
    
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

    const allLogs = await this.getLogs();
    
    const todayLogs = allLogs.filter(log => log.consumedAt >= startOfToday && log.consumedAt <= now);
    const weekLogs = allLogs.filter(log => log.consumedAt >= weekAgo && log.consumedAt <= now);
    const monthLogs = allLogs.filter(log => log.consumedAt >= monthAgo && log.consumedAt <= now);

    // Calculate statistics
    const totalCaffeineToday = todayLogs.reduce((sum, log) => sum + log.caffeineMg, 0);
    const totalCaffeineWeek = weekLogs.reduce((sum, log) => sum + log.caffeineMg, 0);
    const totalCaffeineMonth = monthLogs.reduce((sum, log) => sum + log.caffeineMg, 0);
    
    const totalDrinksToday = todayLogs.length;
    const totalDrinksWeek = weekLogs.length;
    const totalDrinksMonth = monthLogs.length;
    
    const averageCaffeinePerDay = weekLogs.length > 0 ? totalCaffeineWeek / 7 : 0;
    
    // Find most consumed coffee
    const coffeeCounts = monthLogs.reduce((acc, log) => {
      acc[log.coffeeName] = (acc[log.coffeeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const sortedCoffees = Object.entries(coffeeCounts).sort(([,a], [,b]) => b - a);
    const mostConsumedCoffee = sortedCoffees[0]?.[0] || 'None';
    const mostConsumedCount = sortedCoffees[0]?.[1] || 0;
    const topFavoriteTied = sortedCoffees.filter(([, count]) => count === mostConsumedCount).length;
    
    // Find peak consumption hour
    const hourCounts = monthLogs.reduce((acc, log) => {
      const hour = new Date(log.consumedAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const peakConsumptionHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 9;
    
    const lastConsumptionTime = monthLogs[0]?.consumedAt || 0;

    // Calculate tracking streak (consecutive days with at least one log, counting back from today)
    let trackingStreak = 0;
    if (todayLogs.length > 0) {
      trackingStreak = 1;
      for (let i = 1; i <= 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(nextD.getDate() + 1);
        const hasLog = allLogs.some(
          (log) => log.consumedAt >= d.getTime() && log.consumedAt < nextD.getTime()
        );
        if (hasLog) trackingStreak++;
        else break;
      }
    }

    // Total distinct days with at least one log (all time)
    const dayKeys = new Set<string>();
    allLogs.forEach((log) => {
      const d = new Date(log.consumedAt);
      d.setHours(0, 0, 0, 0);
      dayKeys.add(d.getTime().toString());
    });
    const totalDaysWithLogs = dayKeys.size;

    return {
      totalCaffeineToday,
      totalCaffeineWeek,
      totalCaffeineMonth,
      averageCaffeinePerDay,
      totalDrinksToday,
      totalDrinksWeek,
      totalDrinksMonth,
      mostConsumedCoffee,
      mostConsumedCount,
      topFavoriteTied,
      peakConsumptionHour: Number(peakConsumptionHour),
      lastConsumptionTime,
      trackingStreak,
      totalDaysWithLogs
    };
  }

  // Clear all logs (for testing/reset)
  async clearAllLogs(): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([COFFEE_LOGS_STORE], 'readwrite');
      const store = transaction.objectStore(COFFEE_LOGS_STORE);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
const coffeeLogDB = new CoffeeLogDB();

// Export functions for easy use
export const addCoffeeLog = async (entry: Omit<CoffeeLogEntry, 'id'>): Promise<string> => {
  return coffeeLogDB.addLog(entry);
};

export const getCoffeeLogs = async (startTime?: number, endTime?: number): Promise<CoffeeLogEntry[]> => {
  return coffeeLogDB.getLogs(startTime, endTime);
};

export const getCoffeeLogsForDay = async (date: Date): Promise<CoffeeLogEntry[]> => {
  return coffeeLogDB.getLogsForDay(date);
};

export const getCoffeeLogsForLastDays = async (days: number): Promise<CoffeeLogEntry[]> => {
  return coffeeLogDB.getLogsForLastDays(days);
};

export const deleteCoffeeLog = async (id: string): Promise<void> => {
  return coffeeLogDB.deleteLog(id);
};

export const updateCoffeeLog = async (entry: CoffeeLogEntry): Promise<void> => {
  return coffeeLogDB.updateLog(entry);
};

export const getCoffeeLogStats = async (): Promise<CoffeeLogStats> => {
  return coffeeLogDB.getStats();
};

export const clearAllCoffeeLogs = async (): Promise<void> => {
  return coffeeLogDB.clearAllLogs();
};

// Initialize the database
export const initCoffeeLogDB = async (): Promise<void> => {
  await coffeeLogDB.init();
};
