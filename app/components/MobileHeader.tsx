'use client';

import { Sparkles } from 'lucide-react';
import BackgroundMusic from './BackgroundMusic';
import HeaderSearch from './HeaderSearch';
import StreakCounter from './StreakCounter';
import MobileCategoryBar from './MobileCategoryBar';

type MobileHeaderProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  authLoading: boolean;
  onOpenDashboard: () => void;
  onOpenCompanion: () => void;
  categories: string[];
  activeCategoryIndex: number;
  onCategorySelect: (index: number) => void;
};

export default function MobileHeader({
  searchQuery,
  onSearchChange,
  authLoading,
  onOpenDashboard,
  onOpenCompanion,
  categories,
  activeCategoryIndex,
  onCategorySelect,
}: MobileHeaderProps) {
  return (
    <div className="md:hidden flex flex-col gap-2 pt-2 pb-1">
      <div className="flex items-center justify-between gap-2 px-3 min-h-[44px]">
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
  );
}
