'use client';

import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CommentDrawer({ isOpen, onClose, verseId }) {
  const [prayers, setPrayers] = useState([]);
  const [newPrayer, setNewPrayer] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLazyPrompt, setShowLazyPrompt] = useState(false);
  const [activeReactions, setActiveReactions] = useState([]);
  const { user, openAuthModal } = useAuth();

  const triggerReaction = (prayerId) => {
    const id = Date.now() + Math.random();
    
    // Create multiple particles for the burst effect
    const particles = Array.from({ length: 6 }).map((_, i) => ({
      id: id + i,
      prayerId,
      tx: (Math.random() - 0.5) * 100 + 'px',
      ty: (Math.random() - 1) * 80 - 20 + 'px',
      delay: Math.random() * 0.1 + 's',
      scale: Math.random() * 0.5 + 0.5
    }));
    
    setActiveReactions(prev => [...prev, ...particles]);
    setTimeout(() => {
      setActiveReactions(prev => prev.filter(r => r.prayerId !== prayerId));
    }, 1200);
  };

  const handleSupport = async (prayerId, authorName) => {
    triggerReaction(prayerId);

    // Optimistic UI update
    setPrayers(prev => prev.map(p =>
      p.id === prayerId ? { ...p, supportCount: (p.supportCount || 0) + 1 } : p
    ));

    // 1. Notify the top toast (sender's perspective)
    window.dispatchEvent(new CustomEvent('prayer-wave-broadcast', {
      detail: { author: authorName || 'Anonymous', verseId, isSelf: true }
    }));

    // 2. Fire the cinematic overlay (author's perspective — simulated locally;
    //    in a real-time system this would come via WebSocket/SSE to the author's client)
    window.dispatchEvent(new CustomEvent('prayer-wave-received', {
      detail: { targetAuthor: authorName || 'Anonymous' }
    }));

    try {
      await fetch('/api/prayers/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prayerId })
      });
    } catch (err) {
      console.error('Error supporting prayer:', err);
    }
  };

  useEffect(() => {
    if (isOpen && verseId) {
      setLoading(true);
      fetch(`/api/prayers?verseId=${verseId}`)
        .then(res => res.json())
        .then(data => {
          setPrayers(data.prayers || []);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, verseId]);

  const submitPrayer = async (authorName = null) => {
    try {
      const res = await fetch('/api/prayers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          verseId, 
          text: newPrayer,
          author: authorName
        })
      });
      const data = await res.json();
      if (data.success) {
        setPrayers([...prayers, data.prayer]);
        setNewPrayer('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPrayer.trim()) return;

    if (user) {
      submitPrayer(user.name);
    } else {
      setShowLazyPrompt(true);
    }
  };

  const handlePostAsGuest = () => {
    submitPrayer('Anonymous');
    setShowLazyPrompt(false);
  };

  const handlePostWithAuth = () => {
    openAuthModal((loggedInUser) => {
      submitPrayer(loggedInUser.name);
      setShowLazyPrompt(false);
    });
  };

  return (
    <>
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        />
      )}

      <div className={`fixed inset-x-0 bottom-0 z-50 bg-gray-900 text-white rounded-t-3xl transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
      } h-[70vh] flex flex-col border-t border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h3 className="font-semibold text-lg">{prayers.length} Prayers</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

      {/* Prayers List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {loading ? (
          <div className="flex justify-center p-4"><div className="animate-pulse">Loading prayers...</div></div>
        ) : prayers.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">Be the first to pray on this verse.</div>
        ) : (
          prayers.map((prayer) => (
            <div key={prayer.id} className="flex items-start justify-between gap-3 bg-white/[0.02] border border-white/5 rounded-2xl p-3.5 relative overflow-hidden transition-all duration-200 hover:bg-white/[0.04]">
              {/* Floating burst particles container */}
              {activeReactions.filter(r => r.prayerId === prayer.id).map(r => (
                <span 
                  key={r.id} 
                  className="absolute bottom-4 right-8 text-xl pointer-events-none z-30 select-none drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  style={{ 
                    '--tx': r.tx, 
                    '--ty': r.ty, 
                    animation: `particle-burst 1s cubic-bezier(0.1, 0.8, 0.2, 1) forwards ${r.delay}`,
                    transform: `scale(${r.scale})`
                  }}
                >
                  ✨
                </span>
              ))}

              <div className="flex gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                  {prayer.author ? prayer.author[0].toUpperCase() : 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-purple-300 mb-0.5">{prayer.author || 'Anonymous'}</p>
                  <p className="text-sm text-gray-100 leading-relaxed break-words">{prayer.text}</p>
                </div>
              </div>

              <button 
                onClick={() => handleSupport(prayer.id, prayer.author)}
                className="flex items-center gap-1.5 bg-gray-800/60 hover:bg-gray-700/80 active:scale-95 transition-all text-xs font-semibold text-gray-300 hover:text-white px-3 py-1.5 rounded-full border border-white/5 shadow-inner cursor-pointer"
              >
                <span>🙏</span>
                <span className="tabular-nums font-mono text-[10px]">{prayer.supportCount || 0}</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900 relative">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newPrayer}
            onChange={(e) => setNewPrayer(e.target.value)}
            placeholder="Add a prayer..."
            className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button 
            type="submit" 
            disabled={!newPrayer.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10"
          >
            <Send size={16} />
          </button>
        </form>

        {/* Lazy Auth Prompt Overlay */}
        {showLazyPrompt && (
          <div className="absolute inset-0 bg-gray-950/95 flex flex-col items-center justify-center p-4 text-center rounded-t-xl animate-in fade-in duration-200 z-10">
            <p className="text-xs text-gray-300 mb-3">Save this prayer to your profile?</p>
            <div className="flex gap-3 w-full max-w-xs">
              <button 
                onClick={handlePostAsGuest}
                className="flex-1 py-1.5 px-3 rounded-xl border border-white/10 text-gray-400 hover:text-white text-xs transition-colors cursor-pointer"
              >
                Post as Guest
              </button>
              <button 
                onClick={handlePostWithAuth}
                className="flex-1 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign In
              </button>
            </div>
            <button 
              onClick={() => setShowLazyPrompt(false)} 
              className="mt-2 text-[10px] text-gray-500 hover:text-gray-400 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <style>{`
        /* Old float reaction removed, using global particle-burst */
      `}</style>
    </div>
    </>
  );
}
