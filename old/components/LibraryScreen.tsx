import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Heading, Text, Label } from './ui/Text';
import { EXERCISES } from '../constants';

// ==========================================
// LibraryScreen - Exercise library with search
// ==========================================

export const LibraryScreen: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Chest', 'Back', 'Legs', 'Shoulders'];

  const filteredExercises = filter === 'All'
    ? EXERCISES
    : EXERCISES.filter(e => e.category === filter);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <Heading level={1}>
          Exercise <span className="text-primary">Library</span>
        </Heading>
        <Button variant="icon" size="sm" className="rounded-full bg-primary/10 border-primary/20">
          <span className="material-symbols-outlined text-primary">add</span>
        </Button>
      </div>

      {/* Search Input */}
      <div className="px-1">
        <Input
          icon="search"
          placeholder="Search exercises..."
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar -mx-2 px-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${filter === cat
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/60 border border-slate-200 dark:border-white/10'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div className="space-y-6">
        {/* Commonly Used Section */}
        <div>
          <Label className="px-2 mb-4 block">Commonly Used</Label>
          <div className="space-y-4">
            {filteredExercises.slice(0, 2).map(ex => (
              <GlassCard key={ex.id} className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-primary">{ex.icon}</span>
                </div>
                <div className="flex-1">
                  <Heading level={3}>{ex.name}</Heading>
                  <Text variant="body-sm" muted>{ex.category} • {ex.type}</Text>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-white/20">chevron_right</span>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* A-Z Section */}
        <div>
          <Label className="px-2 mb-4 block">A-Z</Label>
          <div className="space-y-4">
            {filteredExercises.map(ex => (
              <GlassCard key={`az-${ex.id}`} className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-white/60">{ex.icon}</span>
                </div>
                <div className="flex-1">
                  <Heading level={3}>{ex.name}</Heading>
                  <Text variant="body-sm" muted>{ex.category} • {ex.type}</Text>
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
