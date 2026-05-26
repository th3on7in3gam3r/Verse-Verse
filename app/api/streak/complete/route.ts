import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSessionUser } from '../../../../lib/auth';
import { isValidDateString, todayDateString } from '../../../../lib/streakCore';
import { getUserStreakState, persistUserStreakState } from '../../../../lib/streakServer';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const dateKey = typeof body?.date === 'string' && isValidDateString(body.date)
      ? body.date
      : todayDateString();
    const previousState = await getUserStreakState(user.id);

    const existingDay = await prisma.userStreakDay.findUnique({
      where: {
        userId_dateKey: {
          userId: user.id,
          dateKey,
        },
      },
      select: { id: true },
    });

    await prisma.userStreakDay.upsert({
      where: {
        userId_dateKey: {
          userId: user.id,
          dateKey,
        },
      },
      update: {},
      create: {
        userId: user.id,
        dateKey,
      },
    });

    const state = await persistUserStreakState(user.id);
    const streakIncreased = state.streak.count > previousState.streak.count;

    return NextResponse.json({
      ...state,
      isNewCompletion: !existingDay,
      streakIncreased: !existingDay && streakIncreased,
    });
  } catch (error) {
    console.error('Error completing streak day:', error);
    return NextResponse.json({ error: 'Failed to record streak.' }, { status: 500 });
  }
}
