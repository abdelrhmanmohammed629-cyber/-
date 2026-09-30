import React from 'react';
import { Plus, Moon, Sun, Bell, Volume2, Sliders } from 'lucide-react';

interface Props {
  activeTab: 'alarms' | 'schedule' | 'courses' | 'stats' | 'focus';
  setActiveTab: (tab: 'alarms' | 'schedule' | 'courses' | 'stats' | 'focus') => void;
  onOpenNewAlarm: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  alarmsCount: number;
}

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenNewAlarm,
  theme,
  onToggleTheme,
  alarmsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('alarms')}
          className="text-base sm:text-xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity"
        >
          StudyPulse · منظم الكورسات
        </button>

        {/* Zone 2: Clean navigation links */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveTab('alarms')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'alarms'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>المنبهات</span>
            <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {alarmsCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'schedule'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            الجدول الأسبوعي
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'courses'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            الكورسات
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            إحصائيات الإنجاز
          </button>

          <button
            onClick={() => setActiveTab('focus')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'focus'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            مؤقت التركيز
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Primary CTA: Add Alarm */}
          <button
            onClick={onOpenNewAlarm}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/20 transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>منبه جديد</span>
          </button>
        </div>
      </div>
    </header>
  );
};
