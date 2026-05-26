import { computeNextStreak, todayDateString, type StreakData } from './streakCore';

export const STREAK_STORAGE_KEY = 'verse_streak';
export const VOTD_COMPLETED_PREFIX = 'votd_completed_';
export const STREAK_UPDATED_EVENT = 'streakUpdated';

export type StreakUpdateDetail = {
  streak: StreakData;
  isNewCompletion: boolean;
  streakIncreased: boolean;
};

export function yesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

type StreakSyncPayload = {
  streak: StreakData;
  completedDates: string[];
  isNewCompletion?: boolean;
  streakIncreased?: boolean;
};

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

function getCompletedDates(): string[] {
  if (typeof window === 'undefined') return [];

  return Object.keys(localStorage)
    .filter((key) => key.startsWith(VOTD_COMPLETED_PREFIX) && localStorage.getItem(key) === 'true')
    .map((key) => key.slice(VOTD_COMPLETED_PREFIX.length))
    .sort();
}

function writeCompletedDates(dates: string[]) {
  if (typeof window === 'undefined') return;

  Object.keys(localStorage)
    .filter((key) => key.startsWith(VOTD_COMPLETED_PREFIX))
    .forEach((key) => localStorage.removeItem(key));

  dates.forEach((date) => {
    localStorage.setItem(VOTD_COMPLETED_PREFIX + date, 'true');
  });
}

function writeStreakData(streak: StreakData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streak));
}

function dispatchStreakUpdated(detail: StreakUpdateDetail) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<StreakUpdateDetail>(STREAK_UPDATED_EVENT, { detail }));
}

function applySyncedState(payload: StreakSyncPayload, fallbackDetail?: StreakUpdateDetail): StreakUpdateDetail {
  writeCompletedDates(payload.completedDates);
  writeStreakData(payload.streak);

  const detail: StreakUpdateDetail = {
    streak: payload.streak,
    isNewCompletion: payload.isNewCompletion ?? fallbackDetail?.isNewCompletion ?? false,
    streakIncreased: payload.streakIncreased ?? fallbackDetail?.streakIncreased ?? false,
  };

  dispatchStreakUpdated(detail);
  return detail;
}

export async function markTodayCompleted(): Promise<StreakUpdateDetail> {
  const today = todayDateString();
  const alreadyDone = isTodayCompleted();

  if (alreadyDone) {
    const streak = getStreakData();
    return { streak, isNewCompletion: false, streakIncreased: false };
  }

  localStorage.setItem(VOTD_COMPLETED_PREFIX + today, 'true');

  const current = getStreakData();
  const streak = computeNextStreak(current, today);
  writeStreakData(streak);

  const streakIncreased = streak.count > current.count;
  const detail: StreakUpdateDetail = { streak, isNewCompletion: true, streakIncreased };
  dispatchStreakUpdated(detail);

  try {
    const response = await fetch('/api/streak/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: today }),
    });

    if (response.ok) {
      const payload = (await response.json()) as StreakSyncPayload;
      return applySyncedState(payload, detail);
    }

    if (response.status !== 401) {
      console.error('Failed to persist streak completion:', await response.text());
    }
  } catch (error) {
    console.error('Failed to sync streak completion:', error);
  }

  return detail;
}

export async function syncStreakToAccount(): Promise<StreakData | null> {
  try {
    const response = await fetch('/api/streak/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        completedDates: getCompletedDates(),
      }),
    });

    if (!response.ok) {
      if (response.status !== 401) {
        console.error('Failed to sync streak:', await response.text());
      }
      return null;
    }

    const payload = (await response.json()) as StreakSyncPayload;
    const detail = applySyncedState(payload);
    return detail.streak;
  } catch (error) {
    console.error('Failed to sync streak to account:', error);
    return null;
  }
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
