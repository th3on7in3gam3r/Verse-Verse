'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
import CardBuilderModal from './components/CardBuilderModal';
import OnboardingTutorial from './components/OnboardingTutorial';

// ─── Auth-aware loading skeleton shown while session resolves ─────────────────
// Fix #10: consumes `loading` from AuthContext so the header never flashes
// "Sign In" for already-authenticated users.
function HeaderAuthSkeleton() {
  return (
    <div className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-none">
      {/* Streak pill placeholder */}
      <div className="w-14 h-7 rounded-full bg-white/5 animate-pulse" />
      {/* Auth button placeholder */}
      <div className="w-20 h-7 rounded-full bg-white/5 animate-pulse" />
    </div>
  );
}

function MainApp() {
  // Fix #10: pull `loading` so we can suppress the auth flash
  const { loading: authLoading } = useAuth();

  // Daily-seeded shuffle — same order all day, changes every midnight UTC.
  // useMemo with no deps means it runs once per mount and is stable for the
  // entire session, which is exactly what we want.
  const verses = useMemo(() => getDailyShuffledVerses(versesData), []);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeVerseIndices, setActiveVerseIndices] = useState({
    'For You': 0,
    'Strength': 0,
    'Comfort': 0,
    'Love': 0,
  });
  const [commentsOpenFor, setCommentsOpenFor]     = useState(null);
  const [aiCompanionOpen, setAiCompanionOpen]     = useState(false);
  const [isHoveringHeader, setIsHoveringHeader]   = useState(false);
  const [isDashboardOpen, setIsDashboardOpen]     = useState(false);
  const [selectedVerseForShare, setSelectedVerseForShare] = useState(null);
  const [showTutorial, setShowTutorial]           = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('verseverse_tutorial_completed');
    if (!completed) setShowTutorial(true);
  }, []);

  const horizontalContainerRef = useRef(null);
  const categories = ['For You', 'Strength', 'Comfort', 'Love'];

  const categoryVerses = {
    'For You': verses,
    'Strength': verses.filter(v => v.theme === 'Strength'),
    'Comfort':  verses.filter(v => v.theme === 'Comfort'),
    'Love':     verses.filter(v => v.theme === 'Love'),
  };

  const handleHorizontalScroll = (e) => {
    const { scrollLeft, clientWidth } = e.currentTarget;
    if (clientWidth === 0) return;
    const index = Math.round(scrollLeft / clientWidth);
    if (index !== activeCategoryIndex && index >= 0 && index < categories.length) {
      setActiveCategoryIndex(index);
    }
  };

  const handleVerticalScroll = (categoryName) => (e) => {
    const { scrollTop, clientHeight } = e.currentTarget;
    if (clientHeight === 0) return;
    const index = Math.round(scrollTop / clientHeight);
    if (activeVerseIndices[categoryName] !== index) {
      setActiveVerseIndices(prev => ({ ...prev, [categoryName]: index }));
    }
  };

  const scrollToCategory = (index) => {
    if (!horizontalContainerRef.current) return;
    const width = horizontalContainerRef.current.clientWidth;
    horizontalContainerRef.current.scrollTo({ left: index * width, behavior: 'smooth' });
    setActiveCategoryIndex(index);
  };

  const currentCategoryName = categories[activeCategoryIndex];
  const currentVerseIndex   = activeVerseIndices[currentCategoryName] || 0;
  const shouldHideHeader    = currentVerseIndex > 0 && !isHoveringHeader;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">

      {/* ── Top Header Overlay ─────────────────────────────────────────────── */}
      {/* Hover-reveal zone: mouse near top brings controls back */}
      <div
        onMouseEnter={() => setIsHoveringHeader(true)}
        onMouseLeave={() => setIsHoveringHeader(false)}
        className="absolute top-0 left-0 w-full h-36 z-40 pointer-events-none"
      >
        {/* Invisible hover-trigger strip */}
        <div className="absolute top-0 left-0 w-full h-12 pointer-events-auto" />

        {/* ── Row 1: pill controls — left side (Companion + Ambience) ──────── */}
        {/* Fix #11: Companion and BackgroundMusic share the same row at top-4  */}
        {/* so they never overlap the VerseOfTheDay banner below them.          */}
        <div className={`absolute top-0 left-0 w-full transition-all duration-500 ease-in-out pointer-events-none ${shouldHideHeader ? '-translate-y-24 opacity-0' : ''}`}>

          {/* LEFT: AI Companion button */}
          <button
            onClick={() => setAiCompanionOpen(true)}
            className="absolute top-4 left-4 z-40 bg-black/40 hover:bg-black/60 border border-teal-500/30 hover:border-teal-500/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center gap-1.5 shadow-lg shadow-teal-500/5 hover:shadow-teal-500/20 active:scale-95 cursor-pointer pointer-events-auto"
          >
            <Sparkles size={14} className="text-teal-400 animate-pulse" />
            <span>Companion</span>
          </button>

          {/* LEFT: Ambience / Music player — anchored right of Companion pill */}
          {/* BackgroundMusic positions itself at top-4 left-36 internally      */}
          <div className="pointer-events-auto">
            <BackgroundMusic />
          </div>

          {/* RIGHT: Streak counter + auth button                               */}
          {/* Fix #10: show skeleton while auth session is resolving            */}
          {authLoading
            ? <HeaderAuthSkeleton />
            : <StreakCounter onOpenDashboard={() => setIsDashboardOpen(true)} />
          }
        </div>

        {/* ── Row 2: VerseOfTheDay banner — sits below the pill row ─────────── */}
        {/* top-14 (3.5rem) clears the 28px pill + 16px top offset = ~44px      */}
        <div className={`absolute top-14 left-0 w-full transition-all duration-500 ease-in-out ${shouldHideHeader ? '-translate-y-44 opacity-0' : ''}`}>
          <VerseOfTheDay />
        </div>

        {/* ── Row 3: Category selector pill — centred, floats below banner ──── */}
        <div className={`absolute top-[4.75rem] left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-3 md:gap-6 bg-black/30 border border-white/10 backdrop-blur-md px-5 md:px-6 py-2.5 rounded-full shadow-lg pointer-events-auto transition-all duration-500 ease-in-out ${shouldHideHeader ? '-translate-y-36 opacity-0 pointer-events-none' : ''}`}>
          {categories.map((cat, index) => (
            <button
              key={cat}
              onClick={() => scrollToCategory(index)}
              className={`text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                activeCategoryIndex === index
                  ? 'text-white scale-105 drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {/* ── End Header Overlay ─────────────────────────────────────────────── */}

      {/* ── Main Horizontal Snapping Feed ─────────────────────────────────── */}
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
                const isVisible =
                  activeCategoryIndex === catIndex &&
                  activeVerseIndices[cat] === index;
                return (
                  <div
                    key={`${cat}-${verse.id}`}
                    className="w-full h-full snap-section relative"
                  >
                    <VerseCard
                      verse={verse}
                      isVisible={isVisible}
                      onOpenComments={setCommentsOpenFor}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Global Overlays ────────────────────────────────────────────────── */}
      <CommentDrawer
        isOpen={commentsOpenFor !== null}
        onClose={() => setCommentsOpenFor(null)}
        verseId={commentsOpenFor}
      />

      <AICompanionDrawer
        isOpen={aiCompanionOpen}
        onClose={() => setAiCompanionOpen(false)}
      />

      {isDashboardOpen && (
        <UserDashboardModal
          isOpen={isDashboardOpen}
          onClose={() => setIsDashboardOpen(false)}
          onOpenShareCard={(verse) => setSelectedVerseForShare(verse)}
        />
      )}

      {selectedVerseForShare && (
        <CardBuilderModal
          isOpen={selectedVerseForShare !== null}
          onClose={() => setSelectedVerseForShare(null)}
          verse={selectedVerseForShare}
        />
      )}

      {showTutorial && (
        <OnboardingTutorial onClose={() => setShowTutorial(false)} />
      )}
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
