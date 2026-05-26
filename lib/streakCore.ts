export type StreakData = {
  count: number;
  lastActiveDate: string | null;
};

export function todayDateString(now: Date = new Date()): string {
  return now.toISOString().split('T')[0];
}

export function previousDateString(dateString: string = todayDateString()): string {
  const d = new Date(`${dateString}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return false;

  return parsed.toISOString().split('T')[0] === value;
}

export function normalizeDateStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(isValidDateString))).sort();
}

export function computeNextStreak(current: StreakData, completionDate: string): StreakData {
  const previousDate = previousDateString(completionDate);

  if (current.lastActiveDate === previousDate) {
    return {
      count: current.count + 1,
      lastActiveDate: completionDate,
    };
  }

  if (current.lastActiveDate === completionDate) {
    return {
      count: Math.max(current.count, 1),
      lastActiveDate: completionDate,
    };
  }

  return {
    count: 1,
    lastActiveDate: completionDate,
  };
}

export function computeStreakFromDates(dateStrings: string[]): StreakData {
  const normalized = normalizeDateStrings(dateStrings);
  if (normalized.length === 0) {
    return { count: 0, lastActiveDate: null };
  }

  let count = 1;
  let cursor = normalized[normalized.length - 1];

  for (let i = normalized.length - 2; i >= 0; i -= 1) {
    const candidate = normalized[i];
    if (candidate !== previousDateString(cursor)) {
      break;
    }

    count += 1;
    cursor = candidate;
  }

  return {
    count,
    lastActiveDate: normalized[normalized.length - 1],
  };
}
