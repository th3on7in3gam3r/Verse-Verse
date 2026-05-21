'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Sliders, X } from 'lucide-react';

// ─── Soundscape catalogue ─────────────────────────────────────────────────────
const TRACKS = [
  { id: 'base',        name: 'Cathedral Pad',    subtitle: 'Sacred Resonance',  icon: '🎹', url: '/ambient.mp3',                          defaultVolume: 0.28, color: 'from-violet-500 to-purple-700',  glow: 'rgba(139,92,246,0.35)'  },
  { id: 'gregorian',   name: 'Gregorian Echoes',  subtitle: 'Medieval Chant',    icon: '🕊️', url: '/audio/gregorian%20chant.mp3',          defaultVolume: 0.18, color: 'from-amber-600 to-yellow-800',   glow: 'rgba(217,119,6,0.35)'   },
  { id: 'churchbells', name: 'Church Bells',       subtitle: 'Distant Toll',      icon: '⛪', url: '/audio/church%20bells.mp3',             defaultVolume: 0.16, color: 'from-yellow-500 to-amber-600',   glow: 'rgba(234,179,8,0.30)'   },
  { id: 'tibetan',     name: 'Tibetan Bowls',      subtitle: 'Resonant Healing',  icon: '🔔', url: '/audio/tibetan%20bells.mp3',            defaultVolume: 0.18, color: 'from-orange-400 to-amber-500',   glow: 'rgba(251,146,60,0.30)'  },
  { id: 'rain',        name: 'Midnight Rain',      subtitle: 'Storm & Stillness', icon: '🌧️', url: '/audio/rain.mp3',                       defaultVolume: 0.20, color: 'from-blue-500 to-indigo-700',    glow: 'rgba(99,102,241,0.35)'  },
  { id: 'ocean',       name: 'Deep Ocean Waves',   subtitle: 'Coastal Drift',     icon: '🌊', url: '/audio/ocean%20waves.mp3',              defaultVolume: 0.18, color: 'from-cyan-500 to-blue-700',      glow: 'rgba(6,182,212,0.35)'   },
  { id: 'fire',        name: 'Crackling Hearth',   subtitle: 'Fireside Warmth',   icon: '🔥', url: '/audio/fireplace%20crackling.mp3',      defaultVolume: 0.20, color: 'from-orange-500 to-red-700',     glow: 'rgba(249,115,22,0.35)'  },
  { id: 'wind',        name: 'Whispering Wind',    subtitle: 'Open Plains',       icon: '🌬️', url: '/audio/wind.mp3',                       defaultVolume: 0.14, color: 'from-sky-400 to-blue-500',       glow: 'rgba(56,189,248,0.25)'  },
  { id: 'chimes',      name: 'Temple Chimes',      subtitle: 'Sacred Resonance',  icon: '✨', url: '/audio/chimes.mp3',                     defaultVolume: 0.16, color: 'from-teal-400 to-emerald-600',   glow: 'rgba(20,184,166,0.30)'  },
];

function buildInitialStates() {
  const s = {};
  TRACKS.forEach(t => { s[t.id] = { active: false, volume: t.defaultVolume }; });
  return s;
}

