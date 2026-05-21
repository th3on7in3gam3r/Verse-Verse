'use client';

import { useState, useRef, useEffect } from 'react';
import {
  X, Download, Copy, Share2, AlignLeft, AlignCenter, AlignRight, Sparkles, Wand2,
} from 'lucide-react';

const BACKGROUNDS = [
  { id: 'lavender', name: 'Lavender', value: 'linear-gradient(145deg, #6d28d9 0%, #9333ea 45%, #db2777 100%)' },
  { id: 'ocean', name: 'Ocean', value: 'linear-gradient(145deg, #0369a1 0%, #4f46e5 55%, #7c3aed 100%)' },
  { id: 'sunset', name: 'Sunset', value: 'linear-gradient(145deg, #ea580c 0%, #dc2626 50%, #9d174d 100%)' },
  { id: 'aurora', name: 'Aurora', value: 'linear-gradient(145deg, #0d9488 0%, #2563eb 50%, #6d28d9 100%)' },
  { id: 'royal', name: 'Royal', value: 'linear-gradient(145deg, #4338ca 0%, #7e22ce 50%, #be185d 100%)' },
  { id: 'amber', name: 'Golden', value: 'linear-gradient(145deg, #b45309 0%, #c2410c 40%, #7c2d12 100%)' },
  { id: 'midnight', name: 'Midnight', value: 'linear-gradient(145deg, #312e81 0%, #4c1d95 50%, #1e1b4b 100%)' },
  { id: 'slate', name: 'Slate', value: 'linear-gradient(145deg, #475569 0%, #334155 50%, #1e293b 100%)' },
];

const MOOD_PRESETS = [
  {
    id: 'radiant',
    name: 'Radiant',
    bg: BACKGROUNDS[0],
    border: 'gold',
    texture: 'mesh',
    font: 'serif',
  },
  {
    id: 'calm',
    name: 'Calm',
    bg: BACKGROUNDS[1],
    border: 'glass',
    texture: 'none',
    font: 'sans',
  },
  {
    id: 'bold',
    name: 'Bold',
    bg: BACKGROUNDS[2],
    border: 'neon',
    texture: 'grain',
    font: 'serif',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    bg: BACKGROUNDS[7],
    border: 'none',
    texture: 'none',
    font: 'sans',
  },
];

const FONTS = [
  { id: 'serif', name: 'Serif', class: 'font-serif' },
  { id: 'sans', name: 'Sans', class: 'font-sans' },
  { id: 'mono', name: 'Mono', class: 'font-mono' },
];

const BORDERS = [
  { id: 'none', name: 'Minimal', class: 'border-0' },
  { id: 'glass', name: 'Glass', class: 'border border-white/25 bg-white/10 backdrop-blur-md' },
  { id: 'neon', name: 'Teal Halo', class: 'border border-teal-400/40 shadow-[0_0_30px_rgba(45,212,191,0.2)] bg-white/5' },
  { id: 'gold', name: 'Gold Halo', class: 'border border-amber-400/45 shadow-[0_0_30px_rgba(251,191,36,0.22)] bg-white/5' },
];

const TEXTURES = [
  { id: 'none', name: 'Smooth' },
  { id: 'grain', name: 'Grain' },
  { id: 'mesh', name: 'Cosmic' },
  { id: 'stripes', name: 'Lines' },
];

function StudioLabel({ children }) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 block mb-2">
      {children}
    </label>
  );
}

function ChipButton({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
        active
          ? 'card-studio-chip-active'
          : 'bg-white/10 border-white/15 text-white/80 hover:bg-white/15 hover:border-white/25 hover:text-white'
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/12 bg-white/[0.06] p-4 backdrop-blur-sm">
      {title && <StudioLabel>{title}</StudioLabel>}
      {children}
    </section>
  );
}

