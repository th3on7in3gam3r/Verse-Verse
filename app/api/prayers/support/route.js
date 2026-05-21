import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function PATCH(request) {
  try {
    const { prayerId } = await request.json();

    if (!prayerId) {
      return NextResponse.json({ error: 'Missing prayerId' }, { status: 400 });
    }

    const updatedPrayer = await prisma.prayer.update({
      where: { id: prayerId },
      data: {
        supportCount: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true, prayer: updatedPrayer });
  } catch (error) {
    console.error('Error updating prayer support:', error);
    return NextResponse.json({ error: 'Failed to update support count' }, { status: 500 });
  }
}