export default function BackgroundMusic() {
  const [isPlaying,   setIsPlaying]   = useState(false);
  const [panelOpen,   setPanelOpen]   = useState(false);
  const [trackStates, setTrackStates] = useState(buildInitialStates);

  // ── Stable refs — created ONCE on mount, never recreated ──────────────────
  const audiosRef        = useRef({});   // { [id]: HTMLAudioElement }
  const fadeTimersRef    = useRef({});   // { [id]: intervalId }
  const isPlayingRef     = useRef(false);
  const trackStatesRef   = useRef(trackStates);

  // Keep refs in sync with state without triggering re-renders
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { trackStatesRef.current = trackStates; }, [trackStates]);

  // ── Bootstrap audio elements exactly once ─────────────────────────────────
  useEffect(() => {
    TRACKS.forEach(t => {
      const audio = new Audio(t.url);
      audio.loop    = true;
      audio.preload = 'none'; // lazy — don't download until played
      audio.volume  = 0;
      audiosRef.current[t.id] = audio;
    });

    // TTS ducking
    const duck    = () => { if (!isPlayingRef.current) return; TRACKS.forEach(t => { if (trackStatesRef.current[t.id]?.active) fadeVol(t.id, 0.02, 600); }); };
    const unduck  = () => { if (!isPlayingRef.current) return; TRACKS.forEach(t => { if (trackStatesRef.current[t.id]?.active) fadeVol(t.id, trackStatesRef.current[t.id].volume, 1000); }); };
    const onMedStart = () => { if (!isPlayingRef.current) startTracks(Object.keys(trackStatesRef.current).filter(id => trackStatesRef.current[id].active)); };

    window.addEventListener('tts-start',        duck);
    window.addEventListener('tts-end',          unduck);
    window.addEventListener('meditation-start', onMedStart);

    return () => {
      window.removeEventListener('tts-start',        duck);
      window.removeEventListener('tts-end',          unduck);
      window.removeEventListener('meditation-start', onMedStart);
      TRACKS.forEach(t => {
        const a = audiosRef.current[t.id];
        if (a) { a.pause(); a.src = ''; }
        clearInterval(fadeTimersRef.current[t.id]);
      });
    };
  }, []); // ← empty deps: runs once only

  // ── Volume fade engine ─────────────────────────────────────────────────────
  const fadeVol = useCallback((id, target, ms = 1200) => {
    const audio = audiosRef.current[id];
    if (!audio) return;
    clearInterval(fadeTimersRef.current[id]);
    const steps    = Math.max(1, ms / 50);
    const delta    = (target - audio.volume) / steps;
    let   step     = 0;
    fadeTimersRef.current[id] = setInterval(() => {
      step++;
      let v = audio.volume + delta;
      v = delta > 0 ? Math.min(v, target) : Math.max(v, target);
      if (isNaN(v) || v < 0) v = 0;
      if (v > 1) v = 1;
      audio.volume = v;
      if (step >= steps || v === target) clearInterval(fadeTimersRef.current[id]);
    }, 50);
  }, []);

  // ── Play a list of track ids ───────────────────────────────────────────────
  const startTracks = useCallback((ids) => {
    ids.forEach(id => {
      const audio = audiosRef.current[id];
      const vol   = trackStatesRef.current[id]?.volume ?? 0.2;
      if (!audio) return;
      audio.volume = 0;
      audio.play()
        .then(() => fadeVol(id, vol, 1500))
        .catch(() => {}); // autoplay policy — silently ignore
    });
  }, [fadeVol]);

  // ── Stop a list of track ids ───────────────────────────────────────────────
  const stopTracks = useCallback((ids) => {
    ids.forEach(id => {
      const audio = audiosRef.current[id];
      if (!audio) return;
      fadeVol(id, 0, 900);
      setTimeout(() => audio.pause(), 950);
    });
  }, [fadeVol]);

  // ── Master play / stop ─────────────────────────────────────────────────────
  const toggleMaster = () => {
    if (isPlayingRef.current) {
      // Stop everything
      stopTracks(TRACKS.map(t => t.id));
      setIsPlaying(false);
    } else {
      // Start all currently active tracks
      const activeIds = TRACKS.filter(t => trackStatesRef.current[t.id]?.active).map(t => t.id);
      if (activeIds.length === 0) {
        // Nothing active yet — activate and play the base track
        setTrackStates(prev => ({ ...prev, base: { ...prev.base, active: true } }));
        startTracks(['base']);
      } else {
        startTracks(activeIds);
      }
      setIsPlaying(true);
    }
  };

  // ── Toggle individual track ────────────────────────────────────────────────
  // Clicking a track ALWAYS starts playback — no need to hit master play first.
  const toggleTrack = (id) => {
    const wasActive = trackStatesRef.current[id]?.active ?? false;
    const newActive = !wasActive;

    setTrackStates(prev => ({ ...prev, [id]: { ...prev[id], active: newActive } }));

    if (newActive) {
      // Activate: start playing immediately and set master to playing
      startTracks([id]);
      setIsPlaying(true);
    } else {
      // Deactivate: fade out and pause
      stopTracks([id]);
      // If no tracks remain active, update master state
      const remaining = TRACKS.filter(t => t.id !== id && trackStatesRef.current[t.id]?.active);
      if (remaining.length === 0) setIsPlaying(false);
    }
  };

  // ── Volume slider ──────────────────────────────────────────────────────────
  const handleVolumeChange = (id, val) => {
    const v = parseFloat(val);
    setTrackStates(prev => ({ ...prev, [id]: { ...prev[id], volume: v } }));
    const audio = audiosRef.current[id];
    if (audio && trackStatesRef.current[id]?.active) audio.volume = v;
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const activeCount = TRACKS.filter(t => trackStates[t.id]?.active).length;

  return (
    <div className="flex flex-col items-start gap-2 pointer-events-auto relative z-50">

      {/* Master pill */}
      <div className={`flex items-center gap-1.5 border p-1 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 ${
        isPlaying ? 'bg-purple-950/40 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-black/40 border-white/10'
      }`}>
        <button onClick={toggleMaster} title={isPlaying ? 'Stop' : 'Play'}
          className={`p-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer ${isPlaying ? 'text-purple-300' : 'text-white'}`}>
          {isPlaying ? (
            <div className="flex items-center gap-1.5 px-1.5">
              <div className="flex items-end gap-[2px] h-[12px] w-[16px]">
                {[0.1,0.4,0.2,0.5].map((d,i) => (
                  <div key={i} className="w-[2.5px] bg-purple-400 rounded-full soundwave-bar shadow-[0_0_8px_rgba(168,85,247,0.8)]" style={{ animationDelay: `${d}s` }} />
                ))}
              </div>
              <Volume2 size={14} className="text-purple-400" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-1.5">
              <div className="flex items-end gap-[2px] h-[12px] w-[16px] opacity-40">
                {[0,0,0,0].map((_,i) => <div key={i} className="w-[2.5px] bg-white/30 rounded-full h-[3px]" />)}
              </div>
              <VolumeX size={14} className="text-white/40" />
            </div>
          )}
        </button>

        <button onClick={() => setPanelOpen(p => !p)} title="Open Mixer"
          className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
            panelOpen ? 'bg-purple-600/30 text-purple-300 border border-purple-500/20' : 'hover:bg-white/5 text-white/50 hover:text-white'
          }`}>
          <Sliders size={14} />
        </button>
      </div>

      {/* Mixer panel — absolutely positioned so it floats below the pill */}
      {panelOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-zinc-950/97 border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-2xl animate-in fade-in slide-in-from-top-3 duration-200 overflow-hidden z-50">

          {/* Header */}
          <div className="flex justify-between items-center px-4 pt-4 pb-3 border-b border-white/[0.06]">
            <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-purple-400 flex items-center gap-1.5">
              <Sliders size={10} /> Spatial Audio Mixer
            </span>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <span className="text-[9px] text-purple-300/60 font-mono">{activeCount} active</span>
              )}
              <button onClick={() => setPanelOpen(false)} className="text-white/25 hover:text-white/70 transition-colors cursor-pointer">
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Track list */}
          <div className="px-3 py-3 space-y-1 max-h-[420px] overflow-y-auto no-scrollbar">
            {TRACKS.map(track => {
              const state  = trackStates[track.id];
              const active = state?.active ?? false;
              return (
                <div key={track.id}
                  className={`rounded-xl border transition-all duration-250 overflow-hidden ${
                    active ? 'border-white/12 bg-white/[0.05]' : 'border-transparent hover:bg-white/[0.03]'
                  }`}>
                  {/* Track row */}
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    {/* Icon — clicking toggles the track */}
                    <button onClick={() => toggleTrack(track.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-all duration-300 cursor-pointer bg-gradient-to-br ${track.color} ${
                        active ? 'opacity-100 shadow-lg' : 'opacity-25 grayscale hover:opacity-50'
                      }`}
                      style={active ? { boxShadow: `0 4px 14px ${track.glow}` } : {}}
                    >
                      {track.icon}
                    </button>

                    {/* Name + subtitle */}
                    <div className="flex-1 min-w-0" onClick={() => toggleTrack(track.id)} style={{ cursor: 'pointer' }}>
                      <p className={`text-xs font-semibold truncate transition-colors ${active ? 'text-white' : 'text-white/35'}`}>
                        {track.name}
                      </p>
                      <p className="text-[10px] text-white/20 truncate">{track.subtitle}</p>
                    </div>

                    {/* Volume % */}
                    <span className={`text-[10px] font-mono tabular-nums w-7 text-right shrink-0 transition-colors ${active ? 'text-white/50' : 'text-white/15'}`}>
                      {active ? `${Math.round((state?.volume ?? 0) * 100)}` : '—'}
                    </span>
                  </div>

                  {/* Volume slider — only when active */}
                  {active && (
                    <div className="px-3 pb-3">
                      <input type="range" min="0" max="1" step="0.01"
                        value={state?.volume ?? 0}
                        onChange={e => handleVolumeChange(track.id, e.target.value)}
                        className="w-full h-1 rounded-full appearance-none cursor-pointer accent-purple-500"
                        style={{
                          background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(state?.volume ?? 0) * 100}%, rgba(255,255,255,0.08) ${(state?.volume ?? 0) * 100}%, rgba(255,255,255,0.08) 100%)`
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer tip */}
          <div className="mx-3 mb-3 bg-purple-500/[0.06] border border-purple-500/10 rounded-xl p-3 flex items-start gap-2">
            <span className="text-purple-400 text-sm shrink-0">🎧</span>
            <p className="text-[10px] text-white/30 leading-relaxed">
              Tap any track to start it instantly. Layer multiple sounds for a custom spatial mix.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
