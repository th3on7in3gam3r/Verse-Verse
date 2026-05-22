'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Wind } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MeditationOverlay from './MeditationOverlay';
import CardBuilderModal from './CardBuilderModal';
import AudioNarrator from './AudioNarrator';

type TranslationKey = 'NIV' | 'ESV' | 'KJV';

type VerseCardProps = {
  verse: {
    id: string;
    text: string;
    reference: string;
    translation?: string;
    theme?: string;
    background?: string;
    media?: { image?: string; video?: string };
  };
  isVisible?: boolean;
  onOpenComments: (verseId: string) => void;
  onSeen?: (verseId: string) => void;
};

const TRANSLATION_OPTIONS: TranslationKey[] = ['NIV', 'ESV', 'KJV'];

const BACKGROUNDS: Record<string, string> = {
  blue:   'linear-gradient(135deg, #667eea, #764ba2, #6B8DD6, #8E37D7)',
  purple: 'linear-gradient(135deg, #f093fb, #f5576c, #f093fb, #f5576c)',
  green:  'linear-gradient(135deg, #4facfe, #00f2fe, #4facfe, #00f2fe)',
  orange: 'linear-gradient(135deg, #fa709a, #fee140, #fa709a, #fee140)',
};

function normalizeTranslation(value?: string): TranslationKey {
  if (!value) return 'NIV';
  const up = value.toUpperCase();
  return TRANSLATION_OPTIONS.includes(up as TranslationKey) ? (up as TranslationKey) : 'NIV';
}

function translationErrorMessage(data: { error?: string; code?: string }): string {
  switch (data.code) {
    case 'MISSING_API_KEY':
      return 'API key not configured — add BIBLE_API_KEY to .env';
    case 'NOT_FOUND':
      return data.error ?? 'Reference not found';
    case 'UPSTREAM_ERROR':
      return 'Bible service unavailable — try again';
    default:
      return data.error ?? 'Translation unavailable';
  }
}

