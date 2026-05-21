import { NextResponse } from 'next/server';
import { fetchBiblePassage } from '../../../../lib/bible';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('ref')?.trim();
  const translation = (searchParams.get('translation') || 'NIV') as 'NIV' | 'ESV' | 'KJV';

  if (!reference) {
    return NextResponse.json({ error: 'Missing ref parameter' }, { status: 400 });
  }

  try {
    const verse = await fetchBiblePassage(reference, translation);
    return NextResponse.json({ verse });
  } catch (error: any) {
    console.error('Bible passage error:', error);
    return NextResponse.json({ error: String(error.message ?? error) }, { status: 500 });
  }
}
