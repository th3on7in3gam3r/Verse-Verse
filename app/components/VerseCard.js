'use client';

import { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Wind } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MeditationOverlay from './MeditationOverlay';
import CardBuilderModal from './CardBuilderModal';
import AudioNarrator from './AudioNarrator';

export default function VerseCard({ verse, isVisible, onOpenComments }) {
  const [isLiked, setIsLiked] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const [isMeditating, setIsMeditating] = useState(false);
  const [isShareBuilderOpen, setIsShareBuilderOpen] = useState(false);
  const { prefersVideo } = useAuth();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('savedVerses') || '[]');
    setIsLiked(saved.includes(verse.id));
  }, [verse]);

  const toggleLike = () => {
    const saved = JSON.parse(localStorage.getItem('savedVerses') || '[]');
    let newSaved;
    if (isLiked) {
      newSaved = saved.filter(id => id !== verse.id);
      setIsLiked(false);
    } else {
      newSaved = [...saved, verse.id];
      setIsLiked(true);
      setShowLikeAnimation(true);
      setTimeout(() => setShowLikeAnimation(false), 1000);
    }
    localStorage.setItem('savedVerses', JSON.stringify(newSaved));
  };

  const handleShare = async () => {
    const shareData = {
      title: `${verse.reference} - Verse Verse`,
      text: `"${verse.text}" - ${verse.reference}`,
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
        alert('Verse copied to clipboard!');
      }
    } catch (err) {
      console.log('Share cancelled', err);
    }
  };

  const backgrounds = {
    blue:   'linear-gradient(135deg, #667eea, #764ba2, #6B8DD6, #8E37D7)',
    purple: 'linear-gradient(135deg, #f093fb, #f5576c, #f093fb, #f5576c)',
    green:  'linear-gradient(135deg, #4facfe, #00f2fe, #4facfe, #00f2fe)',
    orange: 'linear-gradient(135deg, #fa709a, #fee140, #fa709a, #fee140)',
  };

  return (
    <div
      className="relative w-full h-full flex flex-col justify-center items-center overflow-hidden animate-gradient transition-all duration-1000"
      style={{
        backgroundImage: backgrounds[verse.background] || backgrounds.blue,
        backgroundSize: '400% 400%',
      }}
    >
      {/* Background Media */}
      {verse.media?.video && prefersVideo && (
        <video
          src={verse.media.video}
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-90"
        />
      )}
      {verse.media?.image && !prefersVideo && (
        <img
          src={verse.media.image}
          alt={verse.theme}
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-85 animate-slow-pan"
        />
      )}

      {/* Cinematic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50 z-0 pointer-events-none" />

      {/* Cinematic Floating Particles */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => {
          const size     = (i % 3) * 1.5 + 2;
          const delay    = (i * 0.7).toFixed(1);
          const duration = ((i % 4) * 4 + 10).toFixed(1);
          const left     = ((i * 7) % 100).toFixed(1);
          return (
            <span
              key={i}
              className="absolute bottom-0 bg-white/70 rounded-full animate-float-particle"
              style={{ width: `${size}px`, height: `${size}px`, left: `${left}%`, animationDelay: `${delay}s`, animationDuration: `${duration}s` }}
            />
          );
        })}
      </div>

      {/* Heart animation */}
      {showLikeAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Heart size={120} className="text-red-500 fill-red-500 animate-ping opacity-75" />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 w-full max-w-lg flex flex-col justify-center items-center px-8 pt-20 pb-12 relative z-10">
        <p
          className={`text-white text-3xl md:text-[2.75rem] font-serif text-center mb-8 leading-snug drop-shadow-2xl text-reveal ${isVisible ? 'active' : ''}`}
          style={{ transitionDelay: '0.2s', textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}
        >
          "{verse.text}"
        </p>
        <div className="flex flex-col items-center gap-2">
          <h2
            className={`text-white text-2xl font-bold tracking-wide drop-shadow-md text-reveal ${isVisible ? 'active' : ''}`}
            style={{ transitionDelay: '0.35s', textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}
          >
            {verse.reference}
          </h2>
          <span
            className={`bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white uppercase font-bold tracking-widest text-reveal ${isVisible ? 'active' : ''}`}
            style={{ transitionDelay: '0.45s' }}
          >
            {verse.translation ?? 'NIV'}
          </span>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
        <button onClick={toggleLike} className="flex flex-col items-center gap-1 group btn-interactive">
          <div className="bg-black/40 border border-white/10 p-3 rounded-full backdrop-blur-md group-hover:bg-black/60 transition">
            <Heart size={28} className={isLiked ? 'text-red-500 fill-red-500' : 'text-white'} />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">{isLiked ? 'Saved' : 'Save'}</span>
        </button>

        <button onClick={() => onOpenComments(verse.id)} className="flex flex-col items-center gap-1 group btn-interactive">
          <div className="bg-black/40 border border-white/10 p-3 rounded-full backdrop-blur-md group-hover:bg-black/60 transition">
            <MessageCircle size={28} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">Prayers</span>
        </button>

        <button onClick={() => setIsShareBuilderOpen(true)} className="flex flex-col items-center gap-1 group btn-interactive">
          <div className="bg-black/40 border border-white/10 p-3 rounded-full backdrop-blur-md group-hover:bg-black/60 transition">
            <Share2 size={28} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">Share</span>
        </button>

        <button onClick={() => setIsMeditating(true)} className="flex flex-col items-center gap-1 group btn-interactive">
          <div className="bg-black/40 border border-white/10 p-3 rounded-full backdrop-blur-md group-hover:bg-black/60 transition">
            <Wind size={28} className="text-white" />
          </div>
          <span className="text-white text-xs font-semibold drop-shadow-md">Meditate</span>
        </button>
      </div>

      {/* ── Premium Audio Narrator ────────────────────────────────────────────── */}
      <AudioNarrator verse={verse} isVisible={isVisible} />

      {/* Branding watermark */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-60">
        <h1 className="text-white text-[10px] font-bold tracking-[0.3em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center gap-1.5">
          <span className="text-purple-400">†</span> VERSE VERSE
        </h1>
      </div>

      {isMeditating && (
        <MeditationOverlay verse={verse} onClose={() => setIsMeditating(false)} />
      )}

      {isShareBuilderOpen && (
        <CardBuilderModal
          isOpen={isShareBuilderOpen}
          onClose={() => setIsShareBuilderOpen(false)}
          verse={verse}
        />
      )}
    </div>
  );
}
