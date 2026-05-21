import { NextResponse } from 'next/server';
import { BIBLE_TRANSLATION_IDS, classifyBibleError, fetchBiblePassage } from '../../../../lib/bible';

const VALID_TRANSLATIONS = Object.keys(BIBLE_TRANSLATION_IDS) as (keyof typeof BIBLE_TRANSLATION_IDS)[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('ref')?.trim();
  const translationParam = (searchParams.get('translation') || 'NIV').toUpperCase();

  if (!reference) {
    return NextResponse.json(
      { error: 'Missing required query parameter: ref (e.g. ?ref=John+3:16)', code: 'BAD_REQUEST' },
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
    const verse = await fetchBiblePassage(reference, translation);
    return NextResponse.json({ verse });
  } catch (error) {
    const { status, code, error: message, detail } = classifyBibleError(error);
    console.error('Bible passage error:', detail ?? error);
    return NextResponse.json({ error: message, code, ...(detail && { detail }) }, { status });
  }
}
