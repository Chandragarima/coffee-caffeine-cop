import { useMemo, useEffect, useRef } from 'react';
import { useCoffeeLogs } from './useCoffeeLogs';
import { useSleepCheckin } from './useSleepCheckin';
import { usePreferences } from './usePreferences';
import {
  computeProfile,
  getEarnedBadgeIds,
  saveEarnedBadgeIds,
  BadgeId,
  CaffeineProfile,
} from '@/lib/caffeineProfile';
import { toast } from '@/components/ui/sonner';

export const useCaffeineProfile = () => {
  const { logs, stats } = useCoffeeLogs();
  const sleepCheckin = useSleepCheckin();
  const { sensitivity } = usePreferences();
  const prevEarnedRef = useRef<BadgeId[]>(getEarnedBadgeIds());

  const profile: CaffeineProfile = useMemo(() => {
    return computeProfile(sleepCheckin.checkins, logs, stats, sensitivity);
  }, [sleepCheckin.checkins, logs, stats, sensitivity]);

  // Detect new badge unlocks
  useEffect(() => {
    const currentlyEarned = profile.badges.filter((b) => b.earned).map((b) => b.id);
    const prev = prevEarnedRef.current;
    const newBadges = currentlyEarned.filter((id) => !prev.includes(id));

    if (newBadges.length > 0) {
      saveEarnedBadgeIds(currentlyEarned);
      prevEarnedRef.current = currentlyEarned;

      // Show toast for each new badge
      for (const badgeId of newBadges) {
        const badge = profile.badges.find((b) => b.id === badgeId);
        if (badge) {
          toast.success(`Badge unlocked: ${badge.name}`, {
            description: badge.description,
            duration: 5000,
          });
        }
      }
    }
  }, [profile]);

  return {
    profile,
    ...sleepCheckin,
  };
};
