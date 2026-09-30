import React, { useState } from 'react';
import { 
  Bell, 
  Volume2, 
  Square, 
  Edit3, 
  Copy, 
  Trash2, 
  Clock, 
  Repeat, 
  PlayCircle,
  Check,
  X
} from 'lucide-react';
import { Alarm, Course } from '../types';
import { PRIORITY_CONFIG, WEEK_DAYS } from '../utils/constants';
import { AVAILABLE_RINGTONES, soundManager } from '../utils/audioSynthesizer';
import { CourseIcon } from './CourseIcon';

interface Props {
  alarm: Alarm;
  course?: Course;
  volume: number;
  onToggleEnabled: (alarmId: string, enabled: boolean) => void;
  onEdit: (alarm: Alarm) => void;
  onDuplicate: (alarm: Alarm) => void;
  onDelete: (alarmId: string) => void;
  onTriggerTest: (alarm: Alarm) => void;
}

export const AlarmCard: React.FC<Props> = ({
  alarm,
  course,
  volume,
  onToggleEnabled,
  onEdit,
  onDuplicate,
  onDelete,
  onTriggerTest,
}) => {
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const priorityMeta = PRIORITY_CONFIG[alarm.priority];
  const ringtoneMeta = AVAILABLE_RINGTONES.find((r) => r.id === alarm.ringtone);

  const handlePreviewSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingPreview) {
      soundManager.stop();
      setIsPlayingPreview(false);
    } else {
      setIsPlayingPreview(true);
      soundManager.preview(alarm.ringtone, volume);
      setTimeout(() => {
        setIsPlayingPreview(false);
      }, 2500);
    }
  };

  // Format 24h to 12h Arabic
  const formatTime12h = (time24: string) => {
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr || '0', 10);
    const m = mStr || '00';
    const isPM = h >= 12;
    h = h % 12;
    if (h === 0) h = 12;
    return {
      time: `${h}:${m}`,
      period: isPM ? 'م' : 'ص',
    };
  };

  const { time: time12, period } = formatTime12h(alarm.time);

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 relative overflow-hidden bg-white dark:bg-slate-900 shadow-xs hover:shadow-md ${
        alarm.enabled
          ? 'border-slate-200 dark:border-slate-800'
          : 'border-slate-200/50 dark:border-slate-800/50 opacity-60 bg-slate-50/50 dark:bg-slate-900/40'
      }`}
      style={{
        borderRight: `5px solid ${priorityMeta.color}`,
      }}
    >
      <div className="p-5">
        {/* Top bar of card: Priority, Course, and Toggle Switch */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority Indicator */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-semibold ${priorityMeta.bgLight} ${priorityMeta.textLight} ${priorityMeta.bgDark} border ${priorityMeta.borderLight} ${priorityMeta.borderDark}`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: priorityMeta.color }}
              />
              {priorityMeta.badgeLabel}
            </span>

            {/* Course or Custom Category Tag */}
            {course ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium border"
                style={{
                  backgroundColor: `${course.color}15`,
                  borderColor: `${course.color}30`,
                  color: course.color,
                }}
              >
                <CourseIcon name={course.iconName} className="w-3.5 h-3.5" />
                <span className="truncate max-w-[130px]">{course.title}</span>
              </span>
            ) : alarm.customCategory ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <span>🏷️</span>
                <span className="truncate max-w-[130px]">{alarm.customCategory}</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                مهمة عامة
              </span>
            )}
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">
              {alarm.enabled ? 'مفعّل' : 'معطّل'}
            </span>
            <button
              onClick={() => onToggleEnabled(alarm.id, !alarm.enabled)}
              type="button"
              role="switch"
              aria-checked={alarm.enabled}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                alarm.enabled
                  ? 'bg-indigo-600 justify-end'
                  : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
            >
              <span className="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform" />
            </button>
          </div>
        </div>

        {/* Big Time Display */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight tabular-nums text-slate-900 dark:text-white">
              {time12}
            </span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {period}
            </span>
            <span className="text-xs text-slate-400 font-mono mr-1">
              ({alarm.time})
            </span>
          </div>

          {/* Sound Preview Button */}
          <button
            type="button"
            onClick={handlePreviewSound}
            title={isPlayingPreview ? 'إيقاف النغمة' : 'تجربة النغمة'}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer ${
              isPlayingPreview
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
            }`}
          >
            {isPlayingPreview ? (
              <Square className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
            <span className="truncate max-w-[90px]">{ringtoneMeta?.name || 'النغمة'}</span>
          </button>
        </div>

        {/* Alarm Title & Notes */}
        <div className="mb-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1 mb-1">
            {alarm.title}
          </h3>
          {alarm.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {alarm.notes}
            </p>
          )}
        </div>

        {/* Days of repeat row */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Repeat className="w-3.5 h-3.5 text-slate-400" />
            {alarm.repeatDays.length === 7 ? (
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">كل يوم</span>
            ) : alarm.repeatDays.length === 0 ? (
              <span>مرة واحدة</span>
            ) : (
              <div className="flex items-center gap-0.5">
                {WEEK_DAYS.map((d) => (
                  <span
                    key={d.index}
                    className={`w-4 h-4 rounded text-[9px] flex items-center justify-center font-medium ${
                      alarm.repeatDays.includes(d.index)
                        ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  >
                    {d.short[0]}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Row */}
          <div className="flex items-center gap-1">
            {/* Test Alarm Trigger */}
            <button
              type="button"
              onClick={() => onTriggerTest(alarm)}
              title="تجربة رنين المنبه الآن"
              className="p-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors flex items-center gap-1 font-medium cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span className="hidden sm:inline">تجربة الرنين</span>
            </button>

            {/* Duplicate */}
            <button
              type="button"
              onClick={() => onDuplicate(alarm)}
              title="تكرار المنبه"
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Edit */}
            <button
              type="button"
              onClick={() => onEdit(alarm)}
              title="تعديل المنبه"
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Delete with inline safe confirmation (No window.confirm!) */}
            {isConfirmingDelete ? (
              <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 p-1 rounded-lg border border-red-200 dark:border-red-800">
                <span className="text-[10px] text-red-600 dark:text-red-400 font-bold px-1">
                  حذف؟
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(alarm.id)}
                  title="تأكيد الحذف"
                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  title="إلغاء"
                  className="p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                title="حذف المنبه"
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
