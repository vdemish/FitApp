import React, { useState, useEffect } from 'react';
import { Tab } from './types';
import { useAuth } from './auth/AuthContext';
import { WorkoutScreen } from './components/WorkoutScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { LoginScreen } from './components/LoginScreen';
import { Button } from './components/ui/Button';

// ==========================================
// App - Main application shell
// Features: Tab navigation, Dark/Light mode, Auth guard
// ==========================================

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('workout');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // --------------------------------------------------------------------------
  // Аутентификация
  // --------------------------------------------------------------------------
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --------------------------------------------------------------------------
  // Состояние загрузки при проверке авторизации
  // --------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 animate-pulse">
            <span className="material-symbols-outlined text-4xl text-white dark:text-background-dark font-bold">
              fitness_center
            </span>
          </div>
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">
            progress_activity
          </span>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Показать экран входа если пользователь не авторизован
  // --------------------------------------------------------------------------
  if (!user) {
    return <LoginScreen />;
  }

  // --------------------------------------------------------------------------
  // Обработчик выхода
  // --------------------------------------------------------------------------
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'workout': return <WorkoutScreen />;
      case 'library': return <LibraryScreen />;
      case 'history': return <HistoryScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <WorkoutScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex justify-center selection:bg-primary selection:text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 dark:bg-primary/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-purple/20 dark:bg-accent-purple/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-lg flex flex-col min-h-screen relative">
        {/* Header Navigation */}
        <header className="flex-none px-4 pt-8 pb-4 sticky top-0 z-40 bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white dark:text-background-dark shadow-lg shadow-primary/20 cursor-pointer active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[24px] font-bold">
                  {isDarkMode ? 'bolt' : 'light_mode'}
                </span>
              </button>
              <div>
                <h1 className="text-xl font-bold tracking-tight dark:text-white leading-none">
                  {activeTab === 'workout' ? 'Push Day B' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {activeTab === 'workout' ? '00:45:12 ACTIVE' : 'Status: Connected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Кнопка меню с выходом */}
            <div className="flex gap-2">
              <Button
                variant="icon"
                size="sm"
                className="liquid-glass"
                onClick={handleSignOut}
                title="Выйти"
              >
                <span className="material-symbols-outlined">logout</span>
              </Button>
              <Button variant="icon" size="sm" className="liquid-glass">
                <span className="material-symbols-outlined">more_horiz</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 px-4 py-4 pb-48 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </main>

        {/* Floating Action Bar (Workout only) */}
        {activeTab === 'workout' && (
          <div className="fixed bottom-32 left-0 right-0 z-50 px-4 pointer-events-none">
            <div className="max-w-lg mx-auto pointer-events-auto">
              <div className="p-4 pt-2 pb-2 liquid-glass border border-slate-200/50 dark:border-white/10 rounded-3xl flex gap-4 shadow-2xl">
                <Button variant="secondary" size="lg">
                  <span className="material-symbols-outlined text-2xl">swap_horiz</span>
                </Button>
                <button className="flex-1 h-16 bg-primary rounded-2xl flex items-center justify-center gap-3 text-white dark:text-background-dark font-black text-lg uppercase tracking-tight shadow-xl shadow-primary/30 active:scale-[0.98] transition-transform">
                  Finish Workout
                  <span className="material-symbols-outlined font-bold">flag</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 pb-8 pt-4 bg-white/80 dark:bg-[#101423]/90 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 px-6 flex items-center justify-between">
          <NavItem
            active={activeTab === 'workout'}
            onClick={() => setActiveTab('workout')}
            icon="exercise"
            label="Workout"
          />
          <NavItem
            active={activeTab === 'library'}
            onClick={() => setActiveTab('library')}
            icon="menu_book"
            label="Library"
          />
          <NavItem
            active={activeTab === 'history'}
            onClick={() => setActiveTab('history')}
            icon="leaderboard"
            label="History"
          />
          <NavItem
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            icon="person"
            label="Profile"
          />
        </nav>
      </div>
    </div>
  );
};

// ==========================================
// NavItem - Bottom navigation tab component
// ==========================================
interface NavItemProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60'
      }`}
  >
    <div className="relative">
      <span className={`material-symbols-outlined text-[30px] ${active ? 'fill-[1]' : ''}`}>
        {icon}
      </span>
      {active && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse neo-glow"></div>}
    </div>
    <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
