// User preferences management system
export interface UserPreferences {
  bedtime: string;           // HH:mm format (24h)
  serving_size: number;      // oz (8, 12, 16, 20)
  shots: 1 | 2;             // espresso shots
  theme: 'light' | 'dark';   // UI theme
  notifications: boolean;    // push notifications
  caffeine_limit: number;    // daily caffeine limit (mg)
  timezone: string;          // user's timezone
}

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  bedtime: '23:00',
  serving_size: 12,
  shots: 1,
  theme: 'light',
  notifications: true,
  caffeine_limit: 400,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

// Storage key
const STORAGE_KEY = 'coffeepolice_preferences';

// Helper functions for localStorage with error handling
const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
    return null;
  }
};

const setStorageItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('Failed to write to localStorage:', error);
    return false;
  }
};

// Load user preferences from localStorage
export const loadPreferences = (): UserPreferences => {
  try {
    const stored = getStorageItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle missing properties
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to parse stored preferences:', error);
  }
  
  // Return defaults if no stored preferences or error
  return { ...DEFAULT_PREFERENCES };
};

// Save user preferences to localStorage
export const savePreferences = (preferences: Partial<UserPreferences>): boolean => {
  try {
    const current = loadPreferences();
    const updated = { ...current, ...preferences };
    const success = setStorageItem(STORAGE_KEY, JSON.stringify(updated));
    
    if (success) {
      // Dispatch custom event for other components to listen to
      window.dispatchEvent(new CustomEvent('preferencesUpdated', { 
        detail: updated 
      }));
    }
    
    return success;
  } catch (error) {
    console.warn('Failed to save preferences:', error);
    return false;
  }
};

// Update a single preference
export const updatePreference = <K extends keyof UserPreferences>(
  key: K, 
  value: UserPreferences[K]
): boolean => {
  return savePreferences({ [key]: value });
};

// Reset preferences to defaults
export const resetPreferences = (): boolean => {
  return savePreferences(DEFAULT_PREFERENCES);
};

// Get a single preference with fallback to default
export const getPreference = <K extends keyof UserPreferences>(
  key: K
): UserPreferences[K] => {
  const preferences = loadPreferences();
  return preferences[key];
};

// Validate preference values
export const validatePreferences = (preferences: Partial<UserPreferences>): boolean => {
  const validators: Record<string, (value: any) => boolean> = {
    bedtime: (value: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
    serving_size: (value: number) => [8, 12, 16, 20].includes(value),
    shots: (value: number) => [1, 2].includes(value),
    theme: (value: string) => ['light', 'dark'].includes(value),
    notifications: (value: boolean) => typeof value === 'boolean',
    caffeine_limit: (value: number) => value > 0 && value <= 1000,
    timezone: (value: string) => typeof value === 'string' && value.length > 0
  };

  for (const [key, value] of Object.entries(preferences)) {
    const validator = validators[key];
    if (validator && !validator(value)) {
      console.warn(`Invalid preference value for ${key}:`, value);
      return false;
    }
  }
  
  return true;
};
