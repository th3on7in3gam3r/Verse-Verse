import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSessionUser } from '../../../../lib/auth';
import { normalizeDateStrings } from '../../../../lib/streakCore';
import { persistUserStreakState } from '../../../../lib/streakServer';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const completedDates = normalizeDateStrings(Array.isArray(body?.completedDates) ? body.completedDates : []);

    if (completedDates.length > 0) {
      await prisma.userStreakDay.createMany({
        data: completedDates.map((dateKey) => ({
          userId: user.id,
          dateKey,
        })),
        skipDuplicates: true,
      });
    }

    const state = await persistUserStreakState(user.id);
    return NextResponse.json(state);
  } catch (error) {
    console.error('Error syncing streak:', error);
    return NextResponse.json({ error: 'Failed to sync streak.' }, { status: 500 });
  }
}
