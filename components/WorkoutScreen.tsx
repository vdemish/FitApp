
import React, { useState } from 'react';
import { GlassCard } from './GlassCard';

export const WorkoutScreen: React.FC = () => {
  const [weight, setWeight] = useState(34.0);
  const [reps, setReps] = useState(12);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Rest Timer Card */}
      <GlassCard className="p-5 flex items-center justify-between border-primary/20 neo-glow-primary">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary dark:text-primary font-bold">Rest Timer</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-bold tracking-tighter dark:text-white">01</span>
            <span className="text-xl text-primary/50 font-bold">:</span>
            <span className="text-4xl font-bold tracking-tighter text-primary">28</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-white">
            <span className="material-symbols-outlined">replay_5</span>
          </button>
          <button className="w-12 h-12 rounded-2xl bg-primary dark:bg-primary text-white dark:text-background-dark flex items-center justify-center neo-glow-primary">
            <span className="material-symbols-outlined font-bold">forward_10</span>
          </button>
        </div>
      </GlassCard>

      {/* Exercise Info */}
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight dark:text-white">Incline Dumbbell Press</h2>
          <div className="flex items-center gap-2 text-slate-400 dark:text-white/50 text-sm mt-1">
            <span className="material-symbols-outlined text-sm">history</span>
            <span>Last: 32kg x 10</span>
          </div>
        </div>
        <button className="text-primary text-sm font-bold w-10 h-10 flex items-center justify-center bg-slate-200 dark:bg-white/5 rounded-2xl">
          <span className="material-symbols-outlined">info</span>
        </button>
      </div>

      {/* Main Logging Card */}
      <GlassCard className="p-8 border-l-4 border-l-primary relative overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <div className="flex flex-col">
            <span className="text-primary font-bold text-sm tracking-widest uppercase">Set 3 of 4</span>
            <span className="text-slate-400 dark:text-white/40 text-xs mt-1 italic">Hypertrophy Zone</span>
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-background-light dark:border-[#1a1b3a] bg-emerald-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] text-emerald-500">check</span>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-background-light dark:border-[#1a1b3a] bg-emerald-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px] text-emerald-500">check</span>
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">3</span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-white/40 text-[10px] uppercase font-bold tracking-widest">Weight (kg)</span>
              <span className="text-5xl font-bold dark:text-white">{weight.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-[2rem] border border-slate-200 dark:border-white/5">
              <button 
                onClick={() => setWeight(prev => Math.max(0, prev - 1))}
                className="w-16 h-16 rounded-full flex items-center justify-center bg-white dark:bg-white/5 shadow-sm active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-3xl text-slate-400">remove</span>
              </button>
              <button 
                onClick={() => setWeight(prev => prev + 1)}
                className="w-16 h-16 rounded-full flex items-center justify-center bg-white dark:bg-white/5 shadow-sm border border-primary/30 active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-3xl text-primary">add</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-slate-400 dark:text-white/40 text-[10px] uppercase font-bold tracking-widest">Repetitions</span>
              <span className="text-5xl font-bold dark:text-white">{reps}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-[2rem] border border-slate-200 dark:border-white/5">
              <button 
                onClick={() => setReps(prev => Math.max(0, prev - 1))}
                className="w-16 h-16 rounded-full flex items-center justify-center bg-white dark:bg-white/5 shadow-sm active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-3xl text-slate-400">remove</span>
              </button>
              <button 
                onClick={() => setReps(prev => prev + 1)}
                className="w-16 h-16 rounded-full flex items-center justify-center bg-white dark:bg-white/5 shadow-sm border border-primary/30 active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-3xl text-primary">add</span>
              </button>
            </div>
          </div>
        </div>

        <button className="w-full mt-10 h-20 bg-primary/10 border-2 border-primary rounded-2xl flex items-center justify-center gap-3 active:bg-primary active:text-white dark:active:text-background-dark transition-all group neo-glow-primary">
          <span className="material-symbols-outlined text-4xl text-primary group-active:text-white dark:group-active:text-background-dark">done_all</span>
          <span className="text-xl font-bold text-primary group-active:text-white dark:group-active:text-background-dark uppercase tracking-widest">Log Set</span>
        </button>
      </GlassCard>

      {/* Up Next Preview */}
      <GlassCard className="flex items-center gap-4 px-5 py-5 opacity-60">
        <div className="bg-primary/10 rounded-2xl size-14 border border-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-3xl">fitness_center</span>
        </div>
        <div className="flex flex-col justify-center flex-1">
          <p className="text-slate-400 dark:text-white/60 text-xs font-bold uppercase tracking-wider">Up Next</p>
          <p className="text-slate-800 dark:text-white text-lg font-medium">Lateral Raises</p>
        </div>
        <span className="material-symbols-outlined text-slate-300 dark:text-white/30">drag_handle</span>
      </GlassCard>

      <button className="w-full mt-2 py-5 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl text-slate-400 dark:text-white/30 font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:bg-white/5 transition-colors">
        <span className="material-symbols-outlined">add</span>
        Add Set
      </button>
    </div>
  );
};
