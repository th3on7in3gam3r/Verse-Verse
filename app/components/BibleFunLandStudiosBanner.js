'use client';

const STUDIOS_URL = 'https://www.biblefunlandstudios.com';

export default function BibleFunLandStudiosBanner({ className = '' }) {
  return (
    <a
      href={STUDIOS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit BibleFunLand Studios — faith-inspired creative media"
      className={`group flex items-center justify-between gap-3 px-3 sm:px-5 py-2 sm:py-2.5 min-h-[2.5rem] sm:min-h-[2.75rem] transition-all duration-300 border-b border-white/10 bg-black/70 backdrop-blur-xl hover:bg-black/85 hover:border-amber-400/25 ${className}`}
      style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
    >
      <span className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <span className="text-amber-400/90 text-[11px] shrink-0" aria-hidden="true">
          ✦
        </span>
        <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-white/80 group-hover:text-white transition-colors truncate">
          BibleFunLand Studios
        </span>
        <span className="hidden lg:inline text-[10px] text-white/40 font-medium truncate">
          — Faith-inspired creative media
        </span>
      </span>
      <span className="text-[10px] font-bold text-teal-400/90 group-hover:text-teal-300 transition-colors shrink-0 whitespace-nowrap">
        Explore →
      </span>
    </a>
  );
}
