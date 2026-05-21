'use client';

import { useCallback, useEffect, useState } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { isTodayCompleted, markTodayCompleted, STREAK_UPDATED_EVENT } from '../../lib/streak';

type VersePayload = {
  id?: string;
  text: string;
  reference: string;
  translation: 'NIV' | 'ESV' | 'KJV';
};

const EXIT_MS = 700;

export default function VerseOfTheDay() {
  const [verse, setVerse] = useState<VersePayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCard, setShowCard] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const dismissCard = useCallback(() => {
    setIsExiting(true);
    window.setTimeout(() => {
      setShowCard(false);
      setIsExiting(false);
    }, EXIT_MS);
  }, []);

  const syncCompletionState = useCallback(() => {
    if (isTodayCompleted()) {
      setShowCard(false);
    }
  }, []);

  useEffect(() => {
    syncCompletionState();

    const onStreakUpdated = () => syncCompletionState();
    window.addEventListener(STREAK_UPDATED_EVENT, onStreakUpdated);
    return () => window.removeEventListener(STREAK_UPDATED_EVENT, onStreakUpdated);
  }, [syncCompletionState]);

  useEffect(() => {
    if (isTodayCompleted()) {
      setIsLoading(false);
      setShowCard(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const cachedDate = localStorage.getItem('verseverse_votd_date');
    const cachedPayload = localStorage.getItem('verseverse_votd');

    if (cachedPayload && cachedDate === today) {
      try {
        setVerse(JSON.parse(cachedPayload));
        setIsLoading(false);
        return;
      } catch {
        // refetch below
      }
    }

    fetch('/api/bible/verse-of-the-day')
      .then((res) => res.json())
      .then((data) => {
        if (data?.verse) {
          setVerse(data.verse);
          localStorage.setItem('verseverse_votd', JSON.stringify(data.verse));
          localStorage.setItem('verseverse_votd_date', today);
        }
      })
      .catch((err) => console.error('Failed to load verse of the day:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const fireCelebration = () => {
    confetti({
      particleCount: 48,
      spread: 62,
      origin: { y: 0.72, x: 0.5 },
      colors: ['#fb923c', '#fbbf24', '#fef3c7', '#c084fc', '#ffffff'],
      ticks: 120,
      gravity: 0.9,
      scalar: 0.85,
    });
  };

  const handleComplete = async () => {
    if (isCompleting || isTodayCompleted()) return;
    setIsCompleting(true);

    const result = markTodayCompleted();

    if (result.streakIncreased) {
      fireCelebration();
    }

    dismissCard();
    setIsCompleting(false);
  };

  if (!showCard) return null;

  if (isLoading) {
    return (
      <div className={`mx-3 md:mx-8 pointer-events-auto ${isExiting ? 'votd-exit' : ''}`}>
        <div className="hero-glass-effect votd-card rounded-2xl border border-white/10 bg-black/45 backdrop-blur-2xl p-4 shadow-2xl">
          <div className="h-[88px] rounded-xl bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!verse) return null;

  return (
    <div
      className={`mx-3 md:mx-8 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-500 ${
        isExiting ? 'votd-exit' : ''
      }`}
    >
      <div className="hero-glass-effect votd-card relative overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-br from-orange-950/40 via-black/50 to-black/70 backdrop-blur-2xl shadow-2xl">
        <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-orange-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-4 bottom-0 h-20 w-20 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        <div className="relative p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
              <Sparkles size={14} className="text-amber-300 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/90">
                Verse of the Day
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.32em] text-white/45 font-semibold">
                {verse.translation}
              </p>
              <p className="text-sm font-bold text-white mt-0.5">{verse.reference}</p>
            </div>
          </div>

          <p className="mt-3 text-white text-base md:text-lg leading-relaxed font-serif max-w-3xl drop-shadow-md">
            &ldquo;{verse.text}&rdquo;
          </p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-[10px] text-white/50 leading-relaxed max-w-md">
              Reflect on today&apos;s verse to grow your daily faith streak.
            </p>

            <button
              type="button"
              onClick={handleComplete}
              disabled={isCompleting || isExiting}
              className="group relative shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-orange-500/30 transition-all hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait cursor-pointer border border-orange-300/30"
            >
              <Flame size={14} className="fill-white group-hover:animate-pulse" />
              {isCompleting ? 'Recording…' : 'Complete reflection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
