import React, { useState, useEffect, useRef } from 'react';
import { Alarm, Course, TaskLog, AlarmPriority } from './types';
import { storage, AppSettings } from './utils/storage';
import { soundManager } from './utils/audioSynthesizer';
import { Header } from './components/Header';
import { ClockBanner } from './components/ClockBanner';
import { AlarmsListView } from './components/AlarmsListView';
import { CoursesView } from './components/CoursesView';
import { DailyStatsView } from './components/DailyStatsView';
import { FocusTimerView } from './components/FocusTimerView';
import { WeeklySchedulerView } from './components/WeeklySchedulerView';
import { AlarmFormModal } from './components/AlarmFormModal';
import { ActiveAlarmModal } from './components/ActiveAlarmModal';
import { CheckCircle2, Info, X } from 'lucide-react';

export default function App() {
  // Load state from local storage
  const [courses, setCourses] = useState<Course[]>(() => storage.getCourses());
  const [alarms, setAlarms] = useState<Alarm[]>(() => storage.getAlarms());
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>(() => storage.getTaskLogs());
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());

  // Toast feedback state
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  // Navigation
  const [activeTab, setActiveTab] = useState<'alarms' | 'schedule' | 'courses' | 'stats' | 'focus'>('alarms');

  // Modals
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | null>(null);
  const [preselectedCourseId, setPreselectedCourseId] = useState<string | undefined>(undefined);
  const [preselectedRepeatDays, setPreselectedRepeatDays] = useState<number[] | undefined>(undefined);

  // Active Ringing Alarm state
  const [activeRingingAlarm, setActiveRingingAlarm] = useState<Alarm | null>(null);

  // Last triggered minute tracker to prevent multiple fires within the same minute
  const lastTriggeredMap = useRef<Record<string, string>>({});

  // Sync theme with HTML root class
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Request notification permissions gracefully
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {
        // ignore
      });
    }
  }, []);

  // Alarm Ticking Checker (Runs every second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentH}:${currentM}`;
      const currentDay = now.getDay();
      const minuteKey = `${now.toDateString()} ${currentTimeStr}`;

      alarms.forEach((alarm) => {
        if (!alarm.enabled) return;

        // Check if snooze is active
        if (alarm.snoozeUntil) {
          const snoozeTime = new Date(alarm.snoozeUntil).getTime();
          if (now.getTime() >= snoozeTime) {
            // Clear snooze and ring!
            const updated = alarms.map((a) =>
              a.id === alarm.id ? { ...a, snoozeUntil: undefined } : a
            );
            setAlarms(updated);
            storage.saveAlarms(updated);
            setActiveRingingAlarm(alarm);
            return;
          }
        }

        // Regular scheduled alarm check
        if (alarm.time === currentTimeStr) {
          // Check repeat days
          const isAllowedDay =
            alarm.repeatDays.length === 0 || alarm.repeatDays.includes(currentDay);

          if (isAllowedDay) {
            const lastTriggered = lastTriggeredMap.current[alarm.id];
            if (lastTriggered !== minuteKey) {
              lastTriggeredMap.current[alarm.id] = minuteKey;

              // If it's a "once" alarm, disable it after firing
              if (alarm.repeatDays.length === 0) {
                const updated = alarms.map((a) =>
                  a.id === alarm.id ? { ...a, enabled: false } : a
                );
                setAlarms(updated);
                storage.saveAlarms(updated);
              }

              setActiveRingingAlarm(alarm);
            }
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms]);

  // Theme Toggle
  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = storage.saveSettings({ theme: newTheme });
    setSettings(updated);
  };

  // Volume Change
  const handleVolumeChange = (vol: number) => {
    const updated = storage.saveSettings({ volume: vol });
    setSettings(updated);
  };

  // Alarm Actions
  const handleOpenAddAlarm = (courseId?: string) => {
    setEditingAlarm(null);
    setPreselectedCourseId(courseId);
    setPreselectedRepeatDays(undefined);
    setIsAlarmModalOpen(true);
  };

  const handleOpenAddAlarmForDay = (dayIndex: number) => {
    setEditingAlarm(null);
    setPreselectedCourseId(undefined);
    setPreselectedRepeatDays([dayIndex]);
    setIsAlarmModalOpen(true);
  };

  const handleEditAlarm = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setPreselectedCourseId(undefined);
    setPreselectedRepeatDays(undefined);
    setIsAlarmModalOpen(true);
  };

  const handleSaveAlarm = (data: Omit<Alarm, 'id' | 'createdAt'>) => {
    if (editingAlarm) {
      const updated = alarms.map((a) =>
        a.id === editingAlarm.id ? { ...a, ...data } : a
      );
      setAlarms(updated);
      storage.saveAlarms(updated);
      showToast(`تم تعديل منبه "${data.title}" بنجاح! ✏️`);
    } else {
      const newAlarm: Alarm = {
        ...data,
        id: 'alarm-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newAlarm, ...alarms];
      setAlarms(updated);
      storage.saveAlarms(updated);
      showToast(`تمت إضافة منبه "${data.title}" بنجاح! 🔔`);
    }

    // Switch to alarms tab so the user sees their new alarm immediately!
    setActiveTab('alarms');
    setIsAlarmModalOpen(false);
    setEditingAlarm(null);
    setPreselectedCourseId(undefined);
  };

  const handleDuplicateAlarm = (alarm: Alarm) => {
    const duplicated: Alarm = {
      ...alarm,
      id: 'alarm-' + Date.now(),
      title: `${alarm.title} (نسخة مكررة)`,
      createdAt: new Date().toISOString(),
      snoozeUntil: undefined,
    };
    const updated = [duplicated, ...alarms];
    setAlarms(updated);
    storage.saveAlarms(updated);
    showToast(`تم تكرار منبه "${alarm.title}" بنجاح! 📋`);
  };

  const handleDeleteAlarm = (alarmId: string) => {
    const target = alarms.find((a) => a.id === alarmId);
    const updated = alarms.filter((a) => a.id !== alarmId);
    setAlarms(updated);
    storage.saveAlarms(updated);
    showToast(`تم حذف المنبه "${target?.title || ''}" 🗑️`, 'info');
  };

  const handleToggleAlarmEnabled = (alarmId: string, enabled: boolean) => {
    const updated = alarms.map((a) =>
      a.id === alarmId ? { ...a, enabled, snoozeUntil: undefined } : a
    );
    setAlarms(updated);
    storage.saveAlarms(updated);
    showToast(enabled ? 'تم تفعيل المنبه 🔔' : 'تم تعطيل المنبه 🔕', 'info');
  };

  const handleTriggerTestAlarm = (alarm: Alarm) => {
    setActiveRingingAlarm(alarm);
  };

  // Active Alarm Modal Actions
  const handleDismissRinging = () => {
    soundManager.stop();
    setActiveRingingAlarm(null);
    showToast('تم إيقاف المنبه', 'info');
  };

  const handleSnoozeRinging = (minutes: number) => {
    soundManager.stop();
    if (activeRingingAlarm) {
      const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const updated = alarms.map((a) =>
        a.id === activeRingingAlarm.id ? { ...a, snoozeUntil: snoozeTime } : a
      );
      setAlarms(updated);
      storage.saveAlarms(updated);
      showToast(`تم ضبط غفوة لـ ${minutes} دقائق ⏱️`);
    }
    setActiveRingingAlarm(null);
  };

  const handleCompleteRinging = (durationMinutes: number) => {
    soundManager.stop();
    if (activeRingingAlarm) {
      const matchedCourse = courses.find((c) => c.id === activeRingingAlarm.courseId);
      const categoryTitle = matchedCourse?.title || activeRingingAlarm.customCategory || undefined;
      storage.logTaskCompletion(
        activeRingingAlarm.title,
        activeRingingAlarm.priority,
        activeRingingAlarm.courseId,
        categoryTitle,
        durationMinutes,
        activeRingingAlarm.id
      );
      setTaskLogs(storage.getTaskLogs());
      showToast('🎉 عظيم! تم تسجيل إنجاز المهمة في الإحصائيات اليومية');
    }
    setActiveRingingAlarm(null);
  };

  // Courses Actions
  const handleAddCourse = (courseData: Omit<Course, 'id' | 'createdAt'>) => {
    const newCourse: Course = {
      ...courseData,
      id: 'c-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...courses, newCourse];
    setCourses(updated);
    storage.saveCourses(updated);
    showToast(`تمت إضافة كورس "${newCourse.title}" بنجاح! 📚`);
  };

  const handleEditCourse = (courseId: string, updatedFields: Partial<Course>) => {
    const updated = courses.map((c) =>
      c.id === courseId ? { ...c, ...updatedFields } : c
    );
    setCourses(updated);
    storage.saveCourses(updated);
    showToast('تم تحديث بيانات الكورس بنجاح! ✏️');
  };

  const handleDeleteCourse = (courseId: string) => {
    const target = courses.find((c) => c.id === courseId);
    const updated = courses.filter((c) => c.id !== courseId);
    setCourses(updated);
    storage.saveCourses(updated);
    showToast(`تم حذف كورس "${target?.title || ''}" 🗑️`, 'info');
  };

  // Manual Task Logs Action
  const handleLogManualTask = (
    title: string,
    priority: AlarmPriority,
    courseId?: string,
    courseTitle?: string,
    durationMinutes: number = 30
  ) => {
    storage.logTaskCompletion(title, priority, courseId, courseTitle, durationMinutes);
    setTaskLogs(storage.getTaskLogs());
    showToast('تم تسجيل الإنجاز في الإحصائيات اليومية! 📊');
  };

  const handleDeleteTaskLog = (logId: string) => {
    const updated = taskLogs.filter((l) => l.id !== logId);
    setTaskLogs(updated);
    storage.saveTaskLogs(updated);
    showToast('تم حذف سجل المهمة', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 shadow-xl border border-slate-700 dark:border-slate-200 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-top-4 duration-200 backdrop-blur-md">
          {toast.type === 'info' ? (
            <Info className="w-4 h-4 text-blue-400" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewAlarm={() => handleOpenAddAlarm()}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        alarmsCount={alarms.filter((a) => a.enabled).length}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Clock & Upcoming Alarm Banner */}
        <ClockBanner
          alarms={alarms}
          volume={settings.volume}
          onVolumeChange={handleVolumeChange}
          onTestSound={() => {
            soundManager.preview('campus_chime', settings.volume);
            showToast('جاري تشغيل تجربة نغمة الجرس الأكاديمي 🔊', 'info');
          }}
        />

        {/* View Switcher */}
        {activeTab === 'alarms' && (
          <AlarmsListView
            alarms={alarms}
            courses={courses}
            volume={settings.volume}
            onOpenNewAlarm={() => handleOpenAddAlarm()}
            onToggleEnabled={handleToggleAlarmEnabled}
            onEdit={handleEditAlarm}
            onDuplicate={handleDuplicateAlarm}
            onDelete={handleDeleteAlarm}
            onTriggerTest={handleTriggerTestAlarm}
          />
        )}

        {activeTab === 'schedule' && (
          <WeeklySchedulerView
            alarms={alarms}
            courses={courses}
            volume={settings.volume}
            onOpenNewAlarmForDay={handleOpenAddAlarmForDay}
            onEditAlarm={handleEditAlarm}
            onTriggerTest={handleTriggerTestAlarm}
            onQuickLogCompleted={(title, priority, cId, cTitle) => {
              handleLogManualTask(
                title,
                priority,
                cId,
                cTitle,
                45
              );
            }}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesView
            courses={courses}
            alarms={alarms}
            taskLogs={taskLogs}
            onAddCourse={handleAddCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleDeleteCourse}
            onAddAlarmForCourse={(courseId) => handleOpenAddAlarm(courseId)}
          />
        )}

        {activeTab === 'stats' && (
          <DailyStatsView
            taskLogs={taskLogs}
            courses={courses}
            onLogTask={handleLogManualTask}
            onDeleteLog={handleDeleteTaskLog}
          />
        )}

        {activeTab === 'focus' && (
          <FocusTimerView
            courses={courses}
            volume={settings.volume}
            onLogCompletedFocus={(cId, cTitle, mins) => {
              handleLogManualTask(
                'جلسة تركيز بومودورو مكتملة',
                'medium',
                cId,
                cTitle,
                mins || 25
              );
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800/80 py-6 mt-12 bg-white/50 dark:bg-slate-900/50 text-center text-xs text-slate-500 dark:text-slate-400">
        <p className="flex items-center justify-center gap-1.5">
          <span>StudyPulse · نظام تنظيم الكورسات والمنبهات الدراسية وإحصائيات الإنجاز</span>
        </p>
      </footer>

      {/* Alarm Form Modal (Add/Edit) */}
      <AlarmFormModal
        isOpen={isAlarmModalOpen}
        onClose={() => {
          setIsAlarmModalOpen(false);
          setEditingAlarm(null);
          setPreselectedCourseId(undefined);
        }}
        alarm={editingAlarm}
        defaultCourseId={preselectedCourseId}
        defaultRepeatDays={preselectedRepeatDays}
        courses={courses}
        volume={settings.volume}
        onSave={handleSaveAlarm}
      />

      {/* Active Ringing Alarm Fullscreen Modal */}
      {activeRingingAlarm && (
        <ActiveAlarmModal
          alarm={activeRingingAlarm}
          course={courses.find((c) => c.id === activeRingingAlarm.courseId)}
          volume={settings.volume}
          onDismiss={handleDismissRinging}
          onSnooze={handleSnoozeRinging}
          onComplete={handleCompleteRinging}
        />
      )}
    </div>
  );
}
