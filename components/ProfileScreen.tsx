import React from 'react';
import { GlassCard } from './GlassCard';
import { Heading, Text, Label } from './ui/Text';

// ==========================================
// ProfileScreen - User profile and settings
// ==========================================

export const ProfileScreen: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Profile Header Card */}
      <GlassCard glow className="p-6 border-primary/20 relative overflow-hidden">
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
            <Heading level={2}>Alex Rivera</Heading>
            <Text variant="body-sm" accent uppercase className="tracking-widest">Premium Member</Text>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-white/5">
          <div className="text-center px-2">
            <Text variant="display" className="dark:text-white text-2xl">142</Text>
            <Label className="block">Workouts</Label>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-white/5"></div>
          <div className="text-center px-2">
            <Text variant="display" accent className="text-2xl">84.5</Text>
            <Label className="block">Weight (kg)</Label>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-white/5"></div>
          <div className="text-center px-2">
            <Text variant="display" className="dark:text-white text-2xl">12</Text>
            <Label className="block">Week Streak</Label>
          </div>
        </div>
      </GlassCard>

      <div className="space-y-6">
        {/* Account Settings Section */}
        <section>
          <Label className="mb-3 ml-2 block">Account Settings</Label>
          <GlassCard className="overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
            {[
              { icon: 'person', label: 'Personal Information' },
              { icon: 'analytics', label: 'Training Metrics' },
              { icon: 'notifications', label: 'Reminders & Notifications' },
            ].map((item) => (
              <button key={item.label} className="w-full flex items-center justify-between p-5 active:bg-slate-50 dark:active:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary">{item.icon}</span>
                  <Text className="font-medium dark:text-white">{item.label}</Text>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-white/20">chevron_right</span>
              </button>
            ))}
          </GlassCard>
        </section>

        {/* App Preferences Section */}
        <section>
          <Label className="mb-3 ml-2 block">App Preferences</Label>
          <GlassCard className="overflow-hidden divide-y divide-slate-100 dark:divide-white/5">
            <div className="w-full flex items-center justify-between p-5">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">timer</span>
                <Text className="font-medium dark:text-white">Rest Timer Sounds</Text>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white dark:bg-background-dark rounded-full absolute right-1"></div>
              </div>
            </div>
            <button className="w-full flex items-center justify-between p-5 active:bg-slate-50 dark:active:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">scale</span>
                <Text className="font-medium dark:text-white">Units (kg, cm)</Text>
              </div>
              <Text variant="body-sm" accent className="font-bold">Metric</Text>
            </button>
          </GlassCard>
        </section>

        {/* Version Info */}
        <div className="text-center pt-4 pb-8">
          <Label>Version 2.4.0 (Build 982)</Label>
        </div>
      </div>
    </div>
  );
};
