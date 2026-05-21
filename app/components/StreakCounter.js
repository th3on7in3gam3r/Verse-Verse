'use client';

import { useState, useEffect, useCallback } from 'react';
import { Flame, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getStreakData,
  getNextMilestone,
  isStreakAtRisk,
  isTodayCompleted,
  STREAK_UPDATED_EVENT,
} from '../../lib/streak';

export default function StreakCounter({ onOpenDashboard }) {
  const [streak, setStreak] = useState(0);
  const [todayDone, setTodayDone] = useState(false);
  const [atRisk, setAtRisk] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [toast, setToast] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, openAuthModal, logout } = useAuth();

  const loadStreak = useCallback(() => {
    const data = getStreakData();
    setStreak(data.count);
    setTodayDone(isTodayCompleted());
    setAtRisk(isStreakAtRisk());
  }, []);

  useEffect(() => {
    loadStreak();

    const onUpdate = (e) => {
      loadStreak();
      const detail = e?.detail;
      if (detail?.streakIncreased) {
        setPulse(true);
        setToast({ count: detail.streak.count, type: 'up' });
        setTimeout(() => setPulse(false), 1200);
        setTimeout(() => setToast(null), 3200);
      } else if (detail?.isNewCompletion) {
        setToast({ count: detail.streak.count, type: 'done' });
        setTimeout(() => setToast(null), 2800);
      }
    };

    window.addEventListener(STREAK_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(STREAK_UPDATED_EVENT, onUpdate);
  }, [loadStreak]);

  const nextMilestone = getNextMilestone(streak);

  const streakPill = (
    <button
      type="button"
      onClick={() => (user ? onOpenDashboard() : openAuthModal())}
      title={
        todayDone
          ? `${streak} day streak — today complete`
          : atRisk
            ? 'Complete Verse of the Day before midnight!'
            : 'Complete Verse of the Day to start your streak'
      }
      className={`group/streak relative bg-black/45 hover:bg-orange-500/10 border backdrop-blur-xl rounded-full px-3 py-1.5 flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
        pulse ? 'streak-pill-pop border-orange-400/60 shadow-orange-500/30' : ''
      } ${
        todayDone
          ? 'border-emerald-400/35 shadow-emerald-500/10'
          : atRisk
            ? 'border-amber-400/50 shadow-amber-500/15 animate-pulse'
            : 'border-orange-500/30 shadow-orange-500/10'
      }`}
    >
      <div className="relative">
        <Flame
          size={18}
          className={`transition-all ${
            streak > 0
              ? todayDone
                ? 'text-emerald-400 fill-emerald-400'
                : 'text-orange-500 fill-orange-500 group-hover/streak:scale-110'
              : 'text-orange-500/70 fill-orange-500/30'
          } ${pulse ? 'streak-flame-burst' : ''}`}
        />
        {todayDone && (
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-black/80" />
        )}
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className="text-white font-black text-sm tabular-nums">{streak}</span>
        <span className="text-[8px] font-bold uppercase tracking-wider text-white/40">
          {streak === 1 ? 'day' : 'days'}
        </span>
      </div>
      {!user && (
        <span className="max-w-0 overflow-hidden group-hover/streak:max-w-[100px] transition-all duration-500 text-[9px] text-orange-300/90 font-medium whitespace-nowrap">
          Save streak
        </span>
      )}
    </button>
  );

  return (
    <div className="flex items-center gap-2 pointer-events-auto relative">
      {toast && (
        <div className="absolute right-0 top-full mt-2 z-[80] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="rounded-xl border border-orange-400/30 bg-black/90 backdrop-blur-xl px-3 py-2 shadow-2xl shadow-orange-500/20 whitespace-nowrap">
            <p className="text-[10px] font-bold text-orange-200 flex items-center gap-1.5">
              <Flame size={12} className="fill-orange-400 text-orange-400" />
              {toast.type === 'up'
                ? `${toast.count} day streak! Keep going.`
                : 'Today\u2019s reflection complete'}
            </p>
            {nextMilestone && toast.type === 'up' && (
              <p className="text-[9px] text-white/45 mt-0.5">
                {nextMilestone.remaining} more to {nextMilestone.label}
              </p>
            )}
          </div>
        </div>
      )}

      {streakPill}

      {user ? (
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="bg-black/40 hover:bg-black/60 border border-white/10 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shadow-lg cursor-pointer relative z-50"
          >
            <div className="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <span className="max-w-[70px] truncate">{user.name}</span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-[60] cursor-default" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-36 bg-gray-950/95 border border-white/10 rounded-xl py-1 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 z-[70] sm:right-0 right-[-8px]">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenDashboard();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-white/5 hover:text-white border-b border-white/5 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LayoutDashboard size={12} className="text-purple-400" />
                  My Dashboard
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={12} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={() => openAuthModal()}
          className="bg-purple-600/80 hover:bg-purple-600 border border-purple-500/20 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 transition-all cursor-pointer"
        >
          Sign In
        </button>
      )}
    </div>
  );
}
