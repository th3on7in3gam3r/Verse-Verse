import { NextResponse } from 'next/server';
import { searchBibleVerses } from '../../../../lib/bible';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const translation = (searchParams.get('translation') || 'NIV') as 'NIV' | 'ESV' | 'KJV';

  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    const results = await searchBibleVerses(query, translation);
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Bible search error:', error);
    return NextResponse.json({ error: String(error.message ?? error) }, { status: 500 });
  }
}
