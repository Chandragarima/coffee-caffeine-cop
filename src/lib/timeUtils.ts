// --- Local date helpers (we always operate in local time, never UTC) ---

/** Return YYYY-MM-DD for the given date in local time. */
export const getLocalDateString = (date: Date | number): string => {
  const d = typeof date === 'number' ? new Date(date) : new Date(date.getTime());
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Parse "YYYY-MM-DD" as local midnight (not UTC). Avoids timezone bugs when user selects "today". */
export const parseLocalDateString = (isoDateStr: string): Date => {
  const [y, m, d] = isoDateStr.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
};

// hoursUntil: compute hours from now until a given HH:mm bedtime (today or tomorrow)
export const hoursUntil = (timeStr: string, now: Date = new Date()): number => {
  const [hh, mm] = timeStr.split(":").map(Number);
  const bed = new Date(now);
  bed.setHours(hh ?? 23, mm ?? 0, 0, 0);
  if (bed.getTime() <= now.getTime()) {
    bed.setDate(bed.getDate() + 1);
  }
  const ms = bed.getTime() - now.getTime();
  return Math.max(0, ms / 36e5);
};

// Get current local time in HH:mm format
export const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Compute hours from current time to bedtime HH:mm within 24h window
export const hoursUntilBedtime = (bedHHMM: string): number => {
  const now = new Date();
  const [bh, bm] = bedHHMM.split(":").map(Number);
  const bed = new Date(now);
  bed.setHours(bh ?? 23, bm ?? 0, 0, 0);
  
  // If bedtime is earlier today, it means tomorrow
  if (bed.getTime() <= now.getTime()) {
    bed.setDate(bed.getDate() + 1);
  }
  
  const diffMs = bed.getTime() - now.getTime();
  return Math.max(0, diffMs / (1000 * 60 * 60)); // Convert to hours
};
