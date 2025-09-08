// Event system for coordinating component updates
export const EVENTS = {
  COFFEE_LOGGED: 'coffeeLogged',
  COFFEE_DELETED: 'coffeeDeleted',
  CAFFEINE_TRACKER_REFRESH: 'caffeineTrackerRefresh'
} as const;

// Custom event dispatchers
export const emitCoffeeLogged = (coffeeData?: any) => {
  window.dispatchEvent(new CustomEvent(EVENTS.COFFEE_LOGGED, { 
    detail: coffeeData 
  }));
};

export const emitCoffeeDeleted = (coffeeId?: string) => {
  window.dispatchEvent(new CustomEvent(EVENTS.COFFEE_DELETED, { 
    detail: { coffeeId } 
  }));
};

export const emitCaffeineTrackerRefresh = () => {
  window.dispatchEvent(new CustomEvent(EVENTS.CAFFEINE_TRACKER_REFRESH));
};

// Event listener helpers
export const addCoffeeLoggedListener = (callback: (event: CustomEvent) => void) => {
  window.addEventListener(EVENTS.COFFEE_LOGGED, callback as EventListener);
  return () => window.removeEventListener(EVENTS.COFFEE_LOGGED, callback as EventListener);
};

export const addCoffeeDeletedListener = (callback: (event: CustomEvent) => void) => {
  window.addEventListener(EVENTS.COFFEE_DELETED, callback as EventListener);
  return () => window.removeEventListener(EVENTS.COFFEE_DELETED, callback as EventListener);
};

export const addCaffeineTrackerRefreshListener = (callback: (event: CustomEvent) => void) => {
  window.addEventListener(EVENTS.CAFFEINE_TRACKER_REFRESH, callback as EventListener);
  return () => window.removeEventListener(EVENTS.CAFFEINE_TRACKER_REFRESH, callback as EventListener);
};
