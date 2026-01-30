// User preferences management system
export interface UserPreferences {
  bedtime: string;           // HH:mm format (24h)
  serving_size: number;      // oz (8, 12, 16, 20)
  shots: 1 | 2 | 3;         // espresso shots
  shots_manually_set: boolean; // whether user has manually changed shots
  notifications: boolean;    // push notifications
  caffeine_limit: number;    // daily caffeine limit (mg)
  timezone: string;          // user's timezone
  favorite_coffees: string[]; // coffee IDs the user has favorited
  wake_time?: string;       // HH:mm for morning reminder
  sensitivity?: 'low' | 'moderate' | 'high' | 'auto'; // sleep sensitivity
  notification_morning?: boolean; // morning reminder on/off
  notification_cutoff?: boolean;  // cutoff warning on/off
  quick_log_mode?: boolean; // instant log without dialog
}

// Default preferences
export const DEFAULT_PREFERENCES: UserPreferences = {
  bedtime: '23:00',
  serving_size: 12,
  shots: 1,
  shots_manually_set: false,
  notifications: true,
  caffeine_limit: 400,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  favorite_coffees: [],
  wake_time: '07:00',
  sensitivity: 'auto',
  notification_morning: false,
  notification_cutoff: false,
  quick_log_mode: false
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
      const merged = { ...DEFAULT_PREFERENCES, ...parsed };
      
      // Validate critical numeric values to prevent NaN issues
      if (typeof merged.shots !== 'number' || ![1, 2, 3].includes(merged.shots)) {
        console.warn('Invalid shots value in preferences, using default:', merged.shots);
        merged.shots = DEFAULT_PREFERENCES.shots;
      }
      
      if (typeof merged.serving_size !== 'number' || ![8, 12, 16, 20, 24].includes(merged.serving_size)) {
        console.warn('Invalid serving_size value in preferences, using default:', merged.serving_size);
        merged.serving_size = DEFAULT_PREFERENCES.serving_size;
      }
      
      // Validate shots_manually_set flag
      if (typeof merged.shots_manually_set !== 'boolean') {
        console.warn('Invalid shots_manually_set value in preferences, using default:', merged.shots_manually_set);
        merged.shots_manually_set = DEFAULT_PREFERENCES.shots_manually_set;
      }
      
      return merged;
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

/** Format "HH:mm" (24h) as display string e.g. "11:00 PM". */
export function formatTimeForDisplay(hhmm: string): string {
  const [hh = 0, mm = 0] = hhmm.split(':').map(Number);
  const hour = hh % 24;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${String(mm).padStart(2, '0')} ${period}`;
}

/** Caffeine cutoff time (8h before bedtime) in "HH:mm" 24h. */
export function getCutoffTime(bedtime: string): string {
  const [h = 23, m = 0] = bedtime.split(':').map(Number);
  const cutoffMinutes = (h * 60 + m) - 8 * 60;
  const normalized = (cutoffMinutes + 24 * 60) % (24 * 60);
  const ch = Math.floor(normalized / 60);
  const cm = normalized % 60;
  return `${String(ch).padStart(2, '0')}:${String(cm).padStart(2, '0')}`;
}

// Validate preference values
export const validatePreferences = (preferences: Partial<UserPreferences>): boolean => {
  const validators: Record<keyof UserPreferences, (value: any) => boolean> = {
    bedtime: (value: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value),
    serving_size: (value: number) => [8, 12, 16, 20, 24].includes(value),
    shots: (value: number) => [1, 2, 3].includes(value),
    shots_manually_set: (value: boolean) => typeof value === 'boolean',
    notifications: (value: boolean) => typeof value === 'boolean',
    caffeine_limit: (value: number) => value > 0 && value <= 1000,
    timezone: (value: string) => typeof value === 'string' && value.length > 0,
    favorite_coffees: (value: unknown) => Array.isArray(value) && value.every((id) => typeof id === 'string'),
    wake_time: (value: unknown) => value == null || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(String(value)),
    sensitivity: (value: unknown) => value == null || ['low', 'moderate', 'high', 'auto'].includes(String(value)),
    notification_morning: (value: unknown) => value == null || typeof value === 'boolean',
    notification_cutoff: (value: unknown) => value == null || typeof value === 'boolean',
    quick_log_mode: (value: unknown) => value == null || typeof value === 'boolean'
  };

  for (const [key, value] of Object.entries(preferences)) {
    const validator = validators[key as keyof UserPreferences];
    if (validator && !validator(value)) {
      console.warn(`Invalid preference value for ${key}:`, value);
      return false;
    }
  }

  return true;
};
