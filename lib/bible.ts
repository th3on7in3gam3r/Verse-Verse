import { NextResponse } from 'next/server';

const API_BIBLE_KEY = process.env.API_BIBLE_KEY || process.env.API_BIBLE || process.env.BIBLE_API;
const API_BIBLE_BASE_URL = process.env.API_BIBLE_BASE_URL || 'https://rest.api.bible';

export const BIBLE_TRANSLATION_IDS = {
  NIV: '06125adad2d5898a-01',
  ESV: 'f421fe261da7624f-01',
  KJV: 'de4e12af7f28f599-01',
} as const;

export type BibleTranslationKey = keyof typeof BIBLE_TRANSLATION_IDS;

export type BibleVerse = {
  id: string;
  text: string;
  reference: string;
  translation: BibleTranslationKey;
};

function getTranslationKeyFromId(id: string | null): BibleTranslationKey {
  if (!id) return 'NIV';
  const found = (Object.keys(BIBLE_TRANSLATION_IDS) as BibleTranslationKey[]).find(
    key => BIBLE_TRANSLATION_IDS[key] === id
  );
  return found ?? 'NIV';
}

function normalizeVersePayload(payload: any, translation: BibleTranslationKey): BibleVerse {
  const text =
    payload.text ||
    payload.content ||
    payload.passage?.content ||
    payload.passages?.[0]?.content ||
    payload.canonical ||
    '';

  const reference =
    payload.reference ||
    payload.passage?.reference ||
    payload.passages?.[0]?.reference ||
    payload.id ||
    '';

  const id =
    payload.id ||
    payload.reference ||
    reference ||
    text.slice(0, 32);

  return {
    id: String(id),
    text: String(text),
    reference: String(reference),
    translation,
  };
}

async function fetchBibleApi(path: string, params: Record<string, string>) {
  if (!API_BIBLE_KEY) {
    throw new Error('Missing BIBLE_API environment variable');
  }

  const url = new URL(path, API_BIBLE_BASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_BIBLE_KEY,
      Authorization: `Bearer ${API_BIBLE_KEY}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API.Bible error ${response.status}: ${text}`);
  }

  return response.json();
}

export async function searchBibleVerses(query: string, translation: BibleTranslationKey) {
  const translationId = BIBLE_TRANSLATION_IDS[translation];
  const result = await fetchBibleApi(`/v1/bibles/${translationId}/search`, {
    query,
    limit: '40',
  });

  const hits = Array.isArray(result.data) ? result.data : result.results ?? [];

  return hits.map((item: any) => normalizeVersePayload(item, translation));
}

export async function fetchBiblePassage(reference: string, translation: BibleTranslationKey) {
  const translationId = BIBLE_TRANSLATION_IDS[translation];
  const result = await fetchBibleApi(`/v1/bibles/${translationId}/passages`, {
    reference,
    include: 'text',
  });

  const payload = Array.isArray(result.data) ? result.data[0] : result.data;
  return normalizeVersePayload(payload, translation);
}

const DAILY_VERSE_REFERENCES = [
  'John 3:16',
  'Philippians 4:13',
  'Psalm 23:1',
  'Romans 5:8',
  '1 Corinthians 13:4-7',
  'Isaiah 40:31',
  'Joshua 1:9',
  'Matthew 11:28',
  'Psalm 46:10',
  'Proverbs 3:5-6',
];

export function getDailyVerseReference(dateStr: string) {
  const epoch = new Date('2025-01-01').getTime();
  const today = new Date(dateStr).getTime();
  const index = Math.floor((today - epoch) / 86_400_000);
  return DAILY_VERSE_REFERENCES[((index % DAILY_VERSE_REFERENCES.length) + DAILY_VERSE_REFERENCES.length) % DAILY_VERSE_REFERENCES.length];
}

export async function fetchDailyVerse(translation: BibleTranslationKey) {
  const today = new Date().toISOString().split('T')[0];
  const reference = getDailyVerseReference(today);
  return fetchBiblePassage(reference, translation);
}

export function getTranslationId(key: string) {
  return BIBLE_TRANSLATION_IDS[key as BibleTranslationKey] ?? BIBLE_TRANSLATION_IDS.NIV;
}

export function getTranslationKey(key: string) {
  return getTranslationKeyFromId(key);
}
