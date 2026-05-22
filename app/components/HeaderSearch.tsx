'use client';

import { useRef, type MouseEvent } from 'react';
import { Search, X } from 'lucide-react';

type HeaderSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function HeaderSearch({ value, onChange }: HeaderSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  const clearSearch = (e: MouseEvent) => {
    e.stopPropagation();
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div
      role="search"
      className="relative z-[80] flex items-center gap-1.5 min-h-[44px] md:min-h-[38px] rounded-full border border-white/15 bg-black/45 hover:bg-black/55 backdrop-blur-xl px-2 md:px-3 py-1 transition-all duration-200 focus-within:border-teal-500/40 focus-within:bg-black/60 focus-within:shadow-lg focus-within:shadow-teal-500/15 w-[11.5rem] sm:w-52 md:w-56 touch-manipulation"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          focusInput();
        }}
        className="shrink-0 flex items-center justify-center min-w-[36px] min-h-[36px] md:min-w-[28px] md:min-h-[28px] rounded-full hover:bg-white/10 cursor-pointer transition-colors"
        aria-label="Focus search"
      >
        <Search size={17} className="text-white/75" />
      </button>

      <input
        ref={inputRef}
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Book, chapter, or word…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-transparent border-none outline-none text-white text-[11px] md:text-xs font-bold tracking-wide placeholder:text-white/40 py-1"
        aria-label="Search verses"
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={clearSearch}
          className="shrink-0 flex items-center justify-center min-w-[32px] min-h-[32px] rounded-full text-white/50 hover:text-white hover:bg-white/10 cursor-pointer transition-colors"
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </div>
  );
}
