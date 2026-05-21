import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { decryptSession } from '../../../lib/auth';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const verseId = searchParams.get('verseId');

    if (!verseId) {
      return NextResponse.json({ error: 'Missing verseId' }, { status: 400 });
    }

    const prayers = await prisma.prayer.findMany({
      where: { verseId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, prayers });
  } catch (error) {
    console.error('Error fetching prayers:', error);
    return NextResponse.json({ error: 'Failed to fetch prayers' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    
    // We allow anonymous prayers if they just provide an author name, 
    // but if they are logged in, we link it to their account.
    let userId = null;
    let authorName = 'Anonymous';

    if (sessionToken) {
      const payload = decryptSession(sessionToken);
      if (payload?.userId) {
        userId = payload.userId;
        // Fetch user name
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user) authorName = user.name;
      }
    }

    const { verseId, text, author } = await request.json();

    if (!verseId || !text) {
      return NextResponse.json({ error: 'Missing verseId or text' }, { status: 400 });
    }

    // Override author if provided and not logged in
    if (!userId && author) {
      authorName = author;
    }

    const newPrayer = await prisma.prayer.create({
      data: {
        verseId,
        text,
        author: authorName,
        userId
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json({ success: true, prayer: newPrayer });
  } catch (error) {
    console.error('Error saving prayer:', error);
    return NextResponse.json({ error: 'Failed to save prayer' }, { status: 500 });
  }
}
