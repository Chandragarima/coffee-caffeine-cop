// Google Analytics utility for tracking custom events
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Check if gtag is available
const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (isGtagAvailable()) {
    window.gtag('event', eventName, parameters);
  }
};

// Track coffee log events
export const trackCoffeeLog = (source: 'recommendations' | 'explore' | 'quick_log' | 'detail_dialog', coffee: {
  id: string;
  name: string;
  caffeineMg: number;
  category?: string;
}) => {
  trackEvent('coffee_logged', {
    source,
    coffee_id: coffee.id,
    coffee_name: coffee.name,
    caffeine_mg: coffee.caffeineMg,
    coffee_category: coffee.category,
    timestamp: new Date().toISOString()
  });
};

// Track coffee selection/view events
export const trackCoffeeView = (source: 'recommendations' | 'explore' | 'search', coffee: {
  id: string;
  name: string;
  caffeineMg: number;
  category?: string;
}) => {
  trackEvent('coffee_viewed', {
    source,
    coffee_id: coffee.id,
    coffee_name: coffee.name,
    caffeine_mg: coffee.caffeineMg,
    coffee_category: coffee.category
  });
};

// Track page views
export const trackPageView = (pageName: string, pagePath?: string) => {
  trackEvent('page_view', {
    page_name: pageName,
    page_path: pagePath || window.location.pathname
  });
};

// Track user interactions
export const trackUserInteraction = (action: string, element: string, context?: string) => {
  trackEvent('user_interaction', {
    action,
    element,
    context,
    timestamp: new Date().toISOString()
  });
};

// Track search events
export const trackSearch = (query: string, resultsCount: number, source: 'explore' | 'autocomplete') => {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
    search_source: source
  });
};

// Track recommendation interactions
export const trackRecommendationInteraction = (action: 'view' | 'log' | 'refresh', coffeeId?: string) => {
  trackEvent('recommendation_interaction', {
    action,
    coffee_id: coffeeId,
    timestamp: new Date().toISOString()
  });
};

// Track settings changes
export const trackSettingsChange = (setting: string, oldValue: any, newValue: any) => {
  trackEvent('settings_change', {
    setting_name: setting,
    old_value: oldValue,
    new_value: newValue,
    timestamp: new Date().toISOString()
  });
};
