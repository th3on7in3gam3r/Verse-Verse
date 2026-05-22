export const MISSING_BIBLE_API_KEY = 'MISSING_BIBLE_API_KEY';

const API_BIBLE_KEY =
  process.env.BIBLE_API_KEY ||
  process.env.BIBLE_API ||
  process.env.API_BIBLE_KEY ||
  process.env.API_BIBLE;
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

export type BibleApiErrorCode =
  | 'MISSING_API_KEY'
  | 'NOT_FOUND'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL_ERROR';

export type BibleApiErrorPayload = {
  error: string;
  code: BibleApiErrorCode;
  detail?: string;
};

export function classifyBibleError(error: unknown): BibleApiErrorPayload & { status: number } {
  const message = error instanceof Error ? error.message : String(error);

  if (message === MISSING_BIBLE_API_KEY) {
    return {
      status: 503,
      code: 'MISSING_API_KEY',
      error:
        'Bible API is not configured. Add BIBLE_API_KEY to your .env file and restart the dev server.',
    };
  }

  if (message.includes('Could not find scripture reference')) {
    return {
      status: 404,
      code: 'NOT_FOUND',
      error: message,
    };
  }

  if (message.startsWith('API.Bible error')) {
    return {
      status: 502,
      code: 'UPSTREAM_ERROR',
      error: 'Bible translation service returned an error. Try again in a moment.',
      detail: message,
    };
  }

  return {
    status: 500,
    code: 'INTERNAL_ERROR',
    error: message || 'Failed to fetch Bible passage',
  };
}

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&#39;': "'",
};

function decodeHtmlEntities(text: string): string {
  let out = text;
  for (const [entity, char] of Object.entries(HTML_ENTITIES)) {
    out = out.split(entity).join(char);
  }
  return out
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

/** API.Bible returns HTML in passage/verse content — convert to plain readable text. */
export function plainTextFromBibleContent(raw: string, reference?: string): string {
  if (!raw) return '';
  if (!raw.includes('<')) return raw.trim();

  let text = raw
    .replace(/<span[^>]*class="v"[^>]*>[\s\S]*?<\/span>/gi, '')
    .replace(/<[^>]+>/g, ' ');

  text = decodeHtmlEntities(text).replace(/\s+/g, ' ').trim();

  if (reference) {
    const verseMatch = reference.match(/:(\d+)(?:-\d+)?$/);
    if (verseMatch && text.startsWith(verseMatch[1])) {
      text = text.slice(verseMatch[1].length).trimStart();
    }
  }

  return text;
}

function getTranslationKeyFromId(id: string | null): BibleTranslationKey {
  if (!id) return 'NIV';
  const found = (Object.keys(BIBLE_TRANSLATION_IDS) as BibleTranslationKey[]).find(
    key => BIBLE_TRANSLATION_IDS[key] === id
  );
  return found ?? 'NIV';
}

function normalizeVersePayload(payload: any, translation: BibleTranslationKey): BibleVerse {
  const rawText =
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

  const text = plainTextFromBibleContent(String(rawText), String(reference));

  const id =
    payload.id ||
    payload.reference ||
    reference ||
    text.slice(0, 32);

  return {
    id: String(id),
    text,
    reference: String(reference),
    translation,
  };
}

async function fetchBibleApi(path: string, params: Record<string, string>) {
  if (!API_BIBLE_KEY) {
    throw new Error(MISSING_BIBLE_API_KEY);
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

  const data = result.data || {};
  const hits = [...(data.passages || []), ...(data.verses || [])];

  return hits
    .map((item: any) => normalizeVersePayload(item, translation))
    .filter((v) => v.text.trim().length > 0 && v.reference.trim().length > 0);
}

export async function fetchBiblePassage(reference: string, translation: BibleTranslationKey) {
  const translationId = BIBLE_TRANSLATION_IDS[translation];
  
  // API.Bible doesn't resolve raw reference strings in the /passages endpoint.
  // We must use the /search endpoint to accurately fetch the text for "Luke 1:37".
  const result = await fetchBibleApi(`/v1/bibles/${translationId}/search`, {
    query: reference,
    limit: '1',
  });

  const data = result.data || {};
  const match = (data.passages && data.passages[0]) || (data.verses && data.verses[0]);

  if (!match) {
    throw new Error(`Could not find scripture reference: ${reference}`);
  }

  // API.Bible returns text that may contain newlines or formatting, normalize handles it
  return normalizeVersePayload(match, translation);
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
