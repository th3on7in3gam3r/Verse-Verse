import { NextResponse } from 'next/server';
import { getSessionUser } from '../../../lib/auth';
import { getUserStreakState } from '../../../lib/streakServer';

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const state = await getUserStreakState(user.id);
    return NextResponse.json(state);
  } catch (error) {
    console.error('Error fetching streak:', error);
    return NextResponse.json({ error: 'Failed to fetch streak.' }, { status: 500 });
  }
}
