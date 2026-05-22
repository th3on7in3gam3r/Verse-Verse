export type ScriptureBook = {
  canonical: string;
  maxChapter: number;
};

const BOOKS: Array<{ names: string[]; canonical: string; maxChapter: number }> = [
  { names: ['genesis', 'gen'], canonical: 'Genesis', maxChapter: 50 },
  { names: ['exodus', 'exod', 'ex'], canonical: 'Exodus', maxChapter: 40 },
  { names: ['leviticus', 'lev'], canonical: 'Leviticus', maxChapter: 27 },
  { names: ['numbers', 'num'], canonical: 'Numbers', maxChapter: 36 },
  { names: ['deuteronomy', 'deut'], canonical: 'Deuteronomy', maxChapter: 34 },
  { names: ['joshua', 'josh'], canonical: 'Joshua', maxChapter: 24 },
  { names: ['judges', 'judg'], canonical: 'Judges', maxChapter: 21 },
  { names: ['ruth'], canonical: 'Ruth', maxChapter: 4 },
  { names: ['1 samuel', '1samuel', '1 sam', '1sam'], canonical: '1 Samuel', maxChapter: 31 },
  { names: ['2 samuel', '2samuel', '2 sam', '2sam'], canonical: '2 Samuel', maxChapter: 24 },
  { names: ['1 kings', '1kings', '1 kgs'], canonical: '1 Kings', maxChapter: 22 },
  { names: ['2 kings', '2kings', '2 kgs'], canonical: '2 Kings', maxChapter: 25 },
  { names: ['1 chronicles', '1chronicles', '1 chr'], canonical: '1 Chronicles', maxChapter: 29 },
  { names: ['2 chronicles', '2chronicles', '2 chr'], canonical: '2 Chronicles', maxChapter: 36 },
  { names: ['ezra'], canonical: 'Ezra', maxChapter: 10 },
  { names: ['nehemiah', 'neh'], canonical: 'Nehemiah', maxChapter: 13 },
  { names: ['esther', 'est'], canonical: 'Esther', maxChapter: 10 },
  { names: ['job'], canonical: 'Job', maxChapter: 42 },
  { names: ['psalm', 'psalms', 'ps', 'palms', 'palm'], canonical: 'Psalms', maxChapter: 150 },
  { names: ['proverbs', 'prov', 'proverb'], canonical: 'Proverbs', maxChapter: 31 },
  { names: ['ecclesiastes', 'eccl', 'ecc'], canonical: 'Ecclesiastes', maxChapter: 12 },
  { names: ['song of solomon', 'song of songs', 'sos'], canonical: 'Song of Solomon', maxChapter: 8 },
  { names: ['isaiah', 'isa'], canonical: 'Isaiah', maxChapter: 66 },
  { names: ['jeremiah', 'jer', 'jerem'], canonical: 'Jeremiah', maxChapter: 52 },
  { names: ['lamentations', 'lam'], canonical: 'Lamentations', maxChapter: 5 },
  { names: ['ezekiel', 'ezek'], canonical: 'Ezekiel', maxChapter: 48 },
  { names: ['daniel', 'dan'], canonical: 'Daniel', maxChapter: 12 },
  { names: ['hosea', 'hos'], canonical: 'Hosea', maxChapter: 14 },
  { names: ['joel'], canonical: 'Joel', maxChapter: 3 },
  { names: ['amos'], canonical: 'Amos', maxChapter: 9 },
  { names: ['obadiah', 'obad'], canonical: 'Obadiah', maxChapter: 1 },
  { names: ['jonah'], canonical: 'Jonah', maxChapter: 4 },
  { names: ['micah', 'mic'], canonical: 'Micah', maxChapter: 7 },
  { names: ['nahum', 'nah'], canonical: 'Nahum', maxChapter: 3 },
  { names: ['habakkuk', 'hab'], canonical: 'Habakkuk', maxChapter: 3 },
  { names: ['zephaniah', 'zeph'], canonical: 'Zephaniah', maxChapter: 3 },
  { names: ['haggai', 'hag'], canonical: 'Haggai', maxChapter: 2 },
  { names: ['zechariah', 'zech'], canonical: 'Zechariah', maxChapter: 14 },
  { names: ['malachi', 'mal'], canonical: 'Malachi', maxChapter: 4 },
  { names: ['matthew', 'matt', 'mt'], canonical: 'Matthew', maxChapter: 28 },
  { names: ['mark', 'mk'], canonical: 'Mark', maxChapter: 16 },
  { names: ['luke', 'lk'], canonical: 'Luke', maxChapter: 24 },
  { names: ['john', 'jn'], canonical: 'John', maxChapter: 21 },
  { names: ['acts'], canonical: 'Acts', maxChapter: 28 },
  { names: ['romans', 'rom'], canonical: 'Romans', maxChapter: 16 },
  { names: ['1 corinthians', '1corinthians', '1 cor', '1cor'], canonical: '1 Corinthians', maxChapter: 16 },
  { names: ['2 corinthians', '2corinthians', '2 cor', '2cor'], canonical: '2 Corinthians', maxChapter: 13 },
  { names: ['galatians', 'gal'], canonical: 'Galatians', maxChapter: 6 },
  { names: ['ephesians', 'eph'], canonical: 'Ephesians', maxChapter: 6 },
  { names: ['philippians', 'phil'], canonical: 'Philippians', maxChapter: 4 },
  { names: ['colossians', 'col'], canonical: 'Colossians', maxChapter: 4 },
  { names: ['1 thessalonians', '1thessalonians', '1 thess', '1thess'], canonical: '1 Thessalonians', maxChapter: 5 },
  { names: ['2 thessalonians', '2thessalonians', '2 thess', '2thess'], canonical: '2 Thessalonians', maxChapter: 3 },
  { names: ['1 timothy', '1timothy', '1 tim', '1tim'], canonical: '1 Timothy', maxChapter: 6 },
  { names: ['2 timothy', '2timothy', '2 tim', '2tim'], canonical: '2 Timothy', maxChapter: 4 },
  { names: ['titus'], canonical: 'Titus', maxChapter: 3 },
  { names: ['philemon', 'phlm'], canonical: 'Philemon', maxChapter: 1 },
  { names: ['hebrews', 'heb'], canonical: 'Hebrews', maxChapter: 13 },
  { names: ['james', 'jas'], canonical: 'James', maxChapter: 5 },
  { names: ['1 peter', '1peter', '1 pet', '1pet'], canonical: '1 Peter', maxChapter: 5 },
  { names: ['2 peter', '2peter', '2 pet', '2pet'], canonical: '2 Peter', maxChapter: 3 },
  { names: ['1 john', '1john', '1 jn', '1jn'], canonical: '1 John', maxChapter: 5 },
  { names: ['2 john', '2john', '2 jn'], canonical: '2 John', maxChapter: 1 },
  { names: ['3 john', '3john', '3 jn'], canonical: '3 John', maxChapter: 1 },
  { names: ['jude'], canonical: 'Jude', maxChapter: 1 },
  { names: ['revelation', 'rev', 'revelations'], canonical: 'Revelation', maxChapter: 22 },
];

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[.]/g, '').replace(/\s+/g, ' ').trim();
}

