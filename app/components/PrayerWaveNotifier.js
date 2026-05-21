'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

// PrayerWaveNotifier — fires a cinematic centred ripple burst when the current
// user taps "Pray for this" on someone's prayer. No simulated background noise,
// no drifting elements. Clean, intentional, premium.

export default function PrayerWaveNotifier() {
  const [burst, setBurst] = useState(null); // { id, text }

  const showBurst = (text) => {
    const id = Date.now();
    setBurst({ id, text });
    setTimeout(() => setBurst(null), 4000);
  };

  useEffect(() => {
    const handleBroadcast = (e) => {
      const { author, isSelf } = e.detail || {};
      if (!isSelf) return; // only show to the person who tapped — not globally
      showBurst(`You sent a prayer wave to ${author || 'someone'}.`);
    };

    window.addEventListener('prayer-wave-broadcast', handleBroadcast);
    return () => window.removeEventListener('prayer-wave-broadcast', handleBroadcast);
  }, []);

  if (!burst) return null;

  return (
    <div
      key={burst.id}
      className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center"
    >
      {/* Sonar rings */}
      <div className="absolute w-32 h-32 rounded-full border border-purple-500/60"
        style={{ animation: 'sonarRing 2.2s cubic-bezier(0.1,0.5,0.1,1) forwards' }} />
      <div className="absolute w-32 h-32 rounded-full border border-teal-400/40"
        style={{ animation: 'sonarRing 2.8s cubic-bezier(0.1,0.5,0.1,1) forwards 0.25s' }} />
      <div className="absolute w-32 h-32 rounded-full border border-purple-400/20"
        style={{ animation: 'sonarRing 3.4s cubic-bezier(0.1,0.5,0.1,1) forwards 0.5s' }} />

      {/* Central orb + label */}
      <div style={{ animation: 'burstFadeOut 0.6s ease-in forwards 3.2s' }}
        className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_48px_rgba(168,85,247,0.7)] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-white/15 rounded-full animate-ping" />
          <Heart size={26} className="text-white fill-white relative z-10" />
        </div>
        <div className="px-5 py-2 rounded-full bg-black/50 backdrop-blur-xl border border-white/15 shadow-2xl">
          <p className="text-white text-sm font-medium tracking-wide">{burst.text}</p>
        </div>
      </div>

      <style>{`
        @keyframes sonarRing {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(8);   opacity: 0; }
        }
        @keyframes burstFadeOut {
          to { opacity: 0; transform: scale(0.92); }
        }
      `}</style>
    </div>
  );
}
