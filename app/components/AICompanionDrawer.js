'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen, Bookmark, History, RotateCcw, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const EMOTION_CHIPS = [
  { label: '🌿 Anxiety', text: 'I am anxious and stressed' },
  { label: '🕯️ Loneliness', text: 'I feel lonely and isolated' },
  { label: '✨ Gratitude', text: 'I am grateful and happy' },
  { label: '🌊 Grief', text: 'I am grieving and sad' },
  { label: '🧭 Seeking Wisdom', text: 'I need guidance and wisdom' },
  { label: '🕊️ Weariness', text: 'I am tired and exhausted' }
];

export default function AICompanionDrawer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('companion'); // companion, journal
  const [feeling, setFeeling] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);
  const [journal, setJournal] = useState([]);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalError, setJournalError] = useState(null); // null | 'auth' | 'error'
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pendingSave, setPendingSave] = useState(null);
  
  const { user, openAuthModal } = useAuth();

  // Load journal when switching to journal tab
  useEffect(() => {
    if (activeTab === 'journal') {
      // Always attempt fetch — the response tells us auth state authoritatively
      fetchJournal();
    }
  }, [activeTab, user]);

  const fetchJournal = async () => {
    try {
      setJournalLoading(true);
      setJournalError(null);
      const res = await fetch('/api/journal');
      if (res.status === 401) {
        // Server says not authenticated — show sign-in prompt regardless of
        // what the client-side user state thinks.
        setJournalError('auth');
        setJournal([]);
        return;
      }
      if (!res.ok) {
        setJournalError('error');
        setJournal([]);
        return;
      }
      const data = await res.json();
      setJournal(data.journal || []);
    } catch (err) {
      console.error(err);
      setJournalError('error');
    } finally {
      setJournalLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!feeling.trim()) return;

    try {
      setLoading(true);
      setGeneratedData(null);
      setSaveSuccess(false);

      const res = await fetch('/api/ai/prayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feeling })
      });

      const data = await res.json();
      setGeneratedData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToJournal = async (targetData = generatedData) => {
    if (!targetData) return;

    // Capture feeling at call time so the lazy-auth callback
    // always uses the value the user typed, not a stale closure.
    const feelingSnapshot = feeling;

    if (!user) {
      setPendingSave(targetData);
      openAuthModal(async () => {
        await executeSave(targetData, feelingSnapshot);
        setPendingSave(null);
      });
      return;
    }

    await executeSave(targetData, feelingSnapshot);
  };

  const executeSave = async (targetData, feelingValue = feeling) => {
    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feeling: feelingValue,
          prayer: targetData.prayer,
          verses: targetData.verses.map(v => `${v.reference}|${v.text}`).join(';')
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        fetchJournal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    if (!generatedData) return;
    const textToCopy = `"${generatedData.prayer}"\n\nScriptures:\n${generatedData.verses.map(v => `${v.reference} - "${v.text}"`).join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      <div className={`fixed inset-y-0 right-0 z-50 bg-gray-950 text-white w-full md:max-w-md transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } h-screen flex flex-col border-l border-gray-900 shadow-2xl`}>
        
        {/* Header */}
        <div className="flex flex-col p-4 border-b border-gray-900 bg-gray-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/10">
                <Sparkles size={16} className="text-white animate-pulse" />
              </div>
              <h3 className="font-semibold text-lg tracking-wide font-serif">Faith Companion</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-900 rounded-full transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-gray-900/60 p-1 rounded-xl border border-gray-900">
            <button
              onClick={() => setActiveTab('companion')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'companion' 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Sparkles size={12} />
              Companion
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'journal' 
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md' 
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              <History size={12} />
              Journal
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar bg-gradient-to-b from-gray-950 to-gray-900">
          {activeTab === 'companion' ? (
            <div className="space-y-6">
              {/* Output / Generated Prayer View */}
              {generatedData ? (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  {/* The generated prayer card */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative shadow-2xl backdrop-blur-md overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl" />
                    
                    <p className="text-base md:text-lg font-serif italic text-white/95 leading-relaxed relative z-10">
                      "{generatedData.prayer}"
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-end gap-3 relative z-10">
                      <button 
                        onClick={handleCopy}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                        title="Copy prayer"
                      >
                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button 
                        onClick={() => handleSaveToJournal()}
                        disabled={saveSuccess}
                        className={`p-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 cursor-pointer ${
                          saveSuccess 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:opacity-90 shadow-lg shadow-teal-500/10'
                        }`}
                      >
                        <Bookmark size={14} />
                        {saveSuccess ? 'Saved in Journal' : 'Save to Journal'}
                      </button>
                    </div>
                  </div>

                  {/* Bible Verse Suggestions */}
                  <div className="space-y-3">
                    <h4 className="text-xs uppercase tracking-widest text-white/50 font-semibold flex items-center gap-1.5">
                      <BookOpen size={12} />
                      Scriptures for Reflection
                    </h4>
                    
                    <div className="space-y-3">
                      {generatedData.verses.map((verse, index) => (
                        <div 
                          key={index}
                          className="bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 hover:bg-white/10 shadow-lg"
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-semibold text-teal-400 font-serif">{verse.reference}</span>
                          </div>
                          <p className="text-xs text-white/80 leading-relaxed italic">"{verse.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reset/Start Over Button */}
                  <button 
                    onClick={() => {
                      setGeneratedData(null);
                      setFeeling('');
                      setSaveSuccess(false);
                    }}
                    className="w-full py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    Start Over
                  </button>
                </div>
              ) : loading ? (
                /* Pulsing loader screen */
                <div className="h-60 flex flex-col items-center justify-center gap-4 text-center animate-in fade-in duration-300">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border border-teal-500/20 absolute -inset-2 animate-ping duration-1000" />
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                      <Sparkles size={20} className="text-white animate-spin duration-3000" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold tracking-wide text-teal-400 font-serif">Weaving Peace</h4>
                    <p className="text-xs text-white/40 max-w-[200px]">Connecting your feelings with supportive scripture...</p>
                  </div>
                </div>
              ) : (
                /* Input form */
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <p className="text-sm text-white/60 leading-relaxed">
                      Share how you are feeling, what concerns are on your heart, or what you are seeking guidance on.
                    </p>
                  </div>

                  <form onSubmit={handleGenerate} className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={feeling}
                        onChange={(e) => setFeeling(e.target.value)}
                        placeholder="I feel a bit anxious about work tomorrow..."
                        rows={4}
                        className="w-full bg-gray-900/60 border border-gray-900 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-white/20 leading-relaxed no-scrollbar text-white"
                      />
                    </div>

                    {/* Chips section */}
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Suggested Triggers</label>
                      <div className="flex flex-wrap gap-2">
                        {EMOTION_CHIPS.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFeeling(chip.text)}
                            className="py-1.5 px-3 rounded-full bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 active:scale-95 text-xs text-white/80 transition-all cursor-pointer"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!feeling.trim()}
                      className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white rounded-full font-semibold text-xs tracking-wider uppercase shadow-lg shadow-teal-500/10 active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                    >
                      <Sparkles size={14} />
                      Generate Custom Prayer
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* Journal tab view */
            <div className="space-y-4">
              {!user || journalError === 'auth' ? (
                /* ── Not signed in / session expired ── */
                <div className="h-60 flex flex-col items-center justify-center gap-4 text-center p-6 bg-white/5 rounded-2xl border border-white/10 animate-in fade-in duration-300">
                  <Bookmark size={40} className="text-teal-400 opacity-60" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm font-serif">Spiritual Journal</h4>
                    <p className="text-xs text-white/40 max-w-[240px]">
                      {journalError === 'auth' && user
                        ? 'Your session has expired. Sign in again to access your journal.'
                        : 'Create an account to securely save and browse your personal reflection log.'}
                    </p>
                  </div>
                  <button
                    onClick={() => openAuthModal()}
                    className="py-2.5 px-6 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold text-xs uppercase tracking-wider shadow-lg shadow-teal-500/10 active:scale-95 transition-all cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              ) : journalError === 'error' ? (
                /* ── Generic fetch error ── */
                <div className="h-48 flex flex-col items-center justify-center gap-3 text-center p-6 bg-red-950/20 rounded-2xl border border-red-500/15 animate-in fade-in duration-300">
                  <p className="text-xs font-semibold text-red-300">Could not load your journal</p>
                  <p className="text-[10px] text-white/30 max-w-[220px]">Check your connection and try again.</p>
                  <button
                    onClick={fetchJournal}
                    className="py-2 px-5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/60 hover:text-white transition-all cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : journalLoading ? (
                <div className="flex justify-center p-8">
                  <span className="text-xs text-white/40 animate-pulse">Loading journal...</span>
                </div>
              ) : journal.length === 0 ? (
                <div className="text-center text-white/40 mt-12 py-10 font-medium text-sm">
                  Your spiritual journal is empty. Generate a prayer to begin!
                </div>
              ) : (
                /* Journal entries list */
                <div className="space-y-4 animate-in fade-in duration-300">
                  {journal.map((entry) => {
                    const parsedVerses = entry.verses 
                      ? entry.verses.split(';').map(v => {
                          const [ref, txt] = v.split('|');
                          return { reference: ref, text: txt };
                        })
                      : [];

                    return (
                      <div 
                        key={entry.id}
                        className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative group transition-all duration-300 hover:bg-white/10"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] text-teal-400 uppercase tracking-widest font-bold font-mono">
                            {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="text-xs text-white/30 truncate max-w-[200px]">Feeling: {entry.feeling}</span>
                        </div>
                        
                        <p className="text-xs leading-relaxed italic text-white/80 font-serif mb-4 border-l-2 border-teal-500/40 pl-3">
                          "{entry.prayer}"
                        </p>

                        {parsedVerses.length > 0 && (
                          <div className="space-y-2 pt-3 border-t border-white/5">
                            <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Reflected on</span>
                            <div className="flex flex-wrap gap-2">
                              {parsedVerses.map((v, i) => (
                                <span key={i} className="text-[10px] font-semibold text-teal-400/90 font-serif bg-teal-500/5 border border-teal-500/10 px-2 py-0.5 rounded-md">
                                  {v.reference}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
