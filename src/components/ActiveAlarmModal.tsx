import React, { useEffect } from 'react';
import { Bell, CheckCircle2, Clock, Volume2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Alarm, Course } from '../types';
import { PRIORITY_CONFIG } from '../utils/constants';
import { soundManager } from '../utils/audioSynthesizer';
import { CourseIcon } from './CourseIcon';

interface Props {
  alarm: Alarm;
  course?: Course;
  volume: number;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onComplete: (durationMinutes: number) => void;
}

export const ActiveAlarmModal: React.FC<Props> = ({
  alarm,
  course,
  volume,
  onDismiss,
  onSnooze,
  onComplete,
}) => {
  const priorityMeta = PRIORITY_CONFIG[alarm.priority];

  useEffect(() => {
    // Start looping alarm sound
    const audioHandle = soundManager.startAlarm(alarm.ringtone, volume);

    // Also trigger system browser notification if enabled
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`منبه دراسي: ${alarm.title}`, {
          body: `حان الآن موعد: ${alarm.title} (${priorityMeta.label})`,
          icon: '/favicon.ico',
        });
      } catch {
        // Notification constructor could fail in some iframe environments
      }
    }

    return () => {
      audioHandle.stop();
    };
  }, [alarm, volume, priorityMeta]);

  const handleComplete = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
      });
    } catch {
      // ignore
    }
    soundManager.stop();
    onComplete(45); // default estimated study duration 45 mins
  };

  const handleSnooze = (mins: number) => {
    soundManager.stop();
    onSnooze(mins);
  };

  const handleDismissOnly = () => {
    soundManager.stop();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
        style={{
          borderTop: `6px solid ${priorityMeta.color}`,
        }}
      >
        {/* Pulsing ring visual indicator */}
        <div className="pt-8 pb-4 text-center px-6">
          <div className="relative inline-flex items-center justify-center mb-4">
            <span 
              className="absolute w-24 h-24 rounded-full animate-ping opacity-30"
              style={{ backgroundColor: priorityMeta.color }}
            />
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg relative z-10 animate-bounce"
              style={{ backgroundColor: priorityMeta.color }}
            >
              <Bell className="w-10 h-10 animate-pulse" />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border"
            style={{
              backgroundColor: `${priorityMeta.color}15`,
              color: priorityMeta.color,
              borderColor: `${priorityMeta.color}40`,
            }}
          >
            <span>{priorityMeta.badgeLabel}</span>
            <span>·</span>
            <span>تنبيه حان وقته الآن</span>
          </div>

          {/* Time display */}
          <div className="text-4xl font-extrabold font-mono tracking-wider tabular-nums text-slate-900 dark:text-white mb-2">
            {alarm.time}
          </div>

          {/* Alarm Title */}
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {alarm.title}
          </h2>

          {/* Linked Course or Custom Category */}
          {course ? (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-300 font-medium mb-3">
              <span 
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: course.color }}
              />
              <CourseIcon name={course.iconName} className="w-4 h-4" />
              <span>{course.title}</span>
              {course.code && <span className="text-xs text-slate-400 font-mono">({course.code})</span>}
            </div>
          ) : alarm.customCategory ? (
            <div className="flex items-center justify-center gap-2 text-sm text-purple-700 dark:text-purple-300 font-medium mb-3">
              <span>🏷️</span>
              <span className="font-bold">{alarm.customCategory}</span>
            </div>
          ) : null}

          {alarm.notes && (
            <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl max-h-24 overflow-y-auto mb-4 border border-slate-100 dark:border-slate-800 text-right">
              {alarm.notes}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-6">
            <Volume2 className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
            <span>النغمة تعمل بصوت متكرر حتى تتفاعل مع المنبه</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
          {/* Primary Action: Mark Completed & Log */}
          <button
            onClick={handleComplete}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-base"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>تم الإنجاز! تسجيل المهمة في الإحصائيات</span>
          </button>

          {/* Secondary Actions Row: Snooze & Dismiss */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSnooze(5)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium rounded-xl text-sm transition-colors"
            >
              <Clock className="w-4 h-4 text-amber-500" />
              <span>غفوة (5 دقائق)</span>
            </button>

            <button
              onClick={handleDismissOnly}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium rounded-xl text-sm transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
              <span>إيقاف المنبه فقط</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
