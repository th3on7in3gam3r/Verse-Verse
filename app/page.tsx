'use client';

import { ChangeEvent, UIEvent, useCallback, useEffect, useRef, useState } from 'react';
import versesData from '../data/verses.json';
import { getDailyShuffledVerses } from '../lib/shuffleVerses';
import VerseCard from './components/VerseCard';
import CommentDrawer from './components/CommentDrawer';
import VerseOfTheDay from './components/VerseOfTheDay';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import AICompanionDrawer from './components/AICompanionDrawer';
import PrayerWaveNotifier from './components/PrayerWaveNotifier';
import PrayerWaveOverlay from './components/PrayerWaveOverlay';
import UserDashboardModal from './components/UserDashboardModal';
import SearchFeed from './components/SearchFeed';
import CardBuilderModal from './components/CardBuilderModal';
import OnboardingTutorial from './components/OnboardingTutorial';
import AppTopChrome from './components/AppTopChrome';

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

function FeedLoadingState() {
  return (
    <div className="w-full h-full flex items-center justify-center px-6">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl shadow-2xl">
        <div className="h-4 w-28 rounded-full bg-white/10 animate-pulse" />
        <div className="mt-6 space-y-3">
          <div className="h-8 w-full rounded-xl bg-white/10 animate-pulse" />
          <div className="h-8 w-11/12 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-8 w-10/12 rounded-xl bg-white/10 animate-pulse" />
        </div>
        <div className="mt-6 h-4 w-36 rounded-full bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

function MainApp() {
  const { loading: authLoading } = useAuth();
  const [verses, setVerses] = useState<RawVerse[] | null>(null);

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
  const feedVerses = verses ?? [];
  const forYouVerseCount = feedVerses.length;

  useEffect(() => {
    setVerses(getDailyShuffledVerses(versesData as RawVerse[]));
  }, []);

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
    'For You': feedVerses,
    'Strength': feedVerses.filter((v) => v.theme === 'Strength'),
    'Comfort': feedVerses.filter((v) => v.theme === 'Comfort'),
    'Love': feedVerses.filter((v) => v.theme === 'Love'),
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
  const shouldHideNav = currentVerseIndex > 0 && !isHoveringHeader && !isSearching;
  const isChromeSuppressed = aiCompanionOpen || isDashboardOpen || commentsOpenFor !== null;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">

      {!isChromeSuppressed && (
        <AppTopChrome
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          authLoading={authLoading}
          onOpenDashboard={() => setIsDashboardOpen(true)}
          onOpenCompanion={() => setAiCompanionOpen(true)}
          categories={categories}
          activeCategoryIndex={activeCategoryIndex}
          onCategorySelect={scrollToCategory}
          shouldHideNav={shouldHideNav}
          isHoveringHeader={isHoveringHeader}
          onHoverHeader={setIsHoveringHeader}
          onToggleHeader={() => setIsHoveringHeader((prev) => !prev)}
        />
      )}

      {/* Verse of the Day — daily streak (For You, first card) */}
      {!isSearching && activeCategoryIndex === 0 && currentVerseIndex === 0 && (
        <div
          className={`absolute inset-x-0 top-[9.5rem] md:top-[7.25rem] z-[45] transition-all duration-500 ease-out pointer-events-auto px-3 md:px-0 ${
            shouldHideNav ? 'md:opacity-90 md:translate-y-0' : 'opacity-100'
          }`}
        >
          <VerseOfTheDay />
        </div>
      )}

      {/* Cycle message */}
      {cycleMessage && (
        <div className="absolute top-[10.5rem] md:top-[8rem] left-0 w-full px-4 z-40 pointer-events-none">
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
        ) : !verses ? (
          <FeedLoadingState />
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
