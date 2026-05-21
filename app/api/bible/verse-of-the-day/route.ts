import { NextResponse } from 'next/server';
import { fetchDailyVerse } from '../../../../lib/bible';

export async function GET() {
  try {
    const verse = await fetchDailyVerse('NIV');
    return NextResponse.json({ verse });
  } catch (error: any) {
    console.error('Verse of the day error:', error);
    return NextResponse.json({ error: String(error.message ?? error) }, { status: 500 });
  }
}
