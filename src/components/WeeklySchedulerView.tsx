import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Bell, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  PlayCircle, 
  Edit3, 
  CheckCircle2, 
  Filter, 
  Layers, 
  Sparkles,
  ListFilter,
  LayoutGrid,
  CalendarDays
} from 'lucide-react';
import { Alarm, Course, AlarmPriority } from '../types';
import { PRIORITY_CONFIG, WEEK_DAYS } from '../utils/constants';
import { CourseIcon } from './CourseIcon';

interface Props {
  alarms: Alarm[];
  courses: Course[];
  volume: number;
  onOpenNewAlarmForDay: (dayIndex: number) => void;
  onEditAlarm: (alarm: Alarm) => void;
  onTriggerTest: (alarm: Alarm) => void;
  onQuickLogCompleted: (title: string, priority: AlarmPriority, courseId?: string, courseTitle?: string) => void;
}

export const WeeklySchedulerView: React.FC<Props> = ({
  alarms,
  courses,
  volume,
  onOpenNewAlarmForDay,
  onEditAlarm,
  onTriggerTest,
  onQuickLogCompleted,
}) => {
  const [viewMode, setViewMode] = useState<'columns' | 'timeline'>('columns');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

  // Current day index (0 = Sun, 1 = Mon ... 6 = Sat)
  const todayIndex = new Date().getDay();

  // Helper to format time into 12h
  const formatTime12h = (time24: string) => {
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr || '0', 10);
    const m = mStr || '00';
    const isPM = h >= 12;
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${m} ${isPM ? 'م' : 'ص'}`;
  };

  // Filter alarms
  const filteredAlarms = useMemo(() => {
    return alarms.filter((alarm) => {
      if (activeOnly && !alarm.enabled) return false;
      if (selectedCourseFilter !== 'all' && alarm.courseId !== selectedCourseFilter) return false;
      if (selectedPriorityFilter !== 'all' && alarm.priority !== selectedPriorityFilter) return false;
      return true;
    });
  }, [alarms, activeOnly, selectedCourseFilter, selectedPriorityFilter]);

  // Map alarms to days of the week (Sunday = 0 to Saturday = 6)
  const scheduleByDay = useMemo(() => {
    const map: Record<number, Alarm[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };

    filteredAlarms.forEach((alarm) => {
      if (alarm.repeatDays.length === 0) {
        // Once: assign to today if enabled
        map[todayIndex].push(alarm);
      } else {
        alarm.repeatDays.forEach((dayIdx) => {
          if (map[dayIdx]) {
            map[dayIdx].push(alarm);
          }
        });
      }
    });

    // Sort each day's alarms by time
    Object.keys(map).forEach((dayKey) => {
      const idx = Number(dayKey);
      map[idx].sort((a, b) => a.time.localeCompare(b.time));
    });

    return map;
  }, [filteredAlarms, todayIndex]);

  // Overall weekly stats
  const totalWeeklySessions = useMemo(() => {
    return Object.values(scheduleByDay).reduce((acc, list) => acc + list.length, 0);
  }, [scheduleByDay]);

  const todaySessionsCount = scheduleByDay[todayIndex]?.length || 0;

  // Timeline hours (from 07:00 to 23:00)
  const timelineHours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>التقويم والجدول الأسبوعي للمذاكرة</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            جدول زمني مرئي يعرض مواعيد المنبهات وجلسات المذاكرة طوال أيام الأسبوع
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('columns')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'columns'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>أعمدة الأيام</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>مخطط الساعات (Timeline)</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">جلسات اليوم المجدولة</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
              {todaySessionsCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">جلسات</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">إجمالي التنبيهات أسبوعياً</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white tabular-nums">
              {totalWeeklySessions}
            </span>
            <span className="text-xs text-slate-400 font-medium">موعد دراسي</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">أكثر الأيام كثافة</span>
          <div className="flex items-baseline gap-1.5">
            {(() => {
              let maxDay = WEEK_DAYS[0];
              let maxCount = 0;
              WEEK_DAYS.forEach((w) => {
                const count = scheduleByDay[w.index]?.length || 0;
                if (count > maxCount) {
                  maxCount = count;
                  maxDay = w;
                }
              });
              return (
                <>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {maxDay.name}
                  </span>
                  <span className="text-xs text-slate-400">({maxCount} جلسات)</span>
                </>
              );
            })()}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-400 block mb-1">الكورسات المشمولة</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {courses.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">كورسات مسجلة</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>تصفية الجدول:</span>
          </span>

          {/* Course filter */}
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">كل الكورسات والتصنيفات</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Priority filter */}
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">كل درجات الأهمية</option>
            <option value="critical">قصوى 🔥</option>
            <option value="high">عالية ⚡</option>
            <option value="medium">متوسطة 📘</option>
            <option value="normal">عادية ☕</option>
          </select>
        </div>

        {/* Active only toggle */}
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="rounded accent-indigo-600 cursor-pointer w-4 h-4"
          />
          <span>عرض المنبهات المفعّلة فقط</span>
        </label>
      </div>

      {/* Mode 1: 7-Day Columns Grid View */}
      {viewMode === 'columns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
          {WEEK_DAYS.map((day) => {
            const dayAlarms = scheduleByDay[day.index] || [];
            const isToday = day.index === todayIndex;

            return (
              <div
                key={day.index}
                className={`rounded-2xl border flex flex-col transition-all min-h-[420px] ${
                  isToday
                    ? 'border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs'
                }`}
              >
                {/* Column Day Header */}
                <div
                  className={`p-3 border-b flex items-center justify-between rounded-t-2xl ${
                    isToday
                      ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-600 text-white'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm">{day.name}</span>
                    {isToday && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-white font-black">
                        اليوم
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      isToday
                        ? 'bg-white/25 text-white'
                        : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {dayAlarms.length}
                  </span>
                </div>

                {/* Alarms for this day */}
                <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[500px]">
                  {dayAlarms.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
                      <Clock className="w-6 h-6 mb-1.5 opacity-30" />
                      <span>لا توجد مواعيد</span>
                    </div>
                  ) : (
                    dayAlarms.map((alarm) => {
                      const course = courses.find((c) => c.id === alarm.courseId);
                      const pMeta = PRIORITY_CONFIG[alarm.priority];

                      return (
                        <div
                          key={alarm.id}
                          className={`p-2.5 rounded-xl border text-right transition-all group relative overflow-hidden ${
                            alarm.enabled
                              ? 'bg-white dark:bg-slate-800/90 border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-indigo-400'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/40 opacity-60'
                          }`}
                          style={{
                            borderRight: `4px solid ${pMeta.color}`,
                          }}
                        >
                          {/* Time & Priority */}
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="font-mono text-xs font-black text-slate-900 dark:text-white tabular-nums">
                              {formatTime12h(alarm.time)}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${pMeta.bgLight} ${pMeta.textLight} ${pMeta.bgDark}`}
                            >
                              {pMeta.badgeLabel}
                            </span>
                          </div>

                          {/* Alarm Title */}
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug mb-1.5">
                            {alarm.title}
                          </p>

                          {/* Course or Custom Category Tag */}
                          <div className="mb-2">
                            {course ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border"
                                style={{
                                  backgroundColor: `${course.color}15`,
                                  borderColor: `${course.color}30`,
                                  color: course.color,
                                }}
                              >
                                <CourseIcon name={course.iconName} className="w-3 h-3" />
                                <span className="truncate max-w-[100px]">{course.title}</span>
                              </span>
                            ) : alarm.customCategory ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                <span>🏷️</span>
                                <span className="truncate max-w-[100px]">{alarm.customCategory}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">مهمة عامة</span>
                            )}
                          </div>

                          {/* Action Buttons Row */}
                          <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-700/50 text-xs">
                            <button
                              type="button"
                              onClick={() => onTriggerTest(alarm)}
                              title="تجربة رنين المنبه"
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                            >
                              <PlayCircle className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onEditAlarm(alarm)}
                              title="تعديل المنبه"
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onQuickLogCompleted(
                                  alarm.title,
                                  alarm.priority,
                                  alarm.courseId,
                                  course?.title || alarm.customCategory
                                );
                              }}
                              title="تسجيل إنجاز فوري لهذه الجلسة"
                              className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>أُنجزت</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Add For this Day Button */}
                <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => onOpenNewAlarmForDay(day.index)}
                    className="w-full py-1.5 px-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>منبه لـ {day.short}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 2: Hourly Timetable Grid (Timeline View) */}
      {viewMode === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Table Header: 7 Days */}
            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2 text-center text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="text-slate-400">الوقت</div>
              {WEEK_DAYS.map((d) => (
                <div
                  key={d.index}
                  className={`py-1 rounded-lg ${
                    d.index === todayIndex
                      ? 'bg-indigo-600 text-white font-extrabold shadow-xs'
                      : ''
                  }`}
                >
                  {d.name}
                </div>
              ))}
            </div>

            {/* Time Rows */}
            <div className="space-y-1">
              {timelineHours.map((hour) => {
                const hourStr = String(hour).padStart(2, '0');
                const isPM = hour >= 12;
                const h12 = hour % 12 || 12;
                const timeLabel = `${h12}:00 ${isPM ? 'م' : 'ص'}`;

                return (
                  <div
                    key={hour}
                    className="grid grid-cols-8 min-h-[52px] border-b border-slate-100 dark:border-slate-800/60 items-start py-1"
                  >
                    {/* Hour Column */}
                    <div className="text-[11px] font-mono font-semibold text-slate-400 flex items-center justify-center pt-1">
                      {timeLabel}
                    </div>

                    {/* 7 Days Columns */}
                    {WEEK_DAYS.map((d) => {
                      // Find alarms that start in this hour
                      const alarmsInThisHour = (scheduleByDay[d.index] || []).filter((a) => {
                        const aHour = parseInt(a.time.split(':')[0], 10);
                        return aHour === hour;
                      });

                      const isToday = d.index === todayIndex;

                      return (
                        <div
                          key={d.index}
                          className={`p-1 border-r border-slate-100 dark:border-slate-800/50 min-h-[48px] space-y-1 ${
                            isToday ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                          }`}
                        >
                          {alarmsInThisHour.map((alarm) => {
                            const course = courses.find((c) => c.id === alarm.courseId);
                            const pMeta = PRIORITY_CONFIG[alarm.priority];

                            return (
                              <div
                                key={alarm.id}
                                onClick={() => onEditAlarm(alarm)}
                                className="p-1.5 rounded-lg border text-right cursor-pointer hover:scale-[1.02] transition-transform shadow-xs"
                                style={{
                                  backgroundColor: course ? `${course.color}15` : `${pMeta.color}15`,
                                  borderColor: course ? `${course.color}40` : `${pMeta.color}40`,
                                  borderRight: `3px solid ${pMeta.color}`,
                                }}
                                title={`${alarm.title} (${alarm.time})`}
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-mono font-bold tabular-nums">
                                    {alarm.time}
                                  </span>
                                  <span className="text-[8px] font-bold">{pMeta.badgeLabel}</span>
                                </div>
                                <p className="text-[11px] font-bold truncate mt-0.5">
                                  {alarm.title}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
