'use client';

import { useState, useEffect, useRef } from 'react';

// ─── Particle system ──────────────────────────────────────────────────────────
function generateParticles(count = 24) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,          // % from left
    size: Math.random() * 6 + 3,     // 3–9 px
    delay: Math.random() * 1.2,      // s
    duration: Math.random() * 4 + 5, // 5–9 s
    opacity: Math.random() * 0.5 + 0.3,
    drift: (Math.random() - 0.5) * 60, // horizontal drift px
  }));
}

const MESSAGES = [
  'Someone in the world is praying for you right now.',
  'A prayer just crossed the world for you.',
  'You are being lifted up in prayer.',
  "Someone's heart is with you right now.",
  'A wave of prayer just reached you.',
];

// ─── Single floating overlay instance ────────────────────────────────────────
function PrayerWaveOverlayInstance({ message, onDone }) {
  const [phase, setPhase] = useState('enter'); // enter → visible → exit
  const particles = useRef(generateParticles(28)).current;

  useEffect(() => {
    // enter → visible after mount frame
    const t1 = setTimeout(() => setPhase('visible'), 50);
    // visible → exit after 5 s
    const t2 = setTimeout(() => setPhase('exit'), 5200);
    // unmount after exit transition
    const t3 = setTimeout(() => onDone(), 5900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const isEntering = phase === 'enter';
  const isExiting  = phase === 'exit';

  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none overflow-hidden"
      aria-live="polite"
      aria-label="Prayer wave notification"
    >
      {/* ── Full-screen radial bloom ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 60%, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.10) 40%, transparent 75%)',
          opacity: isEntering || isExiting ? 0 : 1,
        }}
      />

      {/* ── Floating particles ───────────────────────────────────────────── */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, rgba(196,181,253,${p.opacity}), rgba(139,92,246,${p.opacity * 0.5}))`,
            animationName: 'prayerParticleRise',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            animationTimingFunction: 'ease-out',
            animationFillMode: 'both',
            '--drift': `${p.drift}px`,
          }}
        />
      ))}

      {/* ── Central message card ─────────────────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center px-8"
        style={{ paddingBottom: '8vh' }}
      >
        <div
          className="relative max-w-sm w-full transition-all duration-700 ease-out"
          style={{
            opacity:    isEntering || isExiting ? 0 : 1,
            transform:  isEntering ? 'translateY(32px) scale(0.92)' : isExiting ? 'translateY(-24px) scale(0.96)' : 'translateY(0) scale(1)',
          }}
        >
          {/* Glow halo behind card */}
          <div
            className="absolute -inset-6 rounded-3xl blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(139,92,246,0.25) 0%, transparent 70%)' }}
          />

          {/* Card */}
          <div className="relative bg-black/60 border border-purple-400/20 rounded-3xl px-7 py-8 backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] text-center overflow-hidden">

            {/* Shimmer sweep */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)',
                animation: 'shimmerSweep 3s ease-in-out infinite',
              }}
            />

            {/* Praying hands emoji with pulse ring */}
            <div className="relative inline-flex items-center justify-center mb-5">
              <div
                className="absolute w-16 h-16 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent 70%)',
                  animation: 'prayerPulse 2s ease-in-out infinite',
                }}
              />
              <span className="text-5xl relative z-10 select-none" role="img" aria-label="praying hands">🙏</span>
            </div>

            {/* Message */}
            <p className="text-white text-lg font-serif leading-snug tracking-wide mb-2" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
              {message}
            </p>

            {/* Sub-label */}
            <p className="text-purple-300/60 text-[11px] uppercase tracking-[0.18em] font-semibold">
              Prayer Wave
            </p>

            {/* Bottom shimmer line */}
            <div
              className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(139,92,246,0.5), transparent)' }}
            />
          </div>
        </div>
      </div>

      {/* ── Keyframe styles ──────────────────────────────────────────────── */}
      <style>{`
        @keyframes prayerParticleRise {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 0.6; }
          100% { transform: translateY(-105vh) translateX(var(--drift)); opacity: 0; }
        }
        @keyframes prayerPulse {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.35); opacity: 0.2; }
        }
        @keyframes shimmerSweep {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ─── Public component — mount once globally, listen for events ───────────────
export default function PrayerWaveOverlay() {
  const [queue, setQueue] = useState([]); // array of { id, message }
  const counterRef = useRef(0);

  useEffect(() => {
    const handleWave = (e) => {
      const { targetAuthor } = e.detail || {};
      // Pick a message — rotate through the list deterministically
      const msg = MESSAGES[counterRef.current % MESSAGES.length];
      counterRef.current++;

      setQueue(prev => [
        ...prev,
        { id: Date.now() + Math.random(), message: msg }
      ]);
    };

    window.addEventListener('prayer-wave-received', handleWave);
    return () => window.removeEventListener('prayer-wave-received', handleWave);
  }, []);

  const dismiss = (id) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  };

  // Only render the most recent one at a time to avoid stacking
  if (queue.length === 0) return null;
  const current = queue[queue.length - 1];

  return (
    <PrayerWaveOverlayInstance
      key={current.id}
      message={current.message}
      onDone={() => dismiss(current.id)}
    />
  );
}
