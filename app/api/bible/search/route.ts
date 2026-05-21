import { NextResponse } from 'next/server';
import { BIBLE_TRANSLATION_IDS, classifyBibleError, searchBibleVerses } from '../../../../lib/bible';

const VALID_TRANSLATIONS = Object.keys(BIBLE_TRANSLATION_IDS) as (keyof typeof BIBLE_TRANSLATION_IDS)[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const translationParam = (searchParams.get('translation') || 'NIV').toUpperCase();

  if (!query) {
    return NextResponse.json(
      { error: 'Missing required query parameter: q', code: 'BAD_REQUEST' },
      { status: 400 },
    );
  }

  if (!VALID_TRANSLATIONS.includes(translationParam as keyof typeof BIBLE_TRANSLATION_IDS)) {
    return NextResponse.json(
      {
        error: `Invalid translation "${translationParam}". Use one of: ${VALID_TRANSLATIONS.join(', ')}`,
        code: 'BAD_REQUEST',
      },
      { status: 400 },
    );
  }

  const translation = translationParam as keyof typeof BIBLE_TRANSLATION_IDS;

  try {
    const results = await searchBibleVerses(query, translation);
    return NextResponse.json({ results });
  } catch (error) {
    const { status, code, error: message, detail } = classifyBibleError(error);
    console.error('Bible search error:', detail ?? error);
    return NextResponse.json({ error: message, code, ...(detail && { detail }) }, { status });
  }
}
