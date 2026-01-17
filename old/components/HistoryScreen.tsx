import React from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './ui/Button';
import { Heading, Text, Label } from './ui/Text';
import { RECENT_LOGS } from '../constants';

// ==========================================
// HistoryScreen - Workout history and analytics
// ==========================================

export const HistoryScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div>
          <Heading level={1}>History</Heading>
          <Text variant="body-sm" accent uppercase className="tracking-widest mt-1">Analytics Dashboard</Text>
        </div>
        <Button variant="secondary" size="md">
          <span className="material-symbols-outlined text-primary">calendar_month</span>
        </Button>
      </div>

      {/* Volume Chart Card */}
      <GlassCard glow className="p-6 border-t border-white/10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <Label>Total Volume (KG)</Label>
            <div className="flex items-baseline gap-2 mt-1">
              <Text variant="display" className="dark:text-white">142,500</Text>
              <span className="text-green-500 text-xs font-bold px-2 py-0.5 bg-green-500/10 rounded-full">+12%</span>
            </div>
          </div>
          <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Text variant="caption" accent className="normal-case">LAST 30 DAYS</Text>
          </div>
        </div>

        {/* Chart SVG */}
        <div className="h-32 w-full relative mt-4">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#00c3ff" stopOpacity="0.3"></stop>
                <stop offset="100%" stopColor="#00c3ff" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            <path d="M0 35 Q 10 32, 20 25 T 40 28 T 60 15 T 80 10 T 100 5 L 100 40 L 0 40 Z" fill="url(#chartGradient)"></path>
            <path className="stroke-primary" d="M0 35 Q 10 32, 20 25 T 40 28 T 60 15 T 80 10 T 100 5" fill="none" strokeWidth="2" strokeLinecap="round"></path>
            <circle cx="100" cy="5" r="2" fill="#00c3ff" className="neo-glow"></circle>
          </svg>
        </div>
        <div className="flex justify-between mt-4">
          <Label>Oct 01</Label>
          <Label>Oct 15</Label>
          <Label>Oct 31</Label>
        </div>
      </GlassCard>

      {/* Calendar Card */}
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Heading level={3}>October 2023</Heading>
          <div className="flex gap-4 text-slate-400">
            <span className="material-symbols-outlined text-sm cursor-pointer">chevron_left</span>
            <span className="material-symbols-outlined text-sm cursor-pointer">chevron_right</span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-y-4 text-center">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <Label key={`${day}-${i}`} className="block">{day}</Label>
          ))}
          <div className="text-sm text-slate-300 dark:text-white/20">28</div>
          <div className="text-sm text-slate-300 dark:text-white/20">29</div>
          <div className="text-sm text-slate-300 dark:text-white/20">30</div>
          <div className="relative flex items-center justify-center">
            <span className="text-sm font-bold dark:text-white">1</span>
            <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></div>
          </div>
          <div className="text-sm dark:text-white">2</div>
          <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 rounded-full bg-primary/20 border border-primary/40 -z-10"></div>
            <span className="text-sm font-bold text-primary">3</span>
            <div className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"></div>
          </div>
          <div className="text-sm dark:text-white">4</div>
        </div>
      </GlassCard>

      {/* Recent Logs */}
      <div className="space-y-4">
        <Label className="px-2">Recent Logs</Label>
        {RECENT_LOGS.map(log => (
          <GlassCard key={log.id} accent="primary" className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">{log.icon}</span>
              </div>
              <div>
                <Heading level={3} className="leading-none">{log.name}</Heading>
                <Label className="mt-1">
                  {log.date} • {log.duration} • {log.volume}
                </Label>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300 dark:text-white/20">chevron_right</span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
