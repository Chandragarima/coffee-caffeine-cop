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

  if (remaining < 50) {
    return {
      code: "green",
      chip: "😴 Sleep well tonight",
      headline: "Perfect timing",
      detail: `Great choice! This gives you energy now and lets you wind down naturally by bedtime (${bedtimeHours}h from now).`,
      suggestion: "You could even go for a larger size if you want more energy.",
      remainingMg: remaining,
    };
  }

  if (remaining <= 100) {
    return {
      code: "yellow",
      chip: "😪 Might toss a bit",
      headline: "Okay choice",
      detail: `This will energize you now but might make it a bit harder to fall asleep at your usual bedtime (${bedtimeHours}h from now).`,
      suggestion: "Try a smaller size or switch to something lighter for better sleep.",
      remainingMg: remaining,
    };
  }

  return {
    code: "red",
    chip: "🔴 2AM energy crash",
    headline: "Skip this one",
    detail: `This much caffeine will keep you wired well past your bedtime (${bedtimeHours}h from now) - you'll be scrolling your phone at 2AM.`,
    suggestion: "Try decaf or tea instead - you'll thank yourself tomorrow.",
    remainingMg: remaining,
  };
};