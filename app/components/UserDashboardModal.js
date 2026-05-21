'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X, Flame, Heart, BookOpen, Sparkles, Clock, BarChart3,
  Copy, Share2, Award, Calendar, CheckCircle2, MessageSquare,
  LogOut, ChevronDown,
} from 'lucide-react';
import versesData from '../../data/verses.json';
import { useAuth } from '../context/AuthContext';

// ─── Emotion colour map ───────────────────────────────────────────────────────
function getEmotionColors(feel) {
  const map = {
    anxiety:    { text: 'text-blue-300',    bg: 'bg-blue-500/15',    bar: 'from-blue-500 to-indigo-400'   },
    gratitude:  { text: 'text-emerald-300', bg: 'bg-emerald-500/15', bar: 'from-emerald-500 to-teal-400'  },
    loneliness: { text: 'text-violet-300',  bg: 'bg-violet-500/15',  bar: 'from-violet-500 to-purple-400' },
    grief:      { text: 'text-rose-300',    bg: 'bg-rose-500/15',    bar: 'from-rose-500 to-pink-400'     },
    weariness:  { text: 'text-amber-300',   bg: 'bg-amber-500/15',   bar: 'from-amber-500 to-orange-400'  },
    wisdom:     { text: 'text-cyan-300',    bg: 'bg-cyan-500/15',    bar: 'from-cyan-500 to-sky-400'      },
  };
  return map[feel?.toLowerCase()] || { text: 'text-indigo-300', bg: 'bg-indigo-500/15', bar: 'from-indigo-500 to-blue-400' };
}

