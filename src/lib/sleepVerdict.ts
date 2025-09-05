export type VerdictCode = "green" | "yellow" | "red";

import { caffeineRemaining } from "@/lib/caffeine";

export type SleepVerdict = {
  code: VerdictCode;
  chip: string; // Simple status for quick glance
  headline: string; // User-friendly outcome
  detail: string; // Personalized context
  suggestion: string; // Actionable alternative
  remainingMg: number; // For internal calculations only
};

export const getSleepVerdict = (
  mg: number,
  hoursUntilBed: number,
  halfLife = 5
): SleepVerdict => {
  const remaining = caffeineRemaining(mg, hoursUntilBed, halfLife);
  const bedtimeHours = Math.round(hoursUntilBed * 10) / 10;

  // Safe Sip: Less than 50mg remaining - good for sleep
  if (remaining < 50) {
    return {
      code: "green",
      chip: "Safe Sip",
      headline: "Safe for your sleep schedule",
      detail: `Great choice! This gives you energy now and lets you wind down naturally by bedtime (${bedtimeHours}h from now).`,
      suggestion: "You could even go for a larger size if you want more energy.",
      remainingMg: remaining,
    };
  }

  // Suspect Brew: 50-100mg remaining - might keep you awake 1-2 hours
  if (remaining <= 100) {
    return {
      code: "yellow",
      chip: "Suspect Brew",
      headline: "Could push bedtime back an hour or two",
      detail: `This will energize you now but might keep you awake 1-2 hours past your usual bedtime (${bedtimeHours}h from now).`,
      suggestion: "Try a smaller size or switch to something lighter for better sleep.",
      remainingMg: remaining,
    };
  }

  // Night Breach: More than 100mg remaining - won't sleep before 2am
  return {
    code: "red",
    chip: "Night Breach",
    headline: "Will keep you awake past 2am",
    detail: `This much caffeine will keep you wired well past your bedtime (${bedtimeHours}h from now) - you'll be scrolling your phone at 2AM.`,
    suggestion: "Try decaf or tea instead - you'll thank yourself tomorrow.",
    remainingMg: remaining,
  };
};