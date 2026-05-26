import { prisma } from './prisma';
import { computeStreakFromDates, normalizeDateStrings, type StreakData } from './streakCore';

export async function getUserStreakState(userId: string): Promise<{ streak: StreakData; completedDates: string[] }> {
  const streakDays = await prisma.userStreakDay.findMany({
    where: { userId },
    orderBy: { dateKey: 'asc' },
    select: { dateKey: true },
  });

  const completedDates = normalizeDateStrings(streakDays.map((entry) => entry.dateKey));
  const streak = computeStreakFromDates(completedDates);

  return { streak, completedDates };
}

export async function persistUserStreakState(userId: string) {
  const state = await getUserStreakState(userId);

  await prisma.user.update({
    where: { id: userId },
    data: {
      streakCount: state.streak.count,
      lastStreakDateKey: state.streak.lastActiveDate,
    },
  });

  return state;
}
