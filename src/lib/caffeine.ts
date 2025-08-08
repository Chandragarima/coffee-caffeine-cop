import { getTimeOfDay } from "@/hooks/useTimeOfDay";

export const caffeineRemaining = (mg: number, hours: number, halfLife = 5) => {
  // exponential decay: remaining = mg * 0.5^(t / halfLife)
  if (mg <= 0) return 0;
  if (hours <= 0) return mg;
  const remaining = mg * Math.pow(0.5, hours / halfLife);
  return Math.max(0, Math.round(remaining));
};

export const getMilestones = (mg: number, halfLife = 5) => {
  const half = halfLife; // 50%
  const quarter = halfLife * 2; // 25%
  return [
    { label: "Half-life", hours: half, remaining: caffeineRemaining(mg, half, halfLife) },
    { label: "Quarter-life", hours: quarter, remaining: caffeineRemaining(mg, quarter, halfLife) },
  ];
};

export { getTimeOfDay };
