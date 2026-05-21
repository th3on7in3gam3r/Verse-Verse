import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSessionUser } from '../../../lib/auth';

// GET all saved prayers for current user
export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const journal = await prisma.savedPrayer.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ journal });
  } catch (error) {
    console.error('Error fetching journal:', error);
    return NextResponse.json({ error: 'Failed to retrieve journal entries.' }, { status: 500 });
  }
}

// POST a new saved prayer to journal
export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { feeling, prayer, verses } = await request.json();

    if (!feeling || !prayer) {
      return NextResponse.json({ error: 'Missing feeling or prayer details.' }, { status: 400 });
    }

    // Save to PostgreSQL
    const saved = await prisma.savedPrayer.create({
      data: {
        feeling,
        prayer,
        verses: verses || '',
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, entry: saved });
  } catch (error) {
    console.error('Error saving to journal:', error);
    return NextResponse.json({ error: 'Failed to save prayer to journal.' }, { status: 500 });
  }
}

// PATCH to update isAnswered and answerUpdate fields
export async function PATCH(request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const { entryId, isAnswered, answerUpdate } = await request.json();

    if (!entryId) {
      return NextResponse.json({ error: 'Missing entryId.' }, { status: 400 });
    }

    // Verify user owns the entry
    const entry = await prisma.savedPrayer.findFirst({
      where: { id: entryId, userId: user.id },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found or unauthorized.' }, { status: 404 });
    }

    const updated = await prisma.savedPrayer.update({
      where: { id: entryId },
      data: {
        isAnswered: isAnswered !== undefined ? isAnswered : entry.isAnswered,
        answerUpdate: answerUpdate !== undefined ? answerUpdate : entry.answerUpdate,
      },
    });

    return NextResponse.json({ success: true, entry: updated });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return NextResponse.json({ error: 'Failed to update journal entry.' }, { status: 500 });
  }
}
