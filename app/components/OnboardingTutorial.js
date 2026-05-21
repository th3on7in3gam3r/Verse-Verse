'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, ChevronUp, ChevronLeft } from 'lucide-react';

export default function OnboardingTutorial({ onClose }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  // Ref to the tutorial's own DOM node so we can check event targets
  const overlayRef = useRef(null);

  useEffect(() => {
    // Only dismiss when the scroll/wheel/touch originates from OUTSIDE this
    // overlay — i.e. from the verse feed beneath it, not from a drawer or
    // modal that is layered on top (those have higher z-index and their
    // scroll containers are descendants of a different DOM subtree).
    const handleWheel = (e) => {
      // If the event target is inside our own overlay, ignore it.
      if (overlayRef.current && overlayRef.current.contains(e.target)) return;
      // If any element with z-index > 50 is currently in the DOM and contains
      // the target, a modal/drawer is open — don't dismiss.
      if (isHigherLayerOpen(e.target)) return;
      triggerDismiss();
    };

    const handleTouchMove = (e) => {
      if (overlayRef.current && overlayRef.current.contains(e.target)) return;
      if (isHigherLayerOpen(e.target)) return;
      triggerDismiss();
    };

    window.addEventListener('wheel',      handleWheel,     { passive: true });
    window.addEventListener('touchmove',  handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('wheel',     handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Returns true if the event target lives inside a modal/drawer overlay
  // (anything with data-overlay="true" or a known high-z wrapper class).
  const isHigherLayerOpen = (target) => {
    // Walk up the DOM from the event target looking for overlay markers.
    let el = target;
    while (el && el !== document.body) {
      const z = parseInt(window.getComputedStyle(el).zIndex, 10);
      // Our tutorial is z-50. Anything at z-40+ that is NOT our own overlay
      // means a drawer/modal is open on top.
      if (!isNaN(z) && z >= 40 && overlayRef.current && !overlayRef.current.contains(el)) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  };

  const triggerDismiss = () => {
    if (isFadingOut) return; // guard against double-fire
    setIsFadingOut(true);
    setTimeout(() => {
      localStorage.setItem('verseverse_tutorial_completed', 'true');
      onClose();
    }, 500);
  };

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center bg-black/85 backdrop-blur-xl transition-all duration-500 px-6 py-12 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      onClick={triggerDismiss}
    >
      {/* Dynamic inline styles for premium gesture animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes verticalSwipeLoop {
          0% { transform: translateY(20px); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.9; }
          100% { transform: translateY(-25px); opacity: 0; }
        }
        @keyframes horizontalSwipeLoop {
          0% { transform: translateX(25px); opacity: 0; }
          20% { opacity: 0.9; }
          80% { opacity: 0.9; }
          100% { transform: translateX(-25px); opacity: 0; }
        }
        .animate-vertical-swipe {
          animation: verticalSwipeLoop 2.2s infinite ease-in-out;
        }
        .animate-horizontal-swipe {
          animation: horizontalSwipeLoop 2.2s infinite ease-in-out;
        }
      `}} />

      {/* Top Section: Welcome Info */}
      <div className="text-center mt-6 max-w-sm space-y-3">
        <div className="inline-flex items-center justify-center bg-white/5 border border-white/10 px-3.5 py-1 rounded-full gap-1.5 text-[10px] text-teal-400 font-bold uppercase tracking-widest">
          <Sparkles size={11} className="animate-pulse" />
          <span>Interactive Onboarding</span>
        </div>
        <h1 className="text-white text-3xl font-extrabold font-serif tracking-tight">
          Welcome to Verse Verse
        </h1>
        <p className="text-white/40 text-xs leading-relaxed">
          A mindful space to reflect and meditate. Explore the feed using simple swipe gestures.
        </p>
      </div>

      {/* Middle Section: Gesture visualizers */}
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center items-center my-8">
        
        {/* Vertical Swipe Card */}
        <div className="flex-1 w-full max-w-xs bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center text-center shadow-xl hover:bg-white/[0.04] transition-all">
          <div className="w-14 h-24 border border-white/20 rounded-2xl flex items-center justify-center relative mb-4 overflow-hidden bg-black/40 shadow-inner">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/30 flex items-center justify-center animate-vertical-swipe">
              <ChevronUp size={16} className="text-teal-400" />
            </div>
            <div className="w-6 h-0.5 bg-white/10 rounded-full absolute bottom-1" />
          </div>
          <h3 className="text-white font-bold text-sm mb-1">Swipe Up & Down</h3>
          <p className="text-white/40 text-[11px] leading-relaxed">
            Scroll vertically to transition between scriptures within the current category.
          </p>
        </div>

        {/* Horizontal Swipe Card */}
        <div className="flex-1 w-full max-w-xs bg-white/[0.02] border border-white/5 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center text-center shadow-xl hover:bg-white/[0.04] transition-all">
          <div className="w-24 h-14 border border-white/20 rounded-2xl flex items-center justify-center relative mb-4 overflow-hidden bg-black/40 shadow-inner">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-horizontal-swipe">
              <ChevronLeft size={16} className="text-cyan-400" />
            </div>
            <div className="w-0.5 h-6 bg-white/10 rounded-full absolute right-1" />
          </div>
          <h3 className="text-white font-bold text-sm mb-1">Swipe Left & Right</h3>
          <p className="text-white/40 text-[11px] leading-relaxed">
            Scroll horizontally to switch scripture categories like Strength, Comfort, or Love.
          </p>
        </div>

      </div>

      {/* Bottom Section: CTA */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerDismiss();
          }}
          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-95 text-black font-extrabold tracking-widest text-[10px] uppercase py-3.5 px-8 rounded-full shadow-lg shadow-teal-500/20 active:scale-[0.97] transition-all cursor-pointer"
        >
          Begin Experience
        </button>
        <span className="text-[9px] text-white/30 tracking-widest uppercase font-bold">
          (or scroll to enter)
        </span>
      </div>

    </div>
  );
}
