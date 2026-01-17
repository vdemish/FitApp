
import React from 'react';
import { GlassCard } from './GlassCard';

export const ProfileScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <GlassCard className="p-6 border-primary/20 neo-glow-primary relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div 
              className="w-20 h-20 rounded-2xl bg-center bg-cover border-2 border-primary/50" 
              style={{ backgroundImage: `url('https://picsum.photos/200')` }}
            ></div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full border-2 border-background-light dark:border-[#090b1b] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-[14px] text-white dark:text-background-dark font-bold">edit</span>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight dark:text-white">Alex Rivera</h1>
            <span className="text-primary/70 text-sm font-medium uppercase tracking-widest">Premium Member</span>
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-white/5">
          <div className="text-center px-2">
            <p className="text-2xl font-bold dark:text-white">142</p>
            <p className="text-[10px] uppercase tracking-tighter text-slate-400 dark:text-white/40 font-bold">Workouts</p>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-white/5"></div>
          <div className="text-center px-2">
            <p className="text-2xl font-bold text-primary">84.5</p>
            <p className="text-[10px] uppercase tracking-tighter text-slate-400 dark:text-white/40 font-bold">Weight (kg)</p>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-white/5"></div>
          <div className="text-center px-2">
            <p className="text-2xl font-bold dark:text-white">12</p>
            <p className="text-[10px] uppercase tracking-tighter text-slate-400 dark:text-white/40 font-bold">Week Streak</p>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-6">
        <section>
          <h2 className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-[0.2em] mb-3 ml-2">Account Settings</h2>
          <GlassCard className="overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
            {[
              { icon: 'person', label: 'Personal Information' },
              { icon: 'analytics', label: 'Training Metrics' },
              { icon: 'notifications', label: 'Reminders & Notifications' },
            ].map((item) => (
              <button key={item.label} className="w-full flex items-center justify-between p-5 active:bg-slate-50 dark:active:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  <span className="font-medium dark:text-white">{item.label}</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-white/20">chevron_right</span>
              </button>
            ))}
          </GlassCard>
        </section>

        <section>
          <h2 className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-[0.2em] mb-3 ml-2">App Preferences</h2>
          <GlassCard className="overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
            <div className="w-full flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">timer</span>
                <span className="font-medium dark:text-white">Rest Timer Sounds</span>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white dark:bg-background-dark rounded-full absolute right-1"></div>
              </div>
            </div>
            <button className="w-full flex items-center justify-between p-5 active:bg-slate-50 dark:active:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">scale</span>
                <span className="font-medium dark:text-white">Units (kg, cm)</span>
              </div>
              <span className="text-sm text-primary/60 font-bold">Metric</span>
            </button>
          </GlassCard>
        </section>

        <div className="text-center pt-4 pb-8">
          <p className="text-slate-400 dark:text-white/20 text-xs font-bold uppercase tracking-widest">Version 2.4.0 (Build 982)</p>
        </div>
      </div>
    </div>
  );
};
