'use client';

import { useState, useRef } from 'react';
import { X, Download, Copy, Share2, AlignLeft, AlignCenter, AlignRight, Type, Palette, ShieldAlert, Sliders, Layers, Sparkles } from 'lucide-react';

const BACKGROUNDS = [
  { id: 'midnight', name: 'Midnight', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)' },
  { id: 'aurora', name: 'Aurora Deep', value: 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #0f172a 100%)' },
  { id: 'crimson', name: 'Crimson Night', value: 'linear-gradient(135deg, #4c0519 0%, #1e0010 50%, #0f172a 100%)' },
  { id: 'amber', name: 'Amber Glow', value: 'linear-gradient(135deg, #451a03 0%, #1c1917 50%, #0c0a09 100%)' },
  { id: 'obsidian', name: 'Obsidian Jet', value: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)' },
  { id: 'royal', name: 'Royal Velvet', value: 'linear-gradient(135deg, #1e3a8a 0%, #3b0764 50%, #0f172a 100%)' }
];

const FONTS = [
  { id: 'serif', name: 'Serif (Classic)', class: 'font-serif' },
  { id: 'sans', name: 'Sans-Serif (Modern)', class: 'font-sans' },
  { id: 'mono', name: 'Monospace (Clean)', class: 'font-mono' }
];

const BORDERS = [
  { id: 'none', name: 'Minimalist', class: 'border-0' },
  { id: 'glass', name: 'Glass Frame', class: 'border border-white/20 bg-white/[0.04] backdrop-blur-md' },
  { id: 'neon', name: 'Teal Halo', class: 'border border-teal-500/30 shadow-[0_0_25px_rgba(20,184,166,0.15)] bg-black/20' },
  { id: 'gold', name: 'Gold Halo', class: 'border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.15)] bg-black/20' }
];

const TEXTURES = [
  { id: 'none', name: 'Smooth Glass' },
  { id: 'grain', name: 'Organic Grain' },
  { id: 'mesh', name: 'Cosmic Mesh' },
  { id: 'stripes', name: 'Fine Lines' }
];

export default function CardBuilderModal({ isOpen, onClose, verse }) {
  const [bgMode, setBgMode] = useState('presets'); // 'presets' | 'custom'
  const [background, setBackground] = useState(BACKGROUNDS[0]);
  const [customColor1, setCustomColor1] = useState('#3b0764');
  const [customColor2, setCustomColor2] = useState('#0f172a');
  const [customAngle, setCustomAngle] = useState(135);
  const [selectedTexture, setSelectedTexture] = useState('none');
  
  const [fontFamily, setFontFamily] = useState(FONTS[0]);
  const [fontSize, setFontSize] = useState(26);
  const [alignment, setAlignment] = useState('center');
  const [borderStyle, setBorderStyle] = useState(BORDERS[1]);
  const [isExporting, setIsExporting] = useState(false);
  
  const cardRef = useRef(null);

  if (!isOpen || !verse) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      // Render at 2.5x pixel ratio for high definition clarity on mobile devices
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2.5,
        cacheBust: true,
        style: {
          transform: 'scale(1)',
        }
      });
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
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2.5, cacheBust: true });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ]);
        alert('Card image copied to clipboard!');
      } else {
        alert('Clipboard copy not supported on this browser. Try downloading the card instead.');
      }
    } catch (err) {
      console.error('Error copying card image:', err);
      alert('Could not copy image. Try downloading the card instead.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2.5, cacheBust: true });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const file = new File([blob], `verseverse-${verse.reference.replace(/[\s:]+/g, '-')}.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${verse.reference} Card`,
          text: `Check out this scripture card: "${verse.text}" - ${verse.reference}`
        });
      } else {
        // Fallback: Copy link and text
        const text = `"${verse.text}" - ${verse.reference}\n\nShared from Verse Verse: ${window.location.origin}`;
        await navigator.clipboard.writeText(text);
        alert('Share info copied to clipboard! (Mobile devices & Safari support sharing image files directly)');
      }
    } catch (err) {
      console.error('Error sharing card image:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300 px-4 md:px-6">
      
      {/* Click Outside Dismiss Backdrop */}
      <div className="absolute inset-0 z-0" onClick={onClose} />

      {/* Main Container Modal */}
      <div className="relative z-10 w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[850px] animate-in zoom-in-95 duration-300">
        
        {/* Header (Top Close Button for Mobile) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white/50 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 p-2 rounded-full transition-all border border-zinc-700/50 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Left Side: Live Preview (9:16 Canvas Card View) */}
        <div className="flex-1 bg-zinc-950 p-6 md:p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-zinc-800/50 overflow-y-auto">
          <div className="relative shadow-2xl rounded-2xl overflow-hidden aspect-[9/16] w-[220px] md:w-[280px] select-none flex-shrink-0">
            
            {/* The Exportable Div Container */}
            <div 
              ref={cardRef}
              className="w-full h-full p-6 md:p-8 flex flex-col justify-between items-center relative overflow-hidden"
              style={{ 
                background: bgMode === 'presets' 
                  ? background.value 
                  : `linear-gradient(${customAngle}deg, ${customColor1} 0%, ${customColor2} 100%)` 
              }}
            >
              {/* Blurred Ambient Blobs */}
              <div className="absolute top-[-10%] left-[-20%] w-[80%] aspect-square bg-white/5 rounded-full blur-[40px] pointer-events-none" />
              <div className="absolute bottom-[-10%] right-[-20%] w-[80%] aspect-square bg-teal-500/5 rounded-full blur-[45px] pointer-events-none" />

              {/* Texture overlays */}
              {selectedTexture === 'grain' && (
                <svg className="absolute inset-0 w-full h-full opacity-[0.15] mix-blend-overlay pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <filter id="cardNoiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
                  </filter>
                  <rect width="100%" height="100%" filter="url(#cardNoiseFilter)" />
                </svg>
              )}

              {selectedTexture === 'mesh' && (
                <>
                  <div className="absolute top-[20%] left-[10%] w-[130px] h-[130px] rounded-full bg-teal-400/20 blur-[35px] pointer-events-none animate-pulse" />
                  <div className="absolute bottom-[20%] right-[10%] w-[160px] h-[160px] rounded-full bg-fuchsia-500/20 blur-[45px] pointer-events-none animate-pulse animate-duration-[4000ms]" style={{ animationDelay: '2s' }} />
                </>
              )}

              {selectedTexture === 'stripes' && (
                <div 
                  className="absolute inset-0 opacity-[0.12] pointer-events-none" 
                  style={{ 
                    backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 1px, transparent 1px, transparent 12px)' 
                  }} 
                />
              )}

              {/* Watermark / Branding Logo at Top */}
              <div className="w-full flex items-center justify-center opacity-40">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">
                  † Verse Verse
                </span>
              </div>

              {/* Central Box for Text & Reference */}
              <div className={`w-full flex-1 flex flex-col justify-center items-center p-4 rounded-xl transition-all duration-300 ${borderStyle.class}`}>
                <p 
                  className={`text-white leading-relaxed mb-6 font-medium ${fontFamily.class}`}
                  style={{ 
                    fontSize: `${fontSize}px`, 
                    textAlign: alignment,
                    textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                  }}
                >
                  "{verse.text}"
                </p>
                <div className="flex flex-col items-center gap-1.5">
                  <h3 className="text-white font-bold text-sm md:text-base tracking-wide" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                    {verse.reference}
                  </h3>
                  <span className="bg-white/15 px-2 py-0.5 rounded-full text-[9px] text-white/80 font-semibold tracking-wider uppercase">
                    {verse.translation || 'NIV'}
                  </span>
                </div>
              </div>

              {/* Watermark at Bottom */}
              <div className="w-full text-center opacity-30">
                <span className="text-[8px] tracking-wider text-white/60">
                  verse-verse.app
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Customization Options & Control Panel */}
        <div className="w-full md:w-[380px] p-6 md:p-8 flex flex-col justify-between overflow-y-auto bg-zinc-900/90">
          
          <div>
            <h2 className="text-white text-xl font-extrabold tracking-wide mb-1 flex items-center gap-2">
              <Palette size={22} className="text-teal-400" />
              Card Studio
            </h2>
            <p className="text-white/40 text-xs mb-6">Customize and render this verse to share as an image</p>

            {/* Background selection */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Themes</label>
                <div className="flex bg-zinc-800 p-0.5 rounded-lg border border-zinc-700/50">
                  <button
                    onClick={() => setBgMode('presets')}
                    className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer ${bgMode === 'presets' ? 'bg-teal-500 text-black shadow' : 'text-gray-400 hover:text-white'}`}
                  >
                    Presets
                  </button>
                  <button
                    onClick={() => setBgMode('custom')}
                    className={`px-2.5 py-1 rounded text-[9px] font-bold tracking-wider uppercase transition-all cursor-pointer ${bgMode === 'custom' ? 'bg-teal-500 text-black shadow' : 'text-gray-400 hover:text-white'}`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {bgMode === 'presets' ? (
                <div className="grid grid-cols-3 gap-2">
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => setBackground(bg)}
                      className={`h-11 rounded-xl transition border text-white text-[10px] font-bold flex items-center justify-center relative overflow-hidden cursor-pointer ${background.id === bg.id ? 'border-teal-500 scale-105 shadow-lg shadow-teal-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                      style={{ background: bg.value }}
                    >
                      <span className="bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded text-white text-[8px] truncate max-w-[80px]">
                        {bg.name}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-zinc-950/60 border border-zinc-850 rounded-2xl p-3.5 space-y-3">
                  <div className="flex justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Color 1</span>
                      <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5">
                        <input
                          type="color"
                          value={customColor1}
                          onChange={(e) => setCustomColor1(e.target.value)}
                          className="w-5 h-5 rounded border border-white/10 bg-transparent cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-gray-300 uppercase">{customColor1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Color 2</span>
                      <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl px-2 py-1.5">
                        <input
                          type="color"
                          value={customColor2}
                          onChange={(e) => setCustomColor2(e.target.value)}
                          className="w-5 h-5 rounded border border-white/10 bg-transparent cursor-pointer"
                        />
                        <span className="text-[10px] font-mono text-gray-300 uppercase">{customColor2}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      <span>Angle</span>
                      <span>{customAngle}°</span>
                    </div>
                    <div className="flex items-center h-8 px-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={customAngle}
                        onChange={(e) => setCustomAngle(parseInt(e.target.value))}
                        className="w-full accent-teal-400 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Texture selection */}
            <div className="mb-5">
              <label className="text-white/60 text-[10px] font-bold uppercase tracking-widest block mb-2">Overlay Texture</label>
              <div className="grid grid-cols-2 gap-2">
                {TEXTURES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTexture(t.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border cursor-pointer transition ${selectedTexture === t.id ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-zinc-800/40 border-zinc-800 text-white/70 hover:border-zinc-700'}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography selection */}
            <div className="mb-5">
              <label className="text-white/60 text-[10px] font-bold uppercase tracking-widest block mb-2">Typography</label>
              <div className="grid grid-cols-3 gap-2">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    onClick={() => setFontFamily(font)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold text-center border cursor-pointer transition ${fontFamily.id === font.id ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-zinc-800/40 border-zinc-800 text-white/70 hover:border-zinc-700'}`}
                  >
                    <span className={font.class}>{font.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Frame Options */}
            <div className="mb-5">
              <label className="text-white/60 text-[10px] font-bold uppercase tracking-widest block mb-2">Border Style</label>
              <div className="grid grid-cols-2 gap-2">
                {BORDERS.map((border) => (
                  <button
                    key={border.id}
                    onClick={() => setBorderStyle(border)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border cursor-pointer transition ${borderStyle.id === border.id ? 'bg-teal-500/10 border-teal-500 text-teal-400' : 'bg-zinc-800/40 border-zinc-800 text-white/70 hover:border-zinc-700'}`}
                  >
                    {border.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Alignment & Size Controls */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              
              <div>
                <label className="text-white/60 text-[10px] font-bold uppercase tracking-widest block mb-2">Align Text</label>
                <div className="flex gap-1.5 bg-zinc-800/40 border border-zinc-800 p-1.5 rounded-xl">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => setAlignment(align)}
                      className={`flex-1 flex justify-center py-1 rounded-lg transition cursor-pointer ${alignment === align ? 'bg-teal-500 text-black shadow-md' : 'text-white/50 hover:text-white'}`}
                    >
                      {align === 'left' && <AlignLeft size={16} />}
                      {align === 'center' && <AlignCenter size={16} />}
                      {align === 'right' && <AlignRight size={16} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/60 text-[10px] font-bold uppercase tracking-widest block mb-2">Text Size ({fontSize}px)</label>
                <div className="flex items-center h-[46px] px-2 bg-zinc-800/40 border border-zinc-800 rounded-xl">
                  <input
                    type="range"
                    min="18"
                    max="40"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full accent-teal-400 bg-zinc-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

            </div>

          </div>

          {/* Action Export Buttons */}
          <div className="flex flex-col gap-2 mt-4 md:mt-0">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="w-full bg-teal-500 hover:bg-teal-600 active:scale-[0.98] text-black font-bold py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/10 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Download size={18} />
              {isExporting ? 'Generating Image...' : 'Download PNG'}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                disabled={isExporting}
                className="bg-zinc-800 hover:bg-zinc-750 active:scale-[0.98] text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-750/50 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Copy size={14} />
                Copy Image
              </button>

              <button
                onClick={handleShare}
                disabled={isExporting}
                className="bg-zinc-850 hover:bg-zinc-800 active:scale-[0.98] text-teal-400 text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-teal-500/10 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Share2 size={14} />
                Share Card
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
