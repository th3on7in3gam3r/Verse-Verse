 'use client';

import { useState, useEffect } from 'react';
import Portal from './Portal';
import { Target, Users, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VerseOfTheDay() {
  const [challenge, setChallenge] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isHiding, setIsHiding] = useState(false);

  useEffect(() => {
    fetch('/api/challenge')
      .then(res => res.json())
      .then(data => setChallenge(data))
      .catch(err => console.error(err));
      
    // Check if completed today
    const dateKey = new Date().toISOString().split('T')[0];
    const done = localStorage.getItem('votd_completed_' + dateKey);
    if (done) {
      // If already done, we don't show the banner at all
      setIsVisible(false);
    }
  }, []);

  if (!challenge || !isVisible) return null;

  const handleDismiss = () => {
    setIsHiding(true);
    setTimeout(() => setIsVisible(false), 500); // Wait for CSS transition
  };

  const handleComplete = () => {
    setCompleted(true);
    
    // Save completion
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('votd_completed_' + today, 'true');

    // Handle Streak Logic
    let streakData = { count: 0, lastCompleted: null };
    const savedStreak = localStorage.getItem('verse_streak');
    if (savedStreak) streakData = JSON.parse(savedStreak);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streakData.lastCompleted === yesterdayStr) {
      streakData.count += 1;
    } else if (streakData.lastCompleted !== today) {
      streakData.count = 1;
    }
    
    streakData.lastCompleted = today;
    localStorage.setItem('verse_streak', JSON.stringify(streakData));
    
    // Notify StreakCounter to update live
    window.dispatchEvent(new Event('streakUpdated'));

    // Trigger Confetti Explosion
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffb703', '#fb8500', '#8338ec']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffb703', '#fb8500', '#8338ec']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Hide Banner after 2.5 seconds
    setTimeout(() => {
      handleDismiss();
    }, 2500);
  };

  return (
    <Portal>
      <div
        role="region"
        aria-live="polite"
        className={`mx-4 md:mx-16 z-[60] bg-black/50 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-2xl flex items-center justify-between pointer-events-auto transition-all duration-500 ease-in-out ${isHiding ? '-translate-y-[150%] opacity-0' : 'translate-y-0 opacity-100'} animate-in fade-in slide-in-from-top-8`}
        style={{ marginTop: 'env(safe-area-inset-top, 0)' }}
      >
      <div className="flex-1 mr-4 max-w-xl">
        <div className="flex items-center gap-2 mb-1.5">
          <Target size={18} className="text-yellow-400" />
          <h2 className="text-white font-bold text-sm tracking-wide">Daily Challenge</h2>
          <span className="flex items-center gap-1 text-xs font-semibold text-white/50 ml-2 bg-white/10 px-2 py-0.5 rounded-full">
            <Users size={12} /> {challenge.participants}
          </span>
        </div>
        <p className="text-white/90 text-xs leading-relaxed font-medium">
          {completed ? "Amazing! You completed today's challenge. Come back tomorrow!" : challenge.challenge}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={handleComplete}
          disabled={completed}
          className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-lg ${completed ? 'bg-green-500 text-white scale-110 shadow-green-500/50' : 'bg-white/20 text-white hover:bg-white/30 hover:scale-105'}`}
        >
          <CheckCircle2 size={24} className={completed ? "animate-pulse" : ""} />
        </button>

        {!completed && (
          <button 
            onClick={handleDismiss} 
            className="text-white/40 hover:text-white/80 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
      </div>
    </Portal>
  );
}