export default function VerseCard({ verse, isVisible = false, onOpenComments, onSeen }: VerseCardProps) {
  const { prefersVideo } = useAuth();

  const [isLiked,            setIsLiked]            = useState(false);
  const [showLikeAnimation,  setShowLikeAnimation]  = useState(false);
  const [isMeditating,       setIsMeditating]       = useState(false);
  const [isShareBuilderOpen, setIsShareBuilderOpen] = useState(false);
  const [amenCount,          setAmenCount]          = useState(0);
  const [showAmenBurst,      setShowAmenBurst]      = useState(false);
  const [verseText,          setVerseText]          = useState(verse.text);
  const [translation,        setTranslation]        = useState<TranslationKey>(normalizeTranslation(verse.translation));
  const [translationLoading, setTranslationLoading] = useState(false);
  const [pendingTranslation, setPendingTranslation] = useState<TranslationKey | null>(null);
  const [translationError,   setTranslationError]   = useState<string | null>(null);

  const lastAmenAtRef  = useRef<number>(0);
  const lastTapRef     = useRef<number>(0);
  const seenReportedRef = useRef(false);

  // ── Sync when verse prop changes ──────────────────────────────────────────
  useEffect(() => {
    setVerseText(verse.text);
    setTranslation(normalizeTranslation(verse.translation));
    seenReportedRef.current = false; // reset so new verse gets reported
  }, [verse.id, verse.text, verse.translation]);

  // ── Liked state ───────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedVerses') || '[]');
    setIsLiked(saved.includes(verse.id));
  }, [verse.id]);

  // ── Report seen ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (seenReportedRef.current) return;
    onSeen?.(verse.id);
    seenReportedRef.current = true;
  }, [onSeen, verse.id]);

  // ── Amen count fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    fetch(`/api/verse-amen/${verse.id}`)
      .then(r => r.json())
      .then(d => { if (active && typeof d?.amenCount === 'number') setAmenCount(d.amenCount); })
      .catch(() => {});
    return () => { active = false; };
  }, [verse.id]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const toggleLike = () => {
    const saved: string[] = JSON.parse(localStorage.getItem('savedVerses') || '[]');
    let next: string[];
    if (isLiked) {
      next = saved.filter(id => id !== verse.id);
      setIsLiked(false);
    } else {
      next = [...saved, verse.id];
      setIsLiked(true);
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
    }
    localStorage.setItem('savedVerses', JSON.stringify(next));
  };

  const handleShare = async () => {
    const text = `"${verseText}" - ${verse.reference}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${verse.reference} - Verse Verse`, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text}\n\n${window.location.href}`);
      }
    } catch { /* cancelled */ }
  };

  const triggerAmen = async () => {
    const now = Date.now();
    if (now - lastAmenAtRef.current < 5000) return;
    lastAmenAtRef.current = now;
    setShowAmenBurst(true);
    setTimeout(() => setShowAmenBurst(false), 900);
    try {
      const res  = await fetch(`/api/verse-amen/${verse.id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && typeof data?.amenCount === 'number') setAmenCount(data.amenCount);
    } catch { /* ignore */ }
  };

  const handleTouchEnd = () => {
    const now = Date.now();
    if (lastTapRef.current && now - lastTapRef.current <= 300) {
      triggerAmen();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  const changeTranslation = async (key: TranslationKey) => {
    if (key === translation || translationLoading) return;
    setTranslationLoading(true);
    setPendingTranslation(key);
    setTranslationError(null);
    try {
      const res  = await fetch(`/api/bible/passage?ref=${encodeURIComponent(verse.reference)}&translation=${key}`);
      const data = await res.json();
      if (res.ok && data?.verse?.text) {
        setTranslation(key);
        setVerseText(data.verse.text);
        localStorage.setItem('verseverse_translation_preference', key);
      } else {
        setTranslationError(translationErrorMessage(data));
        setTimeout(() => setTranslationError(null), 5000);
      }
    } catch {
      setTranslationError('Network error — try again');
      setTimeout(() => setTranslationError(null), 5000);
    } finally {
      setTranslationLoading(false);
      setPendingTranslation(null);
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden animate-gradient"
      style={{
        backgroundImage: BACKGROUNDS[verse.background || 'blue'] || BACKGROUNDS.blue,
        backgroundSize: '400% 400%',
      }}
      onDoubleClick={triggerAmen}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Background media ─────────────────────────────────────────────── */}
      {verse.media?.video && prefersVideo && (
        <video src={verse.media.video} autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-90" />
      )}
      {verse.media?.image && !prefersVideo && (
        <img src={verse.media.image} alt={verse.theme ?? verse.reference}
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-85 animate-slow-pan" />
      )}

      {/* Gradient overlays — top scrim for header clearance, bottom for controls */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 z-0 pointer-events-none" />

      {/* ── Amen burst ───────────────────────────────────────────────────── */}
      {showAmenBurst && (
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 z-30 text-5xl amen-burst pointer-events-none select-none">
          🙏
        </div>
      )}
      {showLikeAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <Heart size={100} className="text-red-500 fill-red-500 animate-ping opacity-75" />
        </div>
      )}


      {/* ── Main verse content ───────────────────────────────────────────── */}
      {/* Always visible — opacity animation only plays when card becomes active */}
      <div className="flex-1 w-full max-w-lg flex flex-col justify-center items-center px-5 pt-[7.5rem] pb-32 sm:px-8 md:pt-16 md:pb-8 relative z-10">
        <p
          className="text-white text-[1.65rem] leading-snug sm:text-3xl md:text-[2.6rem] font-serif text-center mb-5 sm:mb-6 drop-shadow-2xl"
          style={{
            textShadow: '0 4px 16px rgba(0,0,0,0.9)',
            opacity: isVisible ? 1 : 0.85,
            transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          "{verseText}"
        </p>
        <div className="flex flex-col items-center gap-2"
          style={{
            opacity: isVisible ? 1 : 0.75,
            transition: 'opacity 0.7s ease 0.15s',
          }}>
          <h2 className="text-white text-xl font-bold tracking-wide drop-shadow-md"
            style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
            {verse.reference}
          </h2>
          <span className="bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] text-white uppercase font-bold tracking-widest">
            {translation}
          </span>
        </div>
      </div>

      {/* ── Right sidebar actions ────────────────────────────────────────── */}
      <div
        className="absolute right-2.5 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:right-4 md:bottom-24 flex flex-col items-center gap-3.5 md:gap-5 z-20"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {[
          { icon: <Heart size={24} className={isLiked ? 'text-red-500 fill-red-500' : 'text-white'} />, label: isLiked ? 'Saved' : 'Save', action: toggleLike },
          { icon: <MessageCircle size={24} className="text-white" />, label: 'Prayers', action: () => onOpenComments(verse.id) },
          { icon: <Share2 size={24} className="text-white" />, label: 'Share', action: handleShare },
          { icon: <Wind size={24} className="text-white" />, label: 'Meditate', action: () => setIsMeditating(true) },
        ].map(({ icon, label, action }) => (
          <button key={label} type="button" onClick={action}
            className="flex flex-col items-center gap-0.5 md:gap-1 group btn-interactive cursor-pointer">
            <div className="bg-black/40 border border-white/10 p-2.5 md:p-3 rounded-full backdrop-blur-md group-hover:bg-black/60 transition">
              {icon}
            </div>
            <span className="text-white text-[10px] md:text-[11px] font-semibold drop-shadow-md">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Bottom Left Controls Stack ───────────────────────────────────── */}
      <div
        className="absolute left-3 right-14 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] md:left-4 md:right-auto md:bottom-20 z-30 flex flex-col justify-end items-start gap-2 pointer-events-none md:w-64"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >

        {/* Translation error toast */}
        {translationError && (
          <div className="pointer-events-none w-full">
            <span className="text-[10px] font-semibold text-red-300 bg-black/60 border border-red-500/40 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5">
              ⚠ {translationError}
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center max-w-full">
          {/* Amen count */}
          <div className="pointer-events-auto">
            <span className="text-white/80 text-[10px] font-bold tracking-widest uppercase bg-black/40 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5">
              🙏 <span className="text-white">{amenCount}</span> {amenCount === 1 ? 'Amen' : 'Amens'}
            </span>
          </div>

          {/* Translation switcher */}
          <div
            className={`pointer-events-auto flex items-center gap-1 bg-black/40 border px-1.5 py-1 rounded-full backdrop-blur-md shadow-lg transition ${
              translationError ? 'border-red-500/50' : 'border-white/10'
            }`}
            aria-busy={translationLoading}
          >
            {TRANSLATION_OPTIONS.map(key => {
              const isActive = translation === key;
              const isPending = pendingTranslation === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => changeTranslation(key)}
                  disabled={translationLoading}
                  aria-label={`Switch to ${key} translation`}
                  aria-pressed={isActive}
                  className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition cursor-pointer disabled:cursor-wait min-w-[2rem] ${
                    isActive
                      ? 'bg-white text-black shadow-sm'
                      : 'text-white/60 hover:text-white disabled:opacity-40'
                  } ${isPending ? 'animate-pulse' : ''}`}
                >
                  {isPending ? '…' : key}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio narrator */}
        <div className="pointer-events-auto relative w-full">
          <AudioNarrator verse={verse} isVisible={isVisible} />
        </div>
      </div>

      {/* ── Branding watermark ───────────────────────────────────────────── */}
      <div
        className="absolute bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 pointer-events-none"
      >
        <span className="text-white/30 text-[9px] font-bold tracking-[0.35em] uppercase pointer-events-none">
          † VERSE VERSE
        </span>
        <a
          href="https://www.biblefunlandstudios.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[8px] font-semibold tracking-wider text-white/25 hover:text-amber-300/70 transition-colors pointer-events-auto"
        >
          ✦ BibleFunLand Studios
        </a>
      </div>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}
      {isMeditating && <MeditationOverlay verse={verse} onClose={() => setIsMeditating(false)} />}
      {isShareBuilderOpen && (
        <CardBuilderModal isOpen={isShareBuilderOpen} onClose={() => setIsShareBuilderOpen(false)} verse={verse} />
      )}
    </div>
  );
}
