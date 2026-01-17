import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './ui/Button';
import { Heading, Text, Label } from './ui/Text';

// ==========================================
// WorkoutScreen - Main workout logging UI
// Features "Large UI" for easy touch targets
// ==========================================

export const WorkoutScreen: React.FC = () => {
  const [weight, setWeight] = useState(34.0);
  const [reps, setReps] = useState(12);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Rest Timer Card */}
      <GlassCard glow className="p-5 flex items-center justify-between border-primary/20">
        <div className="flex flex-col">
          <Label className="text-primary">Rest Timer</Label>
          <div className="flex items-baseline gap-1 mt-1">
            <Text variant="display" className="dark:text-white">01</Text>
            <span className="text-xl text-primary/50 font-bold">:</span>
            <Text variant="display" accent>28</Text>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="md">
            <span className="material-symbols-outlined">replay_5</span>
          </Button>
          <Button variant="primary" size="md" glow>
            <span className="material-symbols-outlined font-bold">forward_10</span>
          </Button>
        </div>
      </GlassCard>

      {/* Exercise Info */}
      <div className="flex items-end justify-between px-2">
        <div>
          <Heading level={2}>Incline Dumbbell Press</Heading>
          <div className="flex items-center gap-2 mt-1">
            <span className="material-symbols-outlined text-sm text-slate-400 dark:text-white/50">history</span>
            <Text variant="body-sm" muted>Last: 32kg x 10</Text>
          </div>
        </div>
        <Button variant="icon" size="sm">
          <span className="material-symbols-outlined text-primary">info</span>
        </Button>
      </div>

      {/* Main Logging Card */}
      <GlassCard accent="primary" className="p-8 relative overflow-hidden">
        <div className="flex justify-between items-center mb-10">
          <div className="flex flex-col">
            <Text variant="body-sm" accent uppercase className="tracking-widest">Set 3 of 4</Text>
            <Text variant="caption" muted className="mt-1 italic normal-case">Hypertrophy Zone</Text>
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
          {/* Weight Input */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <Label>Weight (kg)</Label>
              <Text variant="display" className="dark:text-white">{weight.toFixed(1)}</Text>
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

          {/* Reps Input */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <Label>Repetitions</Label>
              <Text variant="display" className="dark:text-white">{reps}</Text>
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

        {/* Log Set Button */}
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
          <Label>Up Next</Label>
          <Heading level={3} className="mt-1">Lateral Raises</Heading>
        </div>
        <span className="material-symbols-outlined text-slate-300 dark:text-white/30">drag_handle</span>
      </GlassCard>

      {/* Add Set Button */}
      <button className="w-full mt-2 py-5 border-2 border-dashed border-slate-300 dark:border-white/10 rounded-2xl text-slate-400 dark:text-white/30 font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:bg-white/5 transition-colors">
        <span className="material-symbols-outlined">add</span>
        Add Set
      </button>
    </div>
  );
};
