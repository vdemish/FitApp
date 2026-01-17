
import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { EXERCISES } from '../constants';

export const LibraryScreen: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders'];

  const filteredExercises = filter === 'All' 
    ? EXERCISES 
    : EXERCISES.filter(e => e.category === filter);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-2">
        <h1 className="text-3xl font-bold tracking-tight dark:text-white">Exercise <span className="text-primary">Library</span></h1>
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary">add</span>
        </div>
      </div>

      <div className="relative group px-1">
        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
        <input 
          className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 dark:text-white"
          placeholder="Search exercises..."
          type="text"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-2 px-2">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              filter === cat 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/60 border border-slate-200 dark:border-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 font-bold px-2 mb-4">Commonly Used</p>
          <div className="space-y-4">
            {filteredExercises.slice(0, 2).map(ex => (
              <GlassCard key={ex.id} className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary">{ex.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold dark:text-white">{ex.name}</h3>
                  <p className="text-sm text-slate-400 dark:text-white/40">{ex.category} • {ex.type}</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-white/20">chevron_right</span>
              </GlassCard>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-white/40 font-bold px-2 mb-4">A-Z</p>
          <div className="space-y-4">
            {filteredExercises.map(ex => (
              <GlassCard key={`az-${ex.id}`} className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-white/60">{ex.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold dark:text-white">{ex.name}</h3>
                  <p className="text-sm text-slate-400 dark:text-white/40">{ex.category} • {ex.type}</p>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-white/20">chevron_right</span>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
