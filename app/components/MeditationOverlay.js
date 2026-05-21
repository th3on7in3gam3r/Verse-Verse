'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle, Sparkles, Wind, Volume2, Clock } from 'lucide-react';

// ─── Session duration options ─────────────────────────────────────────────────
const DURATIONS = [
  { label: '1 min',  seconds: 60,  description: 'Quick reset' },
  { label: '5 min',  seconds: 300, description: 'Focused breath' },
  { label: '10 min', seconds: 600, description: 'Deep stillness' },
  { label: '15 min', seconds: 900, description: 'Full immersion' },
];

// Format seconds → M:SS
function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

export default function MeditationOverlay({ verse, onClose }) {
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);
  const [timeLeft,    setTimeLeft]    = useState(DURATIONS[0].seconds);
  const [isActive,    setIsActive]    = useState(false);
  const [hasStarted,  setHasStarted]  = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');
  const [completed,   setCompleted]   = useState(false);

  const timerRef      = useRef(null);
  const phaseTimerRef = useRef(null);

  // Sync timeLeft when duration changes (only before session starts)
  useEffect(() => {
    if (!hasStarted) setTimeLeft(selectedDuration.seconds);
  }, [selectedDuration, hasStarted]);

  // Notify BackgroundMusic to start when meditation begins
  useEffect(() => {
    if (hasStarted) window.dispatchEvent(new CustomEvent('meditation-start'));
    return () => window.dispatchEvent(new CustomEvent('meditation-end'));
  }, [hasStarted]);

  // Countdown timer
  useEffect(() => {
    if (hasStarted && isActive && timeLeft > 0 && !completed) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCompleted(true);
            setIsActive(false);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [hasStarted, isActive, timeLeft, completed]);

  // Breathing cycle: 4s Inhale → 4s Hold → 4s Exhale
  useEffect(() => {
    if (hasStarted && isActive && !completed) {
      phaseTimerRef.current = setInterval(() => {
        setBreathPhase(prev => {
          if (prev === 'Inhale') return 'Hold';
          if (prev === 'Hold')   return 'Exhale';
          return 'Inhale';
        });
      }, 4000);
    } else {
      clearInterval(phaseTimerRef.current);
    }
    return () => clearInterval(phaseTimerRef.current);
  }, [hasStarted, isActive, completed]);

  const handleStart = () => {
    setHasStarted(true);
    setIsActive(true);
  };

  const handleReset = () => {
    setTimeLeft(selectedDuration.seconds);
    setBreathPhase('Inhale');
    setCompleted(false);
    setIsActive(true);
  };

  // Progress arc (0–1)
  const progress = hasStarted
    ? (selectedDuration.seconds - timeLeft) / selectedDuration.seconds
    : 0;

  // SVG circle arc for the progress ring
  const RADIUS = 88;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-6 text-white backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-lg flex items-center justify-between mt-4">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-widest text-white/40 font-bold">Meditation Space</span>
          <span className="text-sm text-white/80 font-medium">Breathe & Meditate</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 w-full max-w-lg flex flex-col items-center justify-center gap-6">

        {/* ── Completed screen ─────────────────────────────────────────────── */}
        {completed ? (
          <div className="flex flex-col items-center gap-4 text-center animate-in zoom-in-95 duration-500">
            <CheckCircle size={80} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)] animate-bounce" />
            <h2 className="text-2xl font-bold font-serif">Peace be with you</h2>
            <p className="text-sm text-white/60 px-6 max-w-sm leading-relaxed">
              You completed {selectedDuration.label} of mindfulness on this scripture.
              Let this peace guard your heart today.
            </p>
          </div>

        ) : !hasStarted ? (
          /* ── Preparation screen ──────────────────────────────────────────── */
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Scripture card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-2xl max-w-md w-full backdrop-blur-md">
              <p className="text-base md:text-lg font-serif italic text-white/90 leading-relaxed">
                "{verse.text}"
              </p>
              <p className="text-xs text-white/50 tracking-wider mt-3 font-bold uppercase">
                — {verse.reference}
              </p>
            </div>

            {/* ── Duration selector ─────────────────────────────────────────── */}
            <div className="w-full max-w-md">
              <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-white/40 mb-3 flex items-center gap-1.5">
                <Clock size={11} />
                Session Duration
              </p>
              <div className="grid grid-cols-4 gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.seconds}
                    onClick={() => setSelectedDuration(d)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      selectedDuration.seconds === d.seconds
                        ? 'bg-teal-500/15 border-teal-400/40 shadow-[0_0_16px_rgba(20,184,166,0.2)]'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10'
                    }`}
                  >
                    <span className={`text-sm font-bold tracking-tight ${selectedDuration.seconds === d.seconds ? 'text-teal-300' : 'text-white/70'}`}>
                      {d.label}
                    </span>
                    <span className="text-[9px] text-white/30 font-medium leading-none text-center">
                      {d.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prep checklist */}
            <div className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-teal-400">Preparation Check</h3>

              {[
                { icon: <Sparkles size={14} />, title: 'Postured & Still', body: 'Find a comfortable seating position and let your body relax.' },
                { icon: <Wind size={14} />,     title: 'Box Breathing',    body: 'Pace your breath to match the animated ring (4s Inhale, 4s Hold, 4s Exhale).' },
                { icon: <Volume2 size={14} />,  title: 'Ambient Music Mix', body: 'Binaural, spatial soundscapes will begin playing to deepen your focus.' },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3 text-left">
                  <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 mt-0.5 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-200">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Begin button */}
            <button
              onClick={handleStart}
              className="w-full max-w-xs bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-semibold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.2)] hover:shadow-[0_0_30px_rgba(20,184,166,0.4)] transition-all hover:scale-105 active:scale-95 duration-300 tracking-wide text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Wind size={16} />
              Begin {selectedDuration.label} Meditation
            </button>
          </div>

        ) : (
          /* ── Active meditation screen ─────────────────────────────────────── */
          <div className="w-full flex flex-col items-center gap-6 animate-in fade-in duration-300">

            {/* Scripture card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center shadow-2xl max-w-md w-full backdrop-blur-md">
              <p className="text-sm md:text-base font-serif italic text-white/90 leading-relaxed">
                "{verse.text}"
              </p>
              <p className="text-xs text-white/50 tracking-wider mt-2 font-bold uppercase">
                — {verse.reference}
              </p>
            </div>

            {/* ── Breathing ring with SVG progress arc ─────────────────────── */}
            <div className="relative flex items-center justify-center w-56 h-56">

              {/* SVG progress ring */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 200 200"
              >
                {/* Track */}
                <circle
                  cx="100" cy="100" r={RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="4"
                />
                {/* Progress */}
                <circle
                  cx="100" cy="100" r={RADIUS}
                  fill="none"
                  stroke={breathPhase === 'Exhale' ? 'rgba(99,102,241,0.7)' : 'rgba(20,184,166,0.7)'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Outer glow */}
              <div
                className={`absolute inset-2 rounded-full blur-xl transition-all duration-[4000ms] ease-in-out ${
                  breathPhase === 'Inhale' ? 'scale-110 opacity-50 bg-teal-500/20'   :
                  breathPhase === 'Hold'   ? 'scale-110 opacity-70 bg-teal-500/30'   :
                                             'scale-95  opacity-20 bg-indigo-500/15'
                }`}
              />

              {/* Inner circle */}
              <div
                className={`relative flex flex-col items-center justify-center w-40 h-40 rounded-full border shadow-2xl backdrop-blur-md transition-all duration-[4000ms] ease-in-out ${
                  breathPhase === 'Inhale' ? 'scale-110 bg-teal-500/20 border-teal-300/40'     :
                  breathPhase === 'Hold'   ? 'scale-110 bg-emerald-500/20 border-emerald-300/40' :
                                             'scale-95  bg-white/5 border-white/20'
                }`}
              >
                <span className="text-xl font-bold font-serif tracking-wide">{breathPhase}</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest mt-1">
                  {breathPhase === 'Inhale' ? 'Breathe In' : breathPhase === 'Hold' ? 'Hold Breath' : 'Exhale Out'}
                </span>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <span className="text-4xl font-extralight tracking-widest font-mono">
                {formatTime(timeLeft)}
              </span>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
                remaining · {selectedDuration.label} session
              </p>
              {/* Thin progress bar */}
              <div className="mt-3 w-48 mx-auto h-0.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer Controls ────────────────────────────────────────────────── */}
      <div className="w-full max-w-lg flex justify-center gap-4 mb-8">
        {completed ? (
          <button
            onClick={onClose}
            className="w-full max-w-xs bg-white text-black font-semibold py-3 px-6 rounded-full hover:bg-white/90 active:scale-95 transition shadow-lg shadow-white/10 cursor-pointer"
          >
            Return to Feed
          </button>
        ) : hasStarted ? (
          <>
            <button
              onClick={() => setIsActive(a => !a)}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer"
            >
              {isActive ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Resume</>}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 active:scale-95 transition cursor-pointer"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
