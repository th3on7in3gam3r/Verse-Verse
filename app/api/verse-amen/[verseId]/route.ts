import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ verseId: string }> }) {
  const { verseId } = await context.params;
  if (!verseId) {
    return NextResponse.json({ error: 'Missing verseId parameter' }, { status: 400 });
  }

  try {
    const record = await prisma.verseStat.findUnique({ where: { verseId } });
    return NextResponse.json({ verseId, amenCount: record?.amenCount ?? 0 });
  } catch (error: any) {
    console.error('Amen fetch error:', error);
    return NextResponse.json({ error: String(error.message ?? error) }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ verseId: string }> }) {
  const { verseId } = await context.params;
  if (!verseId) {
    return NextResponse.json({ error: 'Missing verseId parameter' }, { status: 400 });
  }

  try {
    const record = await prisma.verseStat.upsert({
      where: { verseId },
      update: { amenCount: { increment: 1 } },
      create: { verseId, amenCount: 1 },
    });

    return NextResponse.json({ verseId, amenCount: record.amenCount });
  } catch (error: any) {
    console.error('Amen increment error:', error);
    return NextResponse.json({ error: String(error.message ?? error) }, { status: 500 });
  }
}