export default function CardBuilderModal({ isOpen, onClose, verse }) {
  const [bgMode, setBgMode] = useState('presets');
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [customColor1, setCustomColor1] = useState('#7c3aed');
  const [customColor2, setCustomColor2] = useState('#2563eb');
  const [customAngle, setCustomAngle] = useState(135);
  const [selectedTexture, setSelectedTexture] = useState('mesh');
  const [fontFamily, setFontFamily] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState(26);
  const [alignment, setAlignment] = useState('center');
  const [borderStyle, setBorderStyle] = useState(BORDERS[3]);
  const [activeMood, setActiveMood] = useState('radiant');
  const [isExporting, setIsExporting] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !verse) return null;

  const cardBackground =
    bgMode === 'presets'
      ? background.value
      : `linear-gradient(${customAngle}deg, ${customColor1} 0%, ${customColor2} 100%)`;

  const applyMood = (mood) => {
    setActiveMood(mood.id);
    setBackground(mood.bg);
    setBgMode('presets');
    setBorderStyle(BORDERS.find((b) => b.id === mood.border) || BORDERS[1]);
    setSelectedTexture(mood.texture);
    setFontFamily(FONTS.find((f) => f.id === mood.font) || FONTS[0]);
  };

  const exportCard = async () => {
    const { toPng } = await import('html-to-image');
    return toPng(cardRef.current, {
      pixelRatio: 2.5,
      cacheBust: true,
      style: { transform: 'scale(1)' },
    });
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await exportCard();
      const link = document.createElement('a');
      link.download = `verseverse-${verse.reference.replace(/[\s:]+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating card image:', err);
      alert('Could not generate image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await exportCard();
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      if (navigator.clipboard?.write) {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
        alert('Card copied to clipboard.');
      } else {
        alert('Clipboard not supported — try Download instead.');
      }
    } catch (err) {
      console.error('Error copying card:', err);
      alert('Could not copy — try Download instead.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await exportCard();
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File(
        [blob],
        `verseverse-${verse.reference.replace(/[\s:]+/g, '-')}.png`,
        { type: 'image/png' },
      );
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${verse.reference} — Verse Verse`,
          text: `"${verse.text}" — ${verse.reference}`,
        });
      } else {
        await navigator.clipboard.writeText(
          `"${verse.text}" — ${verse.reference}\n\n${window.location.origin}`,
        );
        alert('Share text copied to clipboard.');
      }
    } catch (err) {
      if (err?.name !== 'AbortError') console.error('Share error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-6 lg:p-8 animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-2xl"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="card-studio-title"
        className="relative z-10 w-full md:max-w-5xl card-studio-shell flex flex-col h-[100dvh] md:h-auto md:max-h-[min(880px,92vh)] rounded-t-[1.75rem] md:rounded-[2rem] border border-white/15 bg-gradient-to-br from-slate-600/90 via-slate-700/95 to-slate-800/95 overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300"
      >
        <div className="absolute -top-20 -right-16 w-64 h-64 bg-purple-400/25 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-amber-400/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-teal-400/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Sticky header — Close always visible (mobile + desktop) */}
        <header
          className="relative z-[70] shrink-0 flex items-center justify-between gap-3 px-4 py-3 md:px-6 border-b border-white/15 bg-slate-800/90 backdrop-blur-xl"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400/25 to-purple-500/25 border border-white/20 shrink-0">
              <Sparkles size={18} className="text-amber-200" />
            </div>
            <div className="min-w-0">
              <h2 id="card-studio-title" className="text-white text-base md:text-lg font-black tracking-tight truncate">
                Card Studio
              </h2>
              <p className="text-[10px] text-white/55 font-medium hidden sm:block">
                Design shareable scripture cards
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full border-2 border-white/25 bg-white text-slate-900 hover:bg-white/90 active:scale-95 transition-all cursor-pointer shadow-lg"
            aria-label="Close Card Studio"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </header>

        <div className="flex flex-1 flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Preview stage */}
        <div className="relative shrink-0 md:flex-1 card-studio-stage px-4 py-5 md:p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/12">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/55 mb-3">
            Live preview
          </p>

          <div className="relative rounded-[1.25rem] overflow-hidden aspect-[9/16] w-[min(42vw,180px)] sm:w-[200px] md:w-[280px] card-studio-device-glow select-none flex-shrink-0">
            <div
              ref={cardRef}
              className="w-full h-full p-7 md:p-8 flex flex-col justify-between items-center relative overflow-hidden"
              style={{ background: cardBackground }}
            >
              <div className="absolute top-[-15%] left-[-25%] w-[90%] aspect-square bg-white/12 rounded-full blur-[50px] pointer-events-none" />
              <div className="absolute bottom-[-15%] right-[-25%] w-[85%] aspect-square bg-amber-200/10 rounded-full blur-[55px] pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/20 pointer-events-none" />

              {selectedTexture === 'grain' && (
                <svg className="absolute inset-0 w-full h-full opacity-[0.1] mix-blend-overlay pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <filter id="cardNoiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                  </filter>
                  <rect width="100%" height="100%" filter="url(#cardNoiseFilter)" />
                </svg>
              )}
              {selectedTexture === 'mesh' && (
                <>
                  <div className="absolute top-[18%] left-[8%] w-[140px] h-[140px] rounded-full bg-teal-300/25 blur-[40px] pointer-events-none" />
                  <div className="absolute bottom-[18%] right-[8%] w-[170px] h-[170px] rounded-full bg-fuchsia-400/20 blur-[50px] pointer-events-none" />
                </>
              )}
              {selectedTexture === 'stripes' && (
                <div
                  className="absolute inset-0 opacity-[0.08] pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0.15) 1px, transparent 1px, transparent 14px)',
                  }}
                />
              )}

              <div className="w-full flex justify-center relative z-10">
                <span className="text-[10px] uppercase font-bold tracking-[0.38em] text-white/75 drop-shadow-sm">
                  † VERSE VERSE
                </span>
              </div>

              <div className={`w-full flex-1 flex flex-col justify-center items-center p-4 rounded-2xl relative z-10 ${borderStyle.class}`}>
                <p
                  className={`text-white leading-relaxed mb-6 font-medium ${fontFamily.class}`}
                  style={{
                    fontSize: `${fontSize}px`,
                    textAlign: alignment,
                    textShadow: '0 2px 20px rgba(0,0,0,0.45), 0 4px 32px rgba(0,0,0,0.25)',
                  }}
                >
                  &ldquo;{verse.text}&rdquo;
                </p>
                <div className="flex flex-col items-center gap-2">
                  <h3
                    className="text-white font-bold text-sm md:text-base tracking-wide"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
                  >
                    {verse.reference}
                  </h3>
                  <span className="bg-white/20 border border-white/25 px-3 py-1 rounded-full text-[9px] text-white font-bold tracking-wider uppercase backdrop-blur-sm">
                    {verse.translation || 'NIV'}
                  </span>
                </div>
              </div>

              <div className="w-full text-center relative z-10 opacity-40">
                <span className="text-[8px] tracking-[0.22em] text-white/70 uppercase">verse-verse.app</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls — scrollable on mobile */}
        <div className="relative flex flex-1 flex-col min-h-0 w-full md:w-[420px] card-studio-panel">
          <div className="flex-1 overflow-y-auto overscroll-contain no-scrollbar px-4 md:px-7 py-4 md:py-5 space-y-4">
            <Section title="Quick moods">
              <div className="grid grid-cols-2 gap-2 -mt-1">
                {MOOD_PRESETS.map((mood) => (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => applyMood(mood)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer ${
                      activeMood === mood.id
                        ? 'card-studio-chip-active'
                        : 'bg-white/10 border-white/15 hover:bg-white/14'
                    }`}
                  >
                    <Wand2 size={14} className="text-amber-200/90 shrink-0" />
                    <span className="text-xs font-bold text-white">{mood.name}</span>
                  </button>
                ))}
              </div>
            </Section>

            <Section title="Background">
              <div className="flex justify-end -mt-7 mb-2">
                <div className="flex bg-white/10 border border-white/15 p-0.5 rounded-full">
                  {['presets', 'custom'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setBgMode(mode)}
                      className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider transition cursor-pointer ${
                        bgMode === mode
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {bgMode === 'presets' ? (
                <div className="grid grid-cols-4 gap-2">
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => {
                        setBackground(bg);
                        setActiveMood('');
                      }}
                      className={`h-12 rounded-xl border-2 overflow-hidden relative cursor-pointer transition-all ${
                        background.id === bg.id
                          ? 'border-white scale-[1.04] shadow-lg shadow-white/20'
                          : 'border-white/20 hover:border-white/40 hover:scale-[1.02]'
                      }`}
                      style={{ background: bg.value }}
                      title={bg.name}
                    >
                      <span className="sr-only">{bg.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Start', value: customColor1, set: setCustomColor1 },
                      { label: 'End', value: customColor2, set: setCustomColor2 },
                    ].map(({ label, value, set }) => (
                      <div key={label}>
                        <span className="text-[9px] text-white/55 uppercase font-bold tracking-wider">{label}</span>
                        <div className="mt-1.5 flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-2.5 py-2">
                          <input
                            type="color"
                            value={value}
                            onChange={(e) => set(e.target.value)}
                            className="w-7 h-7 rounded-lg border-0 cursor-pointer"
                          />
                          <span className="text-[10px] font-mono text-white/70 uppercase truncate">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] text-white/55 font-bold uppercase mb-1.5">
                      <span>Angle</span>
                      <span className="text-amber-200">{customAngle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={customAngle}
                      onChange={(e) => setCustomAngle(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-400 h-1.5 rounded-full appearance-none cursor-pointer bg-white/15"
                    />
                  </div>
                </div>
              )}
            </Section>

            <div className="grid grid-cols-2 gap-3">
              <Section title="Texture">
                <div className="grid grid-cols-2 gap-1.5 -mt-1">
                  {TEXTURES.map((t) => (
                    <ChipButton
                      key={t.id}
                      active={selectedTexture === t.id}
                      onClick={() => setSelectedTexture(t.id)}
                      className="py-2 text-[11px] w-full"
                    >
                      {t.name}
                    </ChipButton>
                  ))}
                </div>
              </Section>
              <Section title="Frame">
                <div className="grid grid-cols-2 gap-1.5 -mt-1">
                  {BORDERS.map((border) => (
                    <ChipButton
                      key={border.id}
                      active={borderStyle.id === border.id}
                      onClick={() => setBorderStyle(border)}
                      className="py-2 text-[11px] w-full"
                    >
                      {border.name}
                    </ChipButton>
                  ))}
                </div>
              </Section>
            </div>

            <Section title="Typography">
              <div className="flex flex-wrap gap-2 -mt-1 mb-3">
                {FONTS.map((font) => (
                  <ChipButton
                    key={font.id}
                    active={fontFamily.id === font.id}
                    onClick={() => setFontFamily(font)}
                    className={`py-2 px-4 ${font.class}`}
                  >
                    {font.name}
                  </ChipButton>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[9px] text-white/55 uppercase font-bold tracking-wider block mb-1.5">Align</span>
                  <div className="flex gap-1 bg-white/10 border border-white/15 p-1 rounded-xl">
                    {['left', 'center', 'right'].map((align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => setAlignment(align)}
                        className={`flex-1 flex justify-center py-2 rounded-lg transition cursor-pointer ${
                          alignment === align
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-white/50 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {align === 'left' && <AlignLeft size={15} />}
                        {align === 'center' && <AlignCenter size={15} />}
                        {align === 'right' && <AlignRight size={15} />}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] text-white/55 uppercase font-bold tracking-wider block mb-1.5">
                    Size <span className="text-amber-200">{fontSize}px</span>
                  </span>
                  <div className="flex items-center h-[42px] px-3 bg-white/10 border border-white/15 rounded-xl">
                    <input
                      type="range"
                      min="18"
                      max="40"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-400 h-1.5 rounded-full appearance-none cursor-pointer bg-white/15"
                    />
                  </div>
                </div>
              </div>
            </Section>
          </div>

          <div
            className="shrink-0 px-4 md:px-7 py-4 border-t border-white/12 bg-slate-800/80 backdrop-blur-xl space-y-2.5"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white shadow-xl shadow-orange-500/30 hover:shadow-orange-500/45 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none border border-white/20"
            >
              <Download size={17} />
              {isExporting ? 'Rendering…' : 'Download PNG'}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={isExporting}
                className="rounded-xl border border-white/18 bg-white/12 hover:bg-white/18 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
              >
                <Copy size={14} />
                Copy
              </button>
              <button
                type="button"
                onClick={handleShare}
                disabled={isExporting}
                className="rounded-xl border border-purple-300/30 bg-purple-400/15 hover:bg-purple-400/25 py-2.5 text-[10px] font-bold uppercase tracking-wider text-purple-100 flex items-center justify-center gap-1.5 cursor-pointer transition disabled:opacity-50"
              >
                <Share2 size={14} />
                Share
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
