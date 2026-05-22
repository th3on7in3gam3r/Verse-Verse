'use client';

const STUDIOS_URL = 'https://www.biblefunlandstudios.com';

export default function BibleFunLandStudiosBanner({ className = '' }) {
  return (
    <a
      href={STUDIOS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit BibleFunLand Studios — faith-inspired creative media"
      className={`group flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-center transition-all duration-300 border-b border-white/10 bg-black/45 backdrop-blur-xl hover:bg-black/65 hover:border-amber-400/25 ${className}`}
      style={{ paddingTop: 'max(0.35rem, env(safe-area-inset-top))' }}
    >
      <span className="text-amber-400/90 text-[11px] shrink-0" aria-hidden="true">
        ✦
      </span>
      <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-white/75 group-hover:text-white transition-colors">
        BibleFunLand Studios
      </span>
      <span className="hidden sm:inline text-[10px] text-white/40 font-medium">
        — Faith-inspired creative media
      </span>
      <span className="text-[9px] sm:text-[10px] font-bold text-teal-400/80 group-hover:text-teal-300 transition-colors shrink-0">
        <span className="sm:hidden">→</span>
        <span className="hidden sm:inline">Explore →</span>
      </span>
    </a>
  );
}
