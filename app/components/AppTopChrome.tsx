'use client';

import { Sparkles } from 'lucide-react';
import BibleFunLandStudiosBanner from './BibleFunLandStudiosBanner';
import BackgroundMusic from './BackgroundMusic';
import HeaderSearch from './HeaderSearch';
import StreakCounter from './StreakCounter';
import MobileCategoryBar from './MobileCategoryBar';

type AppTopChromeProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  authLoading: boolean;
  onOpenDashboard: () => void;
  onOpenCompanion: () => void;
  categories: string[];
  activeCategoryIndex: number;
  onCategorySelect: (index: number) => void;
  shouldHideNav: boolean;
  isHoveringHeader: boolean;
  onHoverHeader: (hovering: boolean) => void;
  onToggleHeader: () => void;
};

function HeaderAuthSkeleton() {
  return (
    <div className="flex items-center gap-2 pointer-events-none">
      <div className="w-14 h-7 rounded-full bg-white/5 animate-pulse" />
      <div className="w-20 h-7 rounded-full bg-white/5 animate-pulse" />
    </div>
  );
}

export default function AppTopChrome({
  searchQuery,
  onSearchChange,
  authLoading,
  onOpenDashboard,
  onOpenCompanion,
  categories,
  activeCategoryIndex,
  onCategorySelect,
  shouldHideNav,
  isHoveringHeader,
  onHoverHeader,
  onToggleHeader,
}: AppTopChromeProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex flex-col pointer-events-none">
      {/* Studios link — always visible and clickable */}
      <div className="pointer-events-auto shrink-0 relative z-20">
        <BibleFunLandStudiosBanner />
      </div>

      {/* App navigation — sits below the banner, never overlaps it */}
      <div className="relative pointer-events-none">
        {/* Desktop tap zone to reveal nav after scroll (nav area only) */}
        <div
          className="absolute inset-x-0 top-0 h-16 z-0 pointer-events-auto cursor-pointer right-[13rem] sm:right-[14rem] md:right-[18rem] max-md:hidden"
          onMouseEnter={() => onHoverHeader(true)}
          onMouseLeave={() => onHoverHeader(false)}
          onClick={onToggleHeader}
          aria-hidden
        />

        <div
          className={`absolute inset-x-0 top-0 h-full min-h-[3.5rem] md:min-h-[4rem] bg-gradient-to-b from-black/75 via-black/35 to-transparent pointer-events-none transition-opacity duration-500 max-md:opacity-100 ${
            shouldHideNav && !isHoveringHeader ? 'md:opacity-0' : 'opacity-100'
          }`}
        />

        <div
          onMouseEnter={() => onHoverHeader(true)}
          onMouseLeave={() => onHoverHeader(false)}
          className={`relative z-10 transition-all duration-500 ease-in-out pointer-events-auto max-md:opacity-100 max-md:translate-y-0 ${
            shouldHideNav && !isHoveringHeader
              ? 'md:-translate-y-full md:opacity-0 md:pointer-events-none'
              : 'opacity-100'
          }`}
        >
          {/* Mobile */}
          <div className="md:hidden flex flex-col gap-2 px-3 pt-2 pb-2 border-b border-white/10 bg-black/55 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-2 min-h-[44px]">
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onOpenCompanion}
                  aria-label="Open Companion"
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full border border-teal-400/30 bg-black/45 backdrop-blur-xl text-teal-300 cursor-pointer"
                >
                  <Sparkles size={18} />
                </button>
                <BackgroundMusic />
              </div>

              <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                <HeaderSearch value={searchQuery} onChange={onSearchChange} />
                {authLoading ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-10 h-9 rounded-full bg-white/10 animate-pulse" />
                    <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
                  </div>
                ) : (
                  <StreakCounter onOpenDashboard={onOpenDashboard} compact />
                )}
              </div>
            </div>

            <MobileCategoryBar
              categories={categories}
              activeIndex={activeCategoryIndex}
              onSelect={onCategorySelect}
            />
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center justify-between gap-2 px-6 py-2.5 border-b border-white/10 bg-black/55 backdrop-blur-xl">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onOpenCompanion}
                className="inline-flex items-center gap-1.5 rounded-full border border-teal-400/25 bg-black/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-300 shadow-lg backdrop-blur-xl transition hover:bg-black/60 hover:text-white whitespace-nowrap cursor-pointer"
              >
                <Sparkles size={13} className="text-teal-300" />
                <span>Companion</span>
              </button>
              <BackgroundMusic />
            </div>

            <div className="flex flex-1 items-center justify-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-xl mx-4 min-w-0">
              {categories.map((cat, index) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onCategorySelect(index)}
                  className={`text-[11px] font-bold uppercase tracking-widest transition whitespace-nowrap cursor-pointer ${
                    activeCategoryIndex === index
                      ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative z-[70] flex items-center gap-2 shrink-0">
              <HeaderSearch value={searchQuery} onChange={onSearchChange} />
              {authLoading ? <HeaderAuthSkeleton /> : <StreakCounter onOpenDashboard={onOpenDashboard} />}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