export function matchBookByName(input: string): ScriptureBook | null {
  const token = normalizeToken(input);
  if (!token) return null;

  for (const book of BOOKS) {
    if (book.names.some((name) => name === token)) {
      return { canonical: book.canonical, maxChapter: book.maxChapter };
    }
  }
  return null;
}

/** e.g. "John 3:16", "Psalm 23", "1 Corinthians 13" */
const REFERENCE_PATTERN =
  /^((?:\d\s+)?[a-zA-Z]+(?:\s+[a-zA-Z]+)?)\s+(\d{1,3})(?::(\d{1,3})(?:\s*-\s*(\d{1,3}))?)?$/;

export type ParsedScriptureQuery =
  | { mode: 'reference'; reference: string; label: string }
  | { mode: 'book'; book: ScriptureBook; label: string }
  | { mode: 'keyword'; keyword: string; label: string };

export function parseScriptureQuery(raw: string): ParsedScriptureQuery {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { mode: 'keyword', keyword: '', label: '' };
  }

  const refMatch = trimmed.match(REFERENCE_PATTERN);
  if (refMatch) {
    const bookPart = refMatch[1].trim();
    const chapter = refMatch[2];
    const verse = refMatch[3];
    const book = matchBookByName(bookPart) ?? { canonical: bookPart, maxChapter: 150 };
    let reference = `${book.canonical} ${chapter}`;
    if (verse) reference += `:${verse}`;
    return {
      mode: 'reference',
      reference,
      label: reference,
    };
  }

  const book = matchBookByName(trimmed);
  if (book) {
    return { mode: 'book', book, label: book.canonical };
  }

  return {
    mode: 'keyword',
    keyword: trimmed,
    label: trimmed,
  };
}

export function buildReference(book: ScriptureBook, chapter: number, verse?: number): string {
  let ref = `${book.canonical} ${chapter}`;
  if (verse) ref += `:${verse}`;
  return ref;
}
