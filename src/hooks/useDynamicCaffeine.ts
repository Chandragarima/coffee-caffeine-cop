import { useMemo } from 'react';
import { CoffeeItem } from '@/data/coffees';
import { adjustedMg } from '@/lib/serving';
import { usePreferences } from './usePreferences';

/**
 * Hook to calculate dynamic caffeine amount based on user preferences
 * Returns the adjusted caffeine amount for a coffee based on current size and shots
 */
export const useDynamicCaffeine = (coffee: CoffeeItem): number => {
  const { sizeOz, shots, shotsManuallySet, isLoading } = usePreferences();
  
  return useMemo(() => {
    // If preferences are still loading, use defaults to prevent NaN
    if (isLoading) {
      return adjustedMg(coffee, 12, 1, false);
    }
    
    // Ensure values are properly typed before passing to adjustedMg
    const validSizeOz = (typeof sizeOz === 'number' && [8, 12, 16, 20, 24].includes(sizeOz)) ? sizeOz : 12;
    const validShots = (typeof shots === 'number' && [1, 2, 3].includes(shots)) ? shots : 1;
    const validShotsManuallySet = typeof shotsManuallySet === 'boolean' ? shotsManuallySet : false;
    
    return adjustedMg(coffee, validSizeOz, validShots, validShotsManuallySet);
  }, [coffee, sizeOz, shots, shotsManuallySet, isLoading]);
};

/**
 * Hook to get dynamic coffee data with adjusted caffeine
 * Useful for sorting and displaying coffee lists
 */
export const useDynamicCoffee = (coffee: CoffeeItem) => {
  const dynamicCaffeine = useDynamicCaffeine(coffee);
  
  return useMemo(() => ({
    ...coffee,
    dynamicCaffeine,
    displayCaffeine: dynamicCaffeine
  }), [coffee, dynamicCaffeine]);
};
