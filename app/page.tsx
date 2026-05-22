'use client';

import { ChangeEvent, UIEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import versesData from '../data/verses.json';
import { getDailyShuffledVerses } from '../lib/shuffleVerses';
import VerseCard from './components/VerseCard';
import CommentDrawer from './components/CommentDrawer';
import VerseOfTheDay from './components/VerseOfTheDay';
import StreakCounter from './components/StreakCounter';
import BackgroundMusic from './components/BackgroundMusic';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import AICompanionDrawer from './components/AICompanionDrawer';
import PrayerWaveNotifier from './components/PrayerWaveNotifier';
import PrayerWaveOverlay from './components/PrayerWaveOverlay';
import { Sparkles } from 'lucide-react';
import UserDashboardModal from './components/UserDashboardModal';
import HeaderSearch from './components/HeaderSearch';
import SearchFeed from './components/SearchFeed';
import CardBuilderModal from './components/CardBuilderModal';
import OnboardingTutorial from './components/OnboardingTutorial';
import BibleFunLandStudiosBanner from './components/BibleFunLandStudiosBanner';
import MobileHeader from './components/MobileHeader';

interface VerseData {
  id: string;
  text: string;
  reference: string;
  theme: string;
  translation: string;
  background: string;
  media?: {
    image?: string;
    video?: string;
  };
}

type TranslationPreference = 'NIV' | 'ESV' | 'KJV';

type RawVerse = VerseData;

function HeaderAuthSkeleton() {
  return (
    <div className="flex items-center gap-2 pointer-events-none">
      <div className="w-14 h-7 rounded-full bg-white/5 animate-pulse" />
      <div className="w-20 h-7 rounded-full bg-white/5 animate-pulse" />
    </div>
  );
}

function MainApp() {
  const { loading: authLoading } = useAuth();
  const verses = useMemo(() => getDailyShuffledVerses(versesData as RawVerse[]), []);

  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeVerseIndices, setActiveVerseIndices] = useState({
    'For You': 0,
    'Strength': 0,
    'Comfort': 0,
    'Love': 0,
  });
  const [commentsOpenFor, setCommentsOpenFor] = useState<string | null>(null);
  const [aiCompanionOpen, setAiCompanionOpen] = useState(false);
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [selectedVerseForShare, setSelectedVerseForShare] = useState<RawVerse | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cycleMessage, setCycleMessage] = useState('');
  const [preferredTranslation, setPreferredTranslation] = useState<TranslationPreference>('NIV');
  const [seenForYouIds, setSeenForYouIds] = useState<Set<string>>(new Set());

  const horizontalContainerRef = useRef<HTMLDivElement | null>(null);
  const categories = ['For You', 'Strength', 'Comfort', 'Love'];
  const forYouVerseCount = verses.length;

  useEffect(() => {
    const completed = localStorage.getItem('verseverse_tutorial_completed');
    if (!completed) setShowTutorial(true);

    const savedTranslation = localStorage.getItem('verseverse_translation_preference');
    if (savedTranslation === 'ESV' || savedTranslation === 'KJV' || savedTranslation === 'NIV') {
      setPreferredTranslation(savedTranslation);
    }
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) setCycleMessage('');
  }, [searchQuery]);

  useEffect(() => {
    if (!cycleMessage) return;
    const timer = window.setTimeout(() => setCycleMessage(''), 5000);
    return () => window.clearTimeout(timer);
  }, [cycleMessage]);

  const handleRecordSeen = useCallback(
    (verseId: string, category: string) => {
      // Only track the main "For You" feed (40 curated cards) — not Strength/Comfort/Love or search
      if (category !== 'For You') return;

      setSeenForYouIds((prev) => {
        if (prev.has(verseId)) return prev;
        const next = new Set(prev);
        next.add(verseId);

        if (next.size >= forYouVerseCount) {
          setCycleMessage("You've seen today's For You feed — starting over 🔄");
          return new Set();
        }

        return next;
      });
    },
    [forYouVerseCount],
  );

  const categoryVerses = {
    'For You': verses,
    'Strength': verses.filter((v) => v.theme === 'Strength'),
    'Comfort': verses.filter((v) => v.theme === 'Comfort'),
    'Love': verses.filter((v) => v.theme === 'Love'),
  };

  const handleHorizontalScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollLeft, clientWidth } = event.currentTarget;
    if (clientWidth === 0) return;
    const index = Math.round(scrollLeft / clientWidth);
    if (index !== activeCategoryIndex && index >= 0 && index < categories.length) {
      setActiveCategoryIndex(index);
    }
  };

  const handleVerticalScroll = (categoryName: string) => (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight } = event.currentTarget;
    if (clientHeight === 0) return;
    const index = Math.round(scrollTop / clientHeight);
    if (activeVerseIndices[categoryName] !== index) {
      setActiveVerseIndices((prev) => ({ ...prev, [categoryName]: index }));
    }
  };

  const scrollToCategory = (index: number) => {
    if (!horizontalContainerRef.current) return;
    const width = horizontalContainerRef.current.clientWidth;
    horizontalContainerRef.current.scrollTo({ left: index * width, behavior: 'smooth' });
    setActiveCategoryIndex(index);
  };

  const currentCategoryName = categories[activeCategoryIndex];
  const currentVerseIndex = activeVerseIndices[currentCategoryName] || 0;
  const isSearching = searchQuery.trim().length > 0;
  const shouldHideHeader = currentVerseIndex > 0 && !isHoveringHeader && !isSearching;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">

      {/* ── BibleFunLand Studios — ecosystem link ───────────────────────────── */}
      <div className="absolute inset-x-0 top-0 z-[42] pointer-events-auto">
        <BibleFunLandStudiosBanner />
      </div>

      {/* ── Header overlay — floats above the feed, takes no space ─────────── */}
      <div className="absolute inset-x-0 top-0 z-[55] pointer-events-none" style={{ paddingTop: '2.25rem' }}>
        
        {/* Tap/hover zone to reveal header (desktop feed scroll) */}
        <div
          className="absolute left-0 top-0 h-24 z-0 pointer-events-auto cursor-pointer right-[13rem] sm:right-[14rem] md:right-[18rem] max-md:hidden"
          onMouseEnter={() => setIsHoveringHeader(true)}
          onMouseLeave={() => setIsHoveringHeader(false)}
          onClick={() => setIsHoveringHeader((p) => !p)}
          aria-hidden
        />

        {/* Gradient scrim so controls are readable over any background */}
        <div
          className={`absolute inset-x-0 top-0 h-44 md:h-32 bg-gradient-to-b from-black/70 via-black/20 to-transparent pointer-events-none transition-opacity duration-500 max-md:opacity-100 ${
            shouldHideHeader ? 'md:opacity-0' : 'opacity-100'
          }`}
        />

        {/* Controls — mobile: two-row header + category tabs; desktop: single row */}
        <div
          onMouseEnter={() => setIsHoveringHeader(true)}
          onMouseLeave={() => setIsHoveringHeader(false)}
          className={`relative z-[60] transition-all duration-500 ease-in-out pointer-events-auto max-md:opacity-100 max-md:translate-y-0 ${
            shouldHideHeader
              ? 'md:-translate-y-24 md:opacity-0 md:pointer-events-none'
              : 'opacity-100'
          }`}
        >
          <MobileHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            authLoading={authLoading}
            onOpenDashboard={() => setIsDashboardOpen(true)}
            onOpenCompanion={() => setAiCompanionOpen(true)}
            categories={categories}
            activeCategoryIndex={activeCategoryIndex}
            onCategorySelect={scrollToCategory}
          />

          <div className="hidden md:flex items-center justify-between gap-2 px-6 pt-4">
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setAiCompanionOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/25 bg-black/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-300 shadow-lg backdrop-blur-xl transition hover:bg-black/60 hover:text-white whitespace-nowrap"
              >
                <Sparkles size={13} className="text-teal-300" />
                <span>Companion</span>
              </button>
              <BackgroundMusic />
            </div>

            <div className="flex flex-1 items-center justify-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-xl mx-4">
              {categories.map((cat, index) => (
                <button
                  key={cat}
                  onClick={() => scrollToCategory(index)}
                  className={`text-[11px] font-bold uppercase tracking-widest transition whitespace-nowrap ${
                    activeCategoryIndex === index ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative z-[70] flex items-center gap-2 shrink-0">
              <HeaderSearch value={searchQuery} onChange={setSearchQuery} />
              {authLoading ? <HeaderAuthSkeleton /> : <StreakCounter onOpenDashboard={() => setIsDashboardOpen(true)} />}
            </div>
          </div>
        </div>
      </div>

      {/* Verse of the Day — daily streak (For You, first card) */}
      {!isSearching && activeCategoryIndex === 0 && currentVerseIndex === 0 && (
        <div
          className={`absolute inset-x-0 top-[9.25rem] md:top-28 z-[45] transition-all duration-500 ease-out pointer-events-auto px-3 md:px-0 ${
            shouldHideHeader ? 'md:opacity-90 md:translate-y-0' : 'opacity-100'
          }`}
        >
          <VerseOfTheDay />
        </div>
      )}

      {/* Cycle message */}
      {cycleMessage && (
        <div className="absolute top-[10.25rem] md:top-28 left-0 w-full px-4 z-40 pointer-events-none">
          <div className="mx-auto max-w-sm rounded-full border border-white/10 bg-black/50 px-4 py-2 text-center text-xs text-white/70 backdrop-blur-xl">
            {cycleMessage}
          </div>
        </div>
      )}

      {/* ── Full-height verse feed — no top padding ─────────────────────────── */}
      <div className="absolute inset-0">
        {isSearching ? (
          <SearchFeed
            query={searchQuery}
            translation={preferredTranslation}
            onOpenComments={setCommentsOpenFor}
          />
        ) : (
          <div
            ref={horizontalContainerRef}
            onScroll={handleHorizontalScroll}
            className="w-full h-full snap-x-container no-scrollbar"
          >
            {categories.map((cat, catIndex) => (
              <div key={cat} className="snap-x-section">
                <div
                  onScroll={handleVerticalScroll(cat)}
                  className="w-full h-full overflow-y-auto snap-y-container no-scrollbar"
                >
                  {categoryVerses[cat].map((verse, index) => {
                    const isVisible = activeCategoryIndex === catIndex && activeVerseIndices[cat] === index;
                    return (
                      <div key={`${cat}-${verse.id}`} className="w-full h-full snap-section relative">
                        <VerseCard
                          verse={verse}
                          isVisible={isVisible}
                          onOpenComments={setCommentsOpenFor}
                          onSeen={(verseId) => handleRecordSeen(verseId, cat)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CommentDrawer isOpen={commentsOpenFor !== null} onClose={() => setCommentsOpenFor(null)} verseId={commentsOpenFor} />
      <AICompanionDrawer isOpen={aiCompanionOpen} onClose={() => setAiCompanionOpen(false)} />

      {isDashboardOpen && (
        <UserDashboardModal
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          onOpenShareCard={(verse) => setSelectedVerseForShare(verse)}
        />
      )}

      {selectedVerseForShare && (
        <CardBuilderModal isOpen={selectedVerseForShare !== null} onClose={() => setSelectedVerseForShare(null)} verse={selectedVerseForShare} />
      )}

      {showTutorial && <OnboardingTutorial onClose={() => setShowTutorial(false)} />}
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <MainApp />
      <AuthModal />
      <PrayerWaveNotifier />
      <PrayerWaveOverlay />
    </AuthProvider>
  );
}
