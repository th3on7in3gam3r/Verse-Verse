'use client';

import { FormEvent, UIEvent, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Loader2, TextQuote } from 'lucide-react';
import VerseCard from './VerseCard';
import { mapSearchResultsToCards, type SearchCardVerse } from '../../lib/mapSearchVerse';
import {
  buildReference,
  parseScriptureQuery,
  type ScriptureBook,
} from '../../lib/scriptureReference';

type SearchFeedProps = {
  query: string;
  translation: 'NIV' | 'ESV' | 'KJV';
  onOpenComments: (verseId: string) => void;
};

type SearchMode = 'reference' | 'book' | 'keyword';

export default function SearchFeed({ query, translation, onOpenComments }: SearchFeedProps) {
  const parsed = useMemo(() => parseScriptureQuery(query), [query]);

  const [results, setResults] = useState<SearchCardVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [statusLine, setStatusLine] = useState('');
  const [chapterInput, setChapterInput] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const bookTarget = parsed.mode === 'book' ? parsed.book : null;

  const runFetch = async (
    mode: SearchMode,
    fetchQuery: string,
    status: string,
  ) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError('');
    setStatusLine(status);
    setResults([]);

    try {
      const url =
        mode === 'keyword'
          ? `/api/bible/search?q=${encodeURIComponent(fetchQuery)}&translation=${translation}`
          : `/api/bible/passage?ref=${encodeURIComponent(fetchQuery)}&translation=${translation}`;

      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();

      if (requestId !== requestIdRef.current) return;

      if (!res.ok) {
        throw new Error(data?.error || 'Search failed');
      }

      if (mode === 'keyword') {
        const mapped = mapSearchResultsToCards(data.results ?? []);
        setResults(mapped);
        if (mapped.length === 0) {
          setError(`No verses found containing “${fetchQuery}”`);
        } else {
          setStatusLine(`${mapped.length} verse${mapped.length === 1 ? '' : 's'} with “${fetchQuery}”`);
        }
      } else {
        const verse = data.verse;
        if (!verse?.text?.trim()) {
          setError(`Could not load ${fetchQuery}`);
        } else {
          const mapped = mapSearchResultsToCards([verse]);
          setResults(mapped);
          setStatusLine(mapped[0]?.reference ?? fetchQuery);
        }
      }

      setActiveIndex(0);
      scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      if (requestId !== requestIdRef.current) return;
      setResults([]);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setError('');
      setStatusLine('');
      setLoading(false);
      setChapterInput('');
      return;
    }

    if (parsed.mode === 'book') {
      setResults([]);
      setError('');
      setLoading(false);
      setStatusLine(`Book: ${parsed.book.canonical} — choose a chapter`);
      return;
    }

    if (parsed.mode === 'reference') {
      runFetch('reference', parsed.reference, parsed.reference);
      return;
    }

    runFetch('keyword', parsed.keyword, `Word search: “${parsed.keyword}”`);
  }, [query, translation, parsed]);

  const handleChapterSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bookTarget) return;
    const chapter = parseInt(chapterInput, 10);
    if (!Number.isFinite(chapter) || chapter < 1 || chapter > bookTarget.maxChapter) {
      setError(`Enter a chapter from 1 to ${bookTarget.maxChapter}`);
      return;
    }
    const ref = buildReference(bookTarget, chapter);
    runFetch('reference', ref, ref);
  };

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight } = e.currentTarget;
    if (clientHeight <= 0) return;
    const index = Math.round(scrollTop / clientHeight);
    if (index !== activeIndex && index >= 0 && index < results.length) {
      setActiveIndex(index);
    }
  };

  const searchAsKeyword = () => {
    if (parsed.mode !== 'book') return;
    runFetch('keyword', query.trim(), `Word search: “${query.trim()}”`);
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-black">
      <div className="shrink-0 z-10 px-4 pt-[6.5rem] pb-2 md:pt-28 pointer-events-none">
        <div className="mx-auto max-w-3xl pointer-events-auto space-y-2">
          <div className="flex items-center justify-between gap-2 rounded-full border border-white/12 bg-black/55 backdrop-blur-xl px-4 py-2">
            <div className="flex items-center gap-2 min-w-0">
              {parsed.mode === 'keyword' ? (
                <TextQuote size={14} className="text-teal-400 shrink-0" />
              ) : (
                <BookOpen size={14} className="text-amber-300 shrink-0" />
              )}
              <span className="text-[11px] font-bold text-white/80 truncate">
                {loading ? 'Loading…' : statusLine || error || 'Search'}
              </span>
            </div>
            {!loading && results.length > 1 && (
              <span className="text-[10px] font-bold text-white/45 tabular-nums shrink-0">
                {activeIndex + 1} / {results.length}
              </span>
            )}
          </div>

          {parsed.mode === 'book' && bookTarget && results.length === 0 && !loading && (
            <ChapterPicker
              book={bookTarget}
              chapterInput={chapterInput}
              onChapterInput={setChapterInput}
              onSubmit={handleChapterSubmit}
              onSearchAsWord={searchAsKeyword}
              rawQuery={query.trim()}
            />
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto snap-y-container no-scrollbar"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-6">
            <Loader2 size={32} className="text-teal-400 animate-spin" />
            <p className="text-sm text-white/50 font-medium">Loading scripture…</p>
          </div>
        ) : error && results.length === 0 && parsed.mode !== 'book' ? (
          <div className="flex items-center justify-center min-h-[60vh] px-6">
            <div className="max-w-md w-full rounded-2xl border border-white/12 bg-white/5 backdrop-blur-xl p-8 text-center">
              <p className="text-sm text-white/70 leading-relaxed">{error}</p>
              <p className="text-[11px] text-white/40 mt-3 leading-relaxed">
                Try a book + chapter (Psalm 23), a reference (John 3:16), or a word (love)
              </p>
            </div>
          </div>
        ) : (
          results.map((verse, index) => (
            <div
              key={`search-${verse.id}-${index}`}
              className="w-full h-full min-h-[100dvh] snap-section relative"
            >
              <VerseCard
                verse={verse}
                isVisible={index === activeIndex}
                onOpenComments={onOpenComments}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ChapterPicker({
  book,
  chapterInput,
  onChapterInput,
  onSubmit,
  onSearchAsWord,
  rawQuery,
}: {
  book: ScriptureBook;
  chapterInput: string;
  onChapterInput: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  onSearchAsWord: () => void;
  rawQuery: string;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/10 via-black/50 to-purple-500/10 backdrop-blur-xl p-4 space-y-3"
    >
      <p className="text-sm text-white font-semibold">
        Open {book.canonical}
      </p>
      <p className="text-[11px] text-white/55 leading-relaxed">
        You searched for a <strong className="text-white/80">book</strong>, not a single word.
        Which chapter? (1–{book.maxChapter})
      </p>
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          max={book.maxChapter}
          inputMode="numeric"
          placeholder="Chapter"
          value={chapterInput}
          onChange={(e) => onChapterInput(e.target.value)}
          className="flex-1 min-h-[44px] rounded-xl border border-white/15 bg-black/40 px-4 text-white text-sm font-bold outline-none focus:border-amber-400/50"
          aria-label={`Chapter number for ${book.canonical}`}
        />
        <button
          type="submit"
          className="shrink-0 min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-[11px] font-bold uppercase tracking-wider text-white border border-orange-300/30 cursor-pointer"
        >
          Go
        </button>
      </div>
      <button
        type="button"
        onClick={onSearchAsWord}
        className="text-[10px] text-white/45 hover:text-teal-300 underline underline-offset-2 cursor-pointer text-left"
      >
        Or search for the word “{rawQuery}” instead
      </button>
    </form>
  );
}