// ─── TAB 1: Stats ─────────────────────────────────────────────────────────────
function StatsTab({ streakCount, weeklyDates, weeklyCompletions, totalPrayersSaved, totalLikedVerses, moodStats, prefersVideo, toggleVideoPreference }) {
  const daysOfWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const todayIndex = new Date().getDay();

  return (
    <div className="space-y-4">
      {/* Streak + Milestones row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-orange-500/15 via-amber-500/8 to-slate-800/60 border border-orange-400/25 rounded-2xl p-4 relative overflow-hidden group hover:border-orange-400/40 transition-all duration-300">
          <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
            <Flame size={72} className="fill-orange-400" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-orange-300 flex items-center gap-1.5 mb-1">
            <Flame size={11} className="fill-orange-300" /> Streak
          </span>
          <h3 className="text-4xl font-black text-white tracking-tight flex items-baseline gap-2">
            {streakCount}
            <span className="text-[10px] font-bold text-orange-200 uppercase tracking-widest bg-orange-500/20 px-2 py-0.5 rounded-full border border-orange-400/30">Days</span>
          </h3>
          {/* Weekly ring */}
          <div className="mt-4">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
              <Calendar size={10} /> This Week
            </p>
            <div className="flex justify-between gap-1">
              {daysOfWeek.map((day, idx) => {
                const isToday = idx === todayIndex;
                const done = weeklyDates[idx] ? weeklyCompletions[weeklyDates[idx]] === true : false;
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 flex-1">
                    <span className={`text-[8px] font-bold ${isToday ? 'text-orange-300' : 'text-slate-600'}`}>{day[0]}</span>
                    <div className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all duration-300 ${
                      done ? 'bg-orange-500/25 border border-orange-400/50 shadow-[0_0_8px_rgba(251,146,60,0.2)]'
                           : 'bg-white/[0.04] border border-white/8'
                    }`}>
                      {done
                        ? <Flame size={11} className="text-orange-300 fill-orange-400/40" />
                        : <span className="text-slate-700 text-[10px]">·</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-purple-500/10 via-indigo-500/8 to-slate-800/60 border border-purple-400/25 rounded-2xl p-4 relative overflow-hidden group hover:border-purple-400/40 transition-all duration-300">
          <div className="absolute right-2 top-2 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none">
            <Award size={72} className="text-purple-300" />
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-purple-300 flex items-center gap-1.5 mb-3">
            <Award size={11} /> Milestones
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/[0.06] border border-white/10 p-3 rounded-xl">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Prayers</span>
              <p className="text-2xl font-black text-white mt-0.5">{totalPrayersSaved}</p>
            </div>
            <div className="bg-white/[0.06] border border-white/10 p-3 rounded-xl">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Saved</span>
              <p className="text-2xl font-black text-white mt-0.5">{totalLikedVerses}</p>
            </div>
            <div className="bg-white/[0.06] border border-white/10 p-2.5 rounded-xl col-span-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-white">
                {streakCount >= 7 ? '🌟 Spiritual Devotee' : streakCount >= 3 ? '🔥 Faithful Tracker' : '🌱 Mindful Starter'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Video toggle */}
      <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles size={12} className="text-purple-300 shrink-0" /> Cinematic Backgrounds
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">Premium looping drone videos vs. static images.</p>
        </div>
        <button onClick={toggleVideoPreference}
          className={`w-12 h-6 rounded-full relative transition-colors duration-300 shrink-0 ${prefersVideo ? 'bg-purple-500' : 'bg-slate-600'}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm ${prefersVideo ? 'left-7' : 'left-1'}`} />
        </button>
      </div>

      {/* Mood analytics */}
      <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4">
        <h4 className="text-[10px] uppercase font-bold tracking-widest text-purple-300 mb-4 flex items-center gap-1.5">
          <BarChart3 size={12} /> Emotional Analytics
        </h4>
        {totalPrayersSaved === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs font-medium text-slate-300">No insights yet.</p>
            <p className="text-[10px] text-slate-500 mt-1">Save prayers with the AI Companion to begin.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(moodStats).map(([feeling, count]) => {
              const pct = Math.round((count / totalPrayersSaved) * 100);
              const theme = getEmotionColors(feeling);
              return (
                <div key={feeling} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className={`capitalize px-2 py-0.5 rounded-lg ${theme.bg} ${theme.text} text-[10px] font-bold tracking-wide`}>{feeling}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{count} · <span className="font-bold text-white">{pct}%</span></span>
                  </div>
                  <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                    <div className={`bg-gradient-to-r ${theme.bar} h-full rounded-full transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB 2: Saved Verses ──────────────────────────────────────────────────────
function VersesTab({ likedVerses, onClose, onOpenShareCard }) {
  if (likedVerses.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
        <Heart size={40} className="mx-auto mb-3 text-slate-500" />
        <p className="text-xs font-semibold text-slate-300">Your scripture library is empty</p>
        <p className="text-[10px] text-slate-500 mt-1.5 max-w-[240px] mx-auto leading-relaxed">
          Tap the heart on any verse card to bookmark it here.
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {likedVerses.map(verse => (
        <div key={verse.id} className="bg-white/[0.06] border border-white/12 p-4 rounded-2xl flex flex-col gap-3 hover:bg-white/[0.09] hover:border-white/20 transition-all duration-300 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
          <div className="relative">
            <span className="text-4xl text-white/6 font-serif absolute -top-3 -left-1 select-none leading-none">"</span>
            <p className="text-xs text-slate-200 italic font-serif leading-relaxed pt-2 pl-2">{verse.text}</p>
            <p className="text-[10px] font-black text-purple-300 tracking-widest uppercase mt-2 pl-2">
              — {verse.reference}
              <span className="text-[9px] text-slate-500 font-normal normal-case tracking-normal ml-1">({verse.translation})</span>
            </p>
          </div>
          <button
            onClick={() => { onClose(); setTimeout(() => onOpenShareCard(verse), 300); }}
            className="mt-auto w-full py-2 bg-purple-500/15 hover:bg-purple-500/25 active:scale-95 text-[10px] font-bold text-purple-200 hover:text-white rounded-xl border border-purple-400/25 hover:border-purple-400/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Share2 size={11} /> Design & Share
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── TAB 3: Journal ───────────────────────────────────────────────────────────
function JournalTab({ journalEntries, loadingEntries, editingEntryId, setEditingEntryId, updateText, setUpdateText, savingUpdate, handleUpdateEntry, isCreatingEntry, setIsCreatingEntry, newFeeling, setNewFeeling, newPrayerText, setNewPrayerText, savingNewEntry, handleCreateDirectEntry }) {
  return (
    <div className="space-y-4">
      {/* New entry composer */}
      {!loadingEntries && (
        !isCreatingEntry ? (
          <button onClick={() => setIsCreatingEntry(true)}
            className="w-full py-3 rounded-2xl border border-dashed border-white/15 hover:border-purple-400/50 bg-white/[0.03] hover:bg-purple-500/8 text-slate-400 hover:text-purple-200 transition-all flex items-center justify-center gap-2 font-semibold text-xs tracking-wider uppercase cursor-pointer">
            <MessageSquare size={14} /> + New Journal Entry
          </button>
        ) : (
          <div className="bg-slate-800/80 border border-purple-400/30 rounded-2xl p-4 shadow-[0_0_24px_rgba(168,85,247,0.12)] animate-in fade-in slide-in-from-top-2 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none" />
            <div className="flex justify-between items-center mb-3 relative z-10">
              <span className="text-[10px] font-extrabold text-purple-300 tracking-widest uppercase flex items-center gap-1.5">
                <BookOpen size={11} /> Write Reflection
              </span>
              <button onClick={() => setIsCreatingEntry(false)} className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"><X size={13} /></button>
            </div>
            <div className="space-y-3 relative z-10">
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">How are you feeling?</label>
                <input type="text" value={newFeeling} onChange={e => setNewFeeling(e.target.value)} placeholder="e.g. Grateful, Anxious, Peaceful..."
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/25 focus:outline-none focus:border-purple-400/50 transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Your Prayer or Reflection</label>
                <textarea value={newPrayerText} onChange={e => setNewPrayerText(e.target.value)} placeholder="Pour out your heart here..."
                  className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/25 focus:outline-none focus:border-purple-400/50 resize-none h-20 leading-relaxed transition-colors" />
              </div>
              <div className="flex justify-end">
                <button onClick={handleCreateDirectEntry} disabled={savingNewEntry || !newFeeling.trim() || !newPrayerText.trim()}
                  className="bg-purple-500 hover:bg-purple-400 disabled:opacity-40 text-white font-bold text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 transition-all cursor-pointer">
                  {savingNewEntry ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {loadingEntries ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-400 animate-pulse">Synchronizing journal...</span>
        </div>
      ) : journalEntries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
          <BookOpen size={38} className="mx-auto mb-3 text-slate-500" />
          <p className="text-xs font-semibold text-slate-300">Your journal is empty</p>
          <p className="text-[10px] text-slate-500 mt-1.5 max-w-[240px] mx-auto leading-relaxed">
            Use the AI Companion to generate a prayer, then save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative pl-4 border-l border-white/10 ml-2">
          {journalEntries.map(entry => (
            <div key={entry.id} className="bg-white/[0.06] border border-white/12 p-4 rounded-2xl space-y-3 relative group transition-all duration-300 hover:bg-white/[0.09] hover:border-white/20 shadow-md">
              <div className="absolute -left-[23px] top-6 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.7)] group-hover:scale-125 transition-transform" />
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold tracking-widest uppercase bg-purple-500/20 border border-purple-400/30 text-purple-200">{entry.feeling}</span>
                  <span className="text-[9px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock size={9} />
                    {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <button onClick={() => navigator.clipboard.writeText(entry.prayer)}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-purple-500/15 border border-white/8 hover:border-purple-400/30 text-slate-400 hover:text-purple-200 transition-all cursor-pointer active:scale-90">
                  <Copy size={11} />
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic font-serif">"{entry.prayer}"</p>
              {entry.verses && (
                <div className="flex flex-wrap gap-1.5 items-center bg-white/[0.04] border border-white/8 px-3 py-2 rounded-xl">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Verses:</span>
                  {entry.verses.split(',').map((v, i) => (
                    <span key={i} className="text-[9px] bg-purple-500/10 text-purple-200 border border-purple-400/20 px-1.5 py-0.5 rounded-md font-mono">{v.trim()}</span>
                  ))}
                </div>
              )}
              {entry.isAnswered && editingEntryId !== entry.id && (
                <div className="bg-emerald-500/10 border border-emerald-400/25 rounded-xl p-3 space-y-1.5 group/answer">
                  <div className="flex justify-between items-center">
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold tracking-widest text-emerald-300 uppercase">
                      <CheckCircle2 size={11} className="animate-pulse" /> Answered
                    </span>
                    <button onClick={() => { setEditingEntryId(entry.id); setUpdateText(entry.answerUpdate || ''); }}
                      className="opacity-0 group-hover/answer:opacity-100 text-[10px] text-slate-400 hover:text-white transition-all underline cursor-pointer">Edit</button>
                  </div>
                  {entry.answerUpdate
                    ? <p className="text-xs text-emerald-200/85 leading-relaxed">{entry.answerUpdate}</p>
                    : <p className="text-xs text-slate-500 italic">No description yet.</p>}
                </div>
              )}
              {!entry.isAnswered && editingEntryId !== entry.id && (
                <div className="flex justify-end">
                  <button onClick={() => { setEditingEntryId(entry.id); setUpdateText(''); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/20 hover:border-purple-400/40 text-[10px] font-bold text-purple-200 hover:text-white transition-all cursor-pointer active:scale-95">
                    <CheckCircle2 size={11} /> Mark as Answered
                  </button>
                </div>
              )}
              {editingEntryId === entry.id && (
                <div className="space-y-3 pt-3 border-t border-white/10 animate-in slide-in-from-top-1 duration-200">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold text-purple-300 uppercase tracking-widest">How was this answered?</label>
                    {entry.isAnswered && (
                      <button onClick={() => handleUpdateEntry(entry.id, false, null)}
                        className="text-[9px] text-rose-400 hover:text-rose-300 transition-colors uppercase font-bold tracking-wider cursor-pointer">Unmark</button>
                    )}
                  </div>
                  <textarea value={updateText} onChange={e => setUpdateText(e.target.value)} placeholder="Describe the outcome or your gratitude..."
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/25 focus:outline-none focus:border-purple-400/50 resize-none h-20 leading-relaxed" />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setEditingEntryId(null); setUpdateText(''); }}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer">Cancel</button>
                    <button onClick={() => handleUpdateEntry(entry.id, true, updateText)} disabled={savingUpdate}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-lg shadow-md shadow-emerald-500/20 transition-all cursor-pointer">
                      {savingUpdate ? 'Saving...' : 'Save Testimony'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function UserDashboardModal({ isOpen, onClose, onOpenShareCard }) {
  const { user, logout, prefersVideo, toggleVideoPreference } = useAuth();
  const [activeTab, setActiveTab]           = useState('stats');
  const [likedVerses, setLikedVerses]       = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [streakCount, setStreakCount]       = useState(0);
  const [moodStats, setMoodStats]           = useState({});
  const [weeklyDates, setWeeklyDates]       = useState([]);
  const [weeklyCompletions, setWeeklyCompletions] = useState({});
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [updateText, setUpdateText]         = useState('');
  const [savingUpdate, setSavingUpdate]     = useState(false);
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [newFeeling, setNewFeeling]         = useState('');
  const [newPrayerText, setNewPrayerText]   = useState('');
  const [savingNewEntry, setSavingNewEntry] = useState(false);
  // Mobile sheet drag state
  const [sheetSnap, setSheetSnap]           = useState('full'); // 'full' | 'peek'
  const dragStartY  = useRef(null);
  const dragDeltaY  = useRef(0);
  const sheetRef    = useRef(null);

  const handleUpdateEntry = (entryId, isAnswered, answerText) => {
    setSavingUpdate(true);
    fetch('/api/journal', { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, isAnswered, answerUpdate: answerText }) })
      .then(r => r.json())
      .then(data => {
        if (data.success) { setJournalEntries(prev => prev.map(e => e.id === entryId ? data.entry : e)); setEditingEntryId(null); setUpdateText(''); }
        else alert(data.error || 'Failed to save.');
        setSavingUpdate(false);
      }).catch(err => { console.error(err); setSavingUpdate(false); });
  };

  const handleCreateDirectEntry = () => {
    if (!newFeeling.trim() || !newPrayerText.trim()) return;
    setSavingNewEntry(true);
    fetch('/api/journal', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feeling: newFeeling, prayer: newPrayerText, verses: '' }) })
      .then(r => r.json())
      .then(data => {
        if (data.success) { setJournalEntries(prev => [data.entry, ...prev]); setIsCreatingEntry(false); setNewFeeling(''); setNewPrayerText(''); }
        else alert(data.error || 'Failed to create.');
        setSavingNewEntry(false);
      }).catch(err => { console.error(err); setSavingNewEntry(false); });
  };

  useEffect(() => {
    if (!isOpen) return;
    setSheetSnap('full');
    const streakData = localStorage.getItem('verse_streak');
    if (streakData) setStreakCount(JSON.parse(streakData).count || 0);
    const dates = [];
    const today = new Date(); const dow = today.getDay();
    for (let i = 0; i < 7; i++) { const d = new Date(today); d.setDate(today.getDate() - dow + i); dates.push(d.toISOString().split('T')[0]); }
    setWeeklyDates(dates);
    const completions = {};
    dates.forEach(d => { completions[d] = localStorage.getItem('votd_completed_' + d) === 'true'; });
    setWeeklyCompletions(completions);
    const savedIds = JSON.parse(localStorage.getItem('savedVerses') || '[]');
    setLikedVerses(versesData.filter(v => savedIds.includes(v.id)));
    setLoadingEntries(true);
    fetch('/api/journal').then(r => r.json()).then(data => {
      const entries = data.journal || [];
      setJournalEntries(entries);
      const counts = {};
      entries.forEach(e => { const f = e.feeling || 'Unknown'; counts[f] = (counts[f] || 0) + 1; });
      setMoodStats(counts);
      setLoadingEntries(false);
    }).catch(err => { console.error(err); setLoadingEntries(false); });
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPrayersSaved = journalEntries.length;
  const totalLikedVerses  = likedVerses.length;

  // Shared tab content props
  const tabProps = {
    streakCount, weeklyDates, weeklyCompletions, totalPrayersSaved, totalLikedVerses,
    moodStats, prefersVideo, toggleVideoPreference,
    likedVerses, onClose, onOpenShareCard,
    journalEntries, loadingEntries, editingEntryId, setEditingEntryId,
    updateText, setUpdateText, savingUpdate, handleUpdateEntry,
    isCreatingEntry, setIsCreatingEntry, newFeeling, setNewFeeling,
    newPrayerText, setNewPrayerText, savingNewEntry, handleCreateDirectEntry,
  };

  const TABS = [
    { id: 'stats',   label: 'Stats',   icon: <BarChart3 size={18} /> },
    { id: 'verses',  label: 'Saved',   icon: <Heart size={18} /> },
    { id: 'journal', label: 'Journal', icon: <BookOpen size={18} /> },
  ];

  const renderTabContent = () => {
    if (activeTab === 'stats')   return <StatsTab {...tabProps} />;
    if (activeTab === 'verses')  return <VersesTab {...tabProps} />;
    if (activeTab === 'journal') return <JournalTab {...tabProps} />;
  };

  // ── Touch drag handlers for mobile sheet ──────────────────────────────────
  const onDragStart = (e) => {
    dragStartY.current = e.touches ? e.touches[0].clientY : e.clientY;
    dragDeltaY.current = 0;
  };
  const onDragMove = (e) => {
    if (dragStartY.current === null) return;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    dragDeltaY.current = y - dragStartY.current;
    if (sheetRef.current) {
      const clampedDelta = Math.max(0, dragDeltaY.current);
      sheetRef.current.style.transform = `translateY(${clampedDelta}px)`;
    }
  };
  const onDragEnd = () => {
    if (dragStartY.current === null) return;
    dragStartY.current = null;
    if (sheetRef.current) sheetRef.current.style.transform = '';
    if (dragDeltaY.current > 120) onClose();
    dragDeltaY.current = 0;
  };

  const desktopTabCls = (id) =>
    `flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
      activeTab === id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
    }`;

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════
          MOBILE  — bottom sheet (< md breakpoint)
          ════════════════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
        {/* Scrim */}
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />

        {/* Sheet */}
        <div
          ref={sheetRef}
          className="relative z-10 w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-t-[2rem] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-400 ease-out"
          style={{ height: '92dvh', maxHeight: '92dvh', transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)' }}
        >
          {/* Ambient glows */}
          <div className="absolute -top-24 -right-24 w-56 h-56 bg-purple-500/20 rounded-full blur-[70px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 bg-indigo-500/15 rounded-full blur-[70px] pointer-events-none" />

          {/* ── Drag handle + header ── */}
          <div
            className="relative z-10 pt-3 pb-2 px-5 cursor-grab active:cursor-grabbing touch-none select-none"
            onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
            onMouseDown={onDragStart}  onMouseMove={onDragMove}  onMouseUp={onDragEnd}
          >
            {/* Pill handle */}
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/30 text-purple-300">
                  <Sparkles size={16} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Spiritual Growth</h2>
                  {user && <p className="text-[10px] text-slate-400 mt-0.5">Welcome back, {user.name.split(' ')[0]}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user && (
                  <button onClick={async () => { await logout(); onClose(); }}
                    className="p-2 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer">
                    <LogOut size={14} />
                  </button>
                )}
                <button onClick={onClose}
                  className="p-2 rounded-full bg-white/8 hover:bg-white/15 text-slate-400 hover:text-white transition-all cursor-pointer">
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto px-4 pt-2 pb-24 no-scrollbar relative z-10">
            {renderTabContent()}
          </div>

          {/* ── Sticky bottom tab bar ── */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-4 pt-3 pb-safe-or-4"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
            <div className="flex gap-1">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300 cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white border border-white/15'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}>
                  <span className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : ''}`}>
                    {tab.icon}
                  </span>
                  <span className="text-[10px] font-bold tracking-wide">{tab.label}</span>
                  {tab.id === 'verses'  && totalLikedVerses  > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">{totalLikedVerses}</span>
                  )}
                  {tab.id === 'journal' && totalPrayersSaved > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">{totalPrayersSaved}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          DESKTOP  — centred modal (≥ md breakpoint)
          ════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
        <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-600/50 w-full max-w-2xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)] relative">
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-purple-500/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-indigo-500/15 rounded-full blur-[80px] pointer-events-none" />

          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/[0.03] relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/20 border border-purple-400/30 text-purple-300 shadow-lg shadow-purple-500/10">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Spiritual Growth</h2>
                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-0.5">Your mindfulness analytics & journal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user && (
                <button onClick={async () => { await logout(); onClose(); }}
                  className="px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 border border-red-500/25 transition-colors cursor-pointer">
                  <LogOut size={12} /> Sign Out
                </button>
              )}
              <button onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-transparent hover:border-white/15 active:scale-95">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex px-5 py-3 border-b border-white/10 bg-slate-900/60 gap-2 relative z-10">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={desktopTabCls(tab.id)}>
                {tab.icon} {tab.label}
                {tab.id === 'verses'  && totalLikedVerses  > 0 && <span className="ml-1 text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-bold">{totalLikedVerses}</span>}
                {tab.id === 'journal' && totalPrayersSaved > 0 && <span className="ml-1 text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-bold">{totalPrayersSaved}</span>}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 no-scrollbar relative z-10 bg-slate-900/40">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
