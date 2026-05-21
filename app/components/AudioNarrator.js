'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Loader2, Mic2, ChevronUp, ChevronDown, BookOpen, ScrollText } from 'lucide-react';

// ─── Voice roster ──────────────────────────────────────────────────────────────
const VOICES = [
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel',  desc: 'Deep · Authoritative' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel',  desc: 'Warm · Clear' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam',    desc: 'Strong · Calm' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni',  desc: 'Warm · Resonant' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold',  desc: 'Rich · Serene' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam',     desc: 'Raspy · Cinematic' },
];

// ─── Animated waveform ─────────────────────────────────────────────────────────
function Waveform({ isPlaying }) {
  const BARS = 22;
  return (
    <div className="flex items-end gap-[2px] h-7" aria-hidden="true">
      {Array.from({ length: BARS }).map((_, i) => {
        const baseH   = 3 + (i % 3);
        const activeH = 6 + Math.abs(Math.sin(i * 0.7)) * 18;
        const dur     = (0.55 + (i % 5) * 0.09).toFixed(2);
        const delay   = (i * 0.04).toFixed(2);
        return (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: 2.5,
              height: isPlaying ? `${activeH}px` : `${baseH}px`,
              background: isPlaying
                ? `hsl(${252 + i * 3}, 75%, ${60 + i}%)`
                : 'rgba(255,255,255,0.15)',
              animation: isPlaying
                ? `narratorWave ${dur}s ease-in-out ${delay}s infinite alternate`
                : 'none',
              transition: 'height 0.35s ease, background 0.4s ease',
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AudioNarrator({ verse, isVisible }) {
  // ── Mode: 'verse' reads the scripture; 'devotion' reads an AI devotion ───────
  const [mode, setMode]                    = useState('verse');   // 'verse' | 'devotion'
  const [selectedVoice, setSelectedVoice]  = useState(VOICES[0]);
  const [isExpanded, setIsExpanded]        = useState(false);
  const [status, setStatus]                = useState('idle');    // idle|loading|ai|playing|paused|error
  const [progress, setProgress]            = useState(0);
  const [duration, setDuration]            = useState(0);
  const [errorMsg, setErrorMsg]            = useState('');
  // cache devotion text per verse so we only call Gemini once
  const devotionCacheRef = useRef({});
  // audio blob url cache: Map<voiceId::cacheKey, blobUrl>
  const audioCacheRef    = useRef(new Map());
  const audioRef         = useRef(null);

  const audioCacheKey = `${selectedVoice.id}::${mode}::${verse.id}`;

  // ── Pause when scrolled away ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isVisible && audioRef.current) {
      audioRef.current.pause();
      setStatus(s => s === 'playing' ? 'paused' : s);
      window.dispatchEvent(new CustomEvent('tts-end'));
    }
  }, [isVisible]);

  // ── Full reset on verse change ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        window.dispatchEvent(new CustomEvent('tts-end'));
      }
      setStatus('idle');
      setProgress(0);
      setDuration(0);
      audioCacheRef.current.forEach(url => { try { URL.revokeObjectURL(url); } catch {} });
      audioCacheRef.current.clear();
    };
  }, [verse.id]);

  // ── Reset playback state when mode switches ──────────────────────────────────
  const switchMode = (m) => {
    if (m === mode) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      window.dispatchEvent(new CustomEvent('tts-end'));
    }
    setStatus('idle');
    setProgress(0);
    setDuration(0);
    setMode(m);
  };

  // ── Get devotion text (cached) ───────────────────────────────────────────────
  const getDevotionText = useCallback(async () => {
    if (devotionCacheRef.current[verse.id]) return devotionCacheRef.current[verse.id];

    const res = await fetch('/api/ai/devotion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference: verse.reference, text: verse.text }),
    });
    if (!res.ok) throw new Error('Could not generate devotion.');
    const { devotion } = await res.json();
    devotionCacheRef.current[verse.id] = devotion;
    return devotion;
  }, [verse.id, verse.reference, verse.text]);

  // ── Fetch audio blob URL ─────────────────────────────────────────────────────
  const fetchAudio = useCallback(async (text) => {
    if (audioCacheRef.current.has(audioCacheKey)) {
      const url = audioCacheRef.current.get(audioCacheKey);
      audioCacheRef.current.delete(audioCacheKey);
      audioCacheRef.current.set(audioCacheKey, url);
      return url;
    }

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId: selectedVoice.id }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error || `HTTP ${res.status}`);
    }

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    audioCacheRef.current.set(audioCacheKey, url);
    if (audioCacheRef.current.size > 24) {
      const first = audioCacheRef.current.keys().next().value;
      try { URL.revokeObjectURL(audioCacheRef.current.get(first)); } catch {}
      audioCacheRef.current.delete(first);
    }
    return url;
  }, [audioCacheKey, selectedVoice.id]);

  // ── Audio event listener setup ───────────────────────────────────────────────
  const attachListeners = useCallback((audio) => {
    audio.onloadedmetadata = () => setDuration(audio.duration);
    audio.ontimeupdate     = () => {
      if (audio.duration > 0) setProgress(audio.currentTime / audio.duration);
    };
    audio.onended = () => {
      setStatus('idle');
      setProgress(0);
      window.dispatchEvent(new CustomEvent('tts-end'));
    };
    audio.onerror = () => {
      setStatus('error');
      setErrorMsg('Playback failed — tap to retry.');
      window.dispatchEvent(new CustomEvent('tts-end'));
    };
  }, []);

  // ── Main play / pause toggle ─────────────────────────────────────────────────
  const toggle = async () => {
    if (status === 'error') {
      audioCacheRef.current.delete(audioCacheKey);
      setStatus('idle'); setErrorMsg(''); return;
    }
    if (status === 'playing') {
      audioRef.current?.pause();
      setStatus('paused');
      window.dispatchEvent(new CustomEvent('tts-end'));
      return;
    }
    if (status === 'paused' && audioRef.current) {
      audioRef.current.play();
      setStatus('playing');
      window.dispatchEvent(new CustomEvent('tts-start'));
      return;
    }

    // Fresh play
    setErrorMsg('');
    try {
      let text;
      if (mode === 'devotion') {
        setStatus('ai'); // AI generating phase
        text = await getDevotionText();
        setStatus('loading'); // TTS generating phase
      } else {
        setStatus('loading');
        text = `${verse.text}. ${verse.reference}.`;
      }

      const url = await fetchAudio(text);

      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
      const audio = new Audio(url);
      audioRef.current = audio;
      attachListeners(audio);
      await audio.play();
      setStatus('playing');
      window.dispatchEvent(new CustomEvent('tts-start'));
    } catch (err) {
      console.error('[AudioNarrator]', err);
      setStatus('error');
      setErrorMsg(err.message || 'Could not load audio.');
    }
  };

  // ── Voice switch ─────────────────────────────────────────────────────────────
  const switchVoice = (voice) => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; window.dispatchEvent(new CustomEvent('tts-end')); }
    setStatus('idle'); setProgress(0); setSelectedVoice(voice);
  };

  // ── Derived state ────────────────────────────────────────────────────────────
  const isPlaying  = status === 'playing';
  const isLoading  = status === 'loading' || status === 'ai';
  const isError    = status === 'error';

  const loadingLabel = status === 'ai' ? 'Writing devotion…' : 'Generating audio…';

  const formatTime = (s) => {
    if (!s || !isFinite(s)) return '—';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div
        className="relative flex flex-col gap-1.5"
        style={{ filter: 'drop-shadow(0 8px 40px rgba(139,92,246,0.35))' }}
      >

        {/* ── Voice picker panel ─────────────────────────────────────────────── */}
        {isExpanded && (
          <div
            className="mb-1 rounded-2xl border border-purple-500/20 bg-black/75 backdrop-blur-2xl px-3 py-3 w-64 shadow-2xl"
            style={{ animation: 'narratorSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
          >
            <p className="text-purple-300/50 text-[9px] uppercase tracking-[0.2em] mb-2.5 font-bold">
              Select Voice
            </p>
            <div className="flex flex-col gap-1">
              {VOICES.map(v => (
                <button
                  key={v.id}
                  onClick={() => switchVoice(v)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                    selectedVoice.id === v.id
                      ? 'bg-purple-600/40 border border-purple-500/50 text-white'
                      : 'bg-white/5 border border-transparent hover:bg-white/10 text-white/60'
                  }`}
                >
                  <span className="text-xs font-semibold">{v.name}</span>
                  <span className="text-[9px] text-white/35 font-medium">{v.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Mode pills ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1.5">
          <button
            onClick={() => switchMode('verse')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
              mode === 'verse'
                ? 'bg-purple-600/60 border border-purple-500/50 text-white shadow-md'
                : 'bg-black/50 border border-white/10 text-white/40 hover:text-white/70'
            }`}
          >
            <ScrollText size={10} />
            Verse
          </button>
          <button
            onClick={() => switchMode('devotion')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all duration-200 cursor-pointer ${
              mode === 'devotion'
                ? 'bg-amber-600/60 border border-amber-500/50 text-amber-100 shadow-md shadow-amber-900/30'
                : 'bg-black/50 border border-white/10 text-white/40 hover:text-white/70'
            }`}
          >
            <BookOpen size={10} />
            Devotion ✦
          </button>
        </div>

        {/* ── Main player card ───────────────────────────────────────────────── */}
        <div className={`flex items-center gap-3 backdrop-blur-2xl rounded-2xl pl-2 pr-3 py-2 min-w-[13.5rem] transition-all duration-500 ${
          mode === 'devotion'
            ? 'bg-amber-950/60 border border-amber-500/15 shadow-[0_4px_40px_rgba(217,119,6,0.20)]'
            : 'bg-black/60 border border-white/[0.08] shadow-[0_4px_40px_rgba(139,92,246,0.22)]'
        }`}>

          {/* Play button */}
          <button
            onClick={toggle}
            disabled={isLoading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 active:scale-90 cursor-pointer ${
              isError
                ? 'bg-red-600/70 hover:bg-red-500/80'
                : mode === 'devotion'
                  ? 'bg-gradient-to-br from-amber-500 to-orange-700 hover:from-amber-400 hover:to-orange-600 shadow-lg shadow-amber-900/40'
                  : 'bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 shadow-lg shadow-purple-900/50'
            } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isLoading ? (
              <Loader2 size={17} className="text-white animate-spin" />
            ) : isError ? (
              <span className="text-white text-xs font-bold">↺</span>
            ) : isPlaying ? (
              <Pause size={16} className="text-white" fill="white" />
            ) : (
              <Play size={16} className="text-white ml-0.5" fill="white" />
            )}
          </button>

          {/* Info column */}
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            {/* Label row */}
            <div className="flex items-center gap-1.5">
              <Mic2 size={9} className={mode === 'devotion' ? 'text-amber-400 shrink-0' : 'text-purple-400 shrink-0'} />
              <span className="text-white/50 text-[10px] font-medium truncate">
                {isLoading ? loadingLabel : isError ? errorMsg : selectedVoice.name}
              </span>
              {duration > 0 && !isError && (
                <span className="text-white/25 text-[9px] ml-auto shrink-0 tabular-nums">
                  {formatTime(progress * duration)}&thinsp;/&thinsp;{formatTime(duration)}
                </span>
              )}
            </div>

            {/* Progress bar */}
            <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progress * 100}%`,
                  background: isError
                    ? 'rgb(239 68 68)'
                    : mode === 'devotion'
                      ? 'linear-gradient(to right, #f59e0b, #ea580c)'
                      : 'linear-gradient(to right, #a855f7, #6366f1)',
                }}
              />
            </div>

            {/* Waveform */}
            <Waveform isPlaying={isPlaying} />
          </div>

          {/* Settings toggle */}
          <button
            onClick={() => setIsExpanded(p => !p)}
            className="text-white/25 hover:text-white/60 transition-colors cursor-pointer ml-1 shrink-0"
            aria-label="Toggle voice settings"
          >
            {isExpanded ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes narratorSlideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes narratorWave {
          0%   { transform: scaleY(0.3); }
          100% { transform: scaleY(1);   }
        }
      `}</style>
    </>
  );
}
