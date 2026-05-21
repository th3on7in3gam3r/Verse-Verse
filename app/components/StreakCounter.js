'use client';

import { useState, useEffect } from 'react';
import { Flame, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function StreakCounter({ onOpenDashboard }) {
  const [streak, setStreak] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, openAuthModal, logout } = useAuth();

  const loadStreak = () => {
    const data = localStorage.getItem('verse_streak');
    if (data) {
      const parsed = JSON.parse(data);
      setStreak(parsed.count || 0);
    }
  };

  useEffect(() => {
    loadStreak();

    // Listen for custom event when streak updates
    window.addEventListener('streakUpdated', loadStreak);
    return () => window.removeEventListener('streakUpdated', loadStreak);
  }, []);

  return (
    <div className="absolute top-4 right-4 z-40 flex items-center gap-2 pointer-events-auto">
      {/* Streak pill (always show) */}
      {user ? (
        <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 border border-orange-500/30 flex items-center gap-1.5 shadow-lg shadow-orange-500/20">
          <Flame size={18} className="text-orange-500 fill-orange-500" />
          <span className="text-white font-bold text-sm">{streak}</span>
        </div>
      ) : (
        <button
          onClick={() => openAuthModal()}
          className="group/streak bg-black/40 hover:bg-orange-500/10 border border-orange-500/30 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg shadow-orange-500/5 hover:shadow-orange-500/10 transition-all cursor-pointer"
        >
          <Flame size={18} className="text-orange-500 fill-orange-500 group-hover/streak:animate-bounce" />
          <span className="text-white font-bold text-sm">{streak}</span>
          <span className="max-w-0 overflow-hidden group-hover/streak:max-w-[120px] transition-all duration-500 text-[10px] text-orange-300 font-medium whitespace-nowrap">
            Sync to cloud
          </span>
        </button>
      )}

      {/* Auth state button / profile menu */}
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
              {/* Invisible backdrop to dismiss the dropdown */}
              <div
                className="fixed inset-0 z-[60] cursor-default"
                onClick={() => setMenuOpen(false)}
              />

              {/* Dropdown Menu */}
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
