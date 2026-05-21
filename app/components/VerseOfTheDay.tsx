'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

type VerseOfTheDayProps = {
  id?: string;
  text: string;
  reference: string;
  translation: 'NIV' | 'ESV' | 'KJV';
};

export default function VerseOfTheDay() {
  const [verse, setVerse] = useState<VerseOfTheDayProps | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const cachedDate = localStorage.getItem('verseverse_votd_date');
    const cachedPayload = localStorage.getItem('verseverse_votd');

    if (cachedPayload && cachedDate === today) {
      try {
        setVerse(JSON.parse(cachedPayload));
        setIsLoading(false);
        return;
      } catch {
        // continue to refetch
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
      .catch((err) => {
        console.error('Failed to load verse of the day:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="mx-4 md:mx-16 z-[60] bg-black/50 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-top-8" style={{ marginTop: 'env(safe-area-inset-top, 0)' }}>
        <div className="h-20 rounded-2xl bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!verse) {
    return null;
  }

  return (
    <div className="mx-4 md:mx-16 z-[60] bg-black/50 backdrop-blur-xl rounded-3xl p-5 border border-white/15 shadow-2xl pointer-events-auto animate-in fade-in slide-in-from-top-8" style={{ marginTop: 'env(safe-area-inset-top, 0)' }}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.32em] font-semibold text-white/90">
            <Sparkles size={16} className="text-amber-300" />
            Verse of the Day
          </div>
          <p className="mt-3 text-white text-lg md:text-xl leading-relaxed font-medium max-w-3xl">
            "{verse.text}"
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col items-start gap-2 text-right md:items-end">
          <span className="text-white/50 uppercase text-[11px] tracking-[0.36em] font-semibold">{verse.translation}</span>
          <span className="text-white text-sm font-semibold">{verse.reference}</span>
        </div>
      </div>
    </div>
  );
}
