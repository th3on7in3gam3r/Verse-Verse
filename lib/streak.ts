export const STREAK_STORAGE_KEY = 'verse_streak';
export const VOTD_COMPLETED_PREFIX = 'votd_completed_';
export const STREAK_UPDATED_EVENT = 'streakUpdated';

export type StreakData = {
  count: number;
  lastActiveDate: string | null;
};

export type StreakUpdateDetail = {
  streak: StreakData;
  isNewCompletion: boolean;
  streakIncreased: boolean;
};

export function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function yesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export function getStreakData(): StreakData {
  if (typeof window === 'undefined') return { count: 0, lastActiveDate: null };
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) return { count: 0, lastActiveDate: null };
    const parsed = JSON.parse(raw);
    return {
      count: typeof parsed.count === 'number' ? parsed.count : 0,
      lastActiveDate: typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : null,
    };
  } catch {
    return { count: 0, lastActiveDate: null };
  }
}

export function isTodayCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(VOTD_COMPLETED_PREFIX + todayDateString()) === 'true';
}

export function isDateCompleted(date: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(VOTD_COMPLETED_PREFIX + date) === 'true';
}

export function markTodayCompleted(): StreakUpdateDetail {
  const today = todayDateString();
  const alreadyDone = isTodayCompleted();

  if (alreadyDone) {
    const streak = getStreakData();
    return { streak, isNewCompletion: false, streakIncreased: false };
  }

  localStorage.setItem(VOTD_COMPLETED_PREFIX + today, 'true');

  const current = getStreakData();
  const yesterday = yesterdayDateString();
  let newCount = 1;

  if (current.lastActiveDate === yesterday) {
    newCount = current.count + 1;
  } else if (current.lastActiveDate === today) {
    newCount = Math.max(current.count, 1);
  } else {
    newCount = 1;
  }

  const streak: StreakData = { count: newCount, lastActiveDate: today };
  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));

  const streakIncreased = newCount > current.count;
  const detail: StreakUpdateDetail = { streak, isNewCompletion: true, streakIncreased };

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<StreakUpdateDetail>(STREAK_UPDATED_EVENT, { detail }));
  }

  return detail;
}

export function getWeekCompletionMap(): { dates: string[]; completions: Record<string, boolean> } {
  const today = new Date();
  const dow = today.getDay();
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - dow + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  const completions: Record<string, boolean> = {};
  dates.forEach((d) => {
    completions[d] = isDateCompleted(d);
  });
  return { dates, completions };
}

export function getMilestoneLabel(count: number): string {
  if (count >= 30) return '👑 Devoted Disciple';
  if (count >= 14) return '✨ Faithful Light';
  if (count >= 7) return '🌟 Spiritual Devotee';
  if (count >= 3) return '🔥 Faithful Tracker';
  return '🌱 Mindful Starter';
}

export function getNextMilestone(count: number): { target: number; label: string; remaining: number } | null {
  const milestones = [
    { target: 3, label: 'Faithful Tracker' },
    { target: 7, label: 'Spiritual Devotee' },
    { target: 14, label: 'Faithful Light' },
    { target: 30, label: 'Devoted Disciple' },
  ];
  const next = milestones.find((m) => count < m.target);
  if (!next) return null;
  return { ...next, remaining: next.target - count };
}

export function isStreakAtRisk(): boolean {
  const { count, lastActiveDate } = getStreakData();
  if (count === 0) return false;
  if (isTodayCompleted()) return false;
  const today = todayDateString();
  const yesterday = yesterdayDateString();
  return lastActiveDate === yesterday && lastActiveDate !== today;
}
