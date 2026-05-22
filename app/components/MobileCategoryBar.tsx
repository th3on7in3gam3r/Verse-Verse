'use client';

type MobileCategoryBarProps = {
  categories: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export default function MobileCategoryBar({
  categories,
  activeIndex,
  onSelect,
}: MobileCategoryBarProps) {
  return (
    <nav
      className="md:hidden overflow-x-auto no-scrollbar px-3 pb-1"
      aria-label="Verse categories"
    >
      <div className="flex gap-1.5 min-w-min">
        {categories.map((cat, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelect(index)}
              aria-current={isActive ? 'page' : undefined}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-black shadow-md'
                  : 'bg-white/10 text-white/55 border border-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
