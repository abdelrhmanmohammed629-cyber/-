import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Flame, 
  Clock, 
  Calendar, 
  Award, 
  Plus, 
  Trash2, 
  Filter, 
  Search, 
  TrendingUp, 
  BarChart2, 
  PieChart,
  Layers,
  ArrowUpRight,
  Share2,
  BookOpen
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import confetti from 'canvas-confetti';
import { Course, TaskLog, AlarmPriority } from '../types';
import { PRIORITY_CONFIG, WEEK_DAYS } from '../utils/constants';
import { CourseIcon } from './CourseIcon';

interface Props {
  taskLogs: TaskLog[];
  courses: Course[];
  onLogTask: (
    title: string,
    priority: AlarmPriority,
    courseId?: string,
    courseTitle?: string,
    durationMinutes?: number
  ) => void;
  onDeleteLog: (id: string) => void;
}

export const DailyStatsView: React.FC<Props> = ({
  taskLogs,
  courses,
  onLogTask,
  onDeleteLog,
}) => {
  // Quick Log modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCourseId, setQuickCourseId] = useState('');
  const [quickCustomCategory, setQuickCustomCategory] = useState('');
  const [quickPriority, setQuickPriority] = useState<AlarmPriority>('high');
  const [quickDuration, setQuickDuration] = useState(45);

  // Filter states
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('week');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<7 | 14>(7);
  const [courseChartMetric, setCourseChartMetric] = useState<'hours' | 'tasks'>('hours');

  // Today's date string YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Current week start date string (Sunday)
  const currentWeekStartStr = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start.toISOString().split('T')[0];
  }, []);

  // Yesterday date string
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Weekly course & custom tasks metrics for Recharts
  const weeklyCoursesData = useMemo(() => {
    const thisWeekLogs = taskLogs.filter((l) => l.dateString >= currentWeekStartStr);

    const map = new Map<string, {
      id: string;
      name: string;
      fullTitle: string;
      code?: string;
      studyHours: number;
      completedTasks: number;
      targetHours: number;
      color: string;
    }>();

    // 1. Initialize registered courses
    courses.forEach((c) => {
      const shortTitle = c.title.length > 15 ? c.title.slice(0, 13) + '...' : c.title;
      map.set(c.id, {
        id: c.id,
        name: shortTitle,
        fullTitle: c.title,
        code: c.code,
        studyHours: 0,
        completedTasks: 0,
        targetHours: c.targetHoursPerWeek || 5,
        color: c.color || '#3B82F6',
      });
    });

    // 2. Tally this week's logs (both registered courses and custom tasks)
    thisWeekLogs.forEach((log) => {
      if (log.courseId && map.has(log.courseId)) {
        const item = map.get(log.courseId)!;
        item.completedTasks += 1;
        item.studyHours = Math.round((item.studyHours + (log.durationMinutes || 0) / 60) * 10) / 10;
      } else if (log.courseTitle) {
        const customKey = `custom-${log.courseTitle}`;
        if (!map.has(customKey)) {
          const shortTitle = log.courseTitle.length > 15 ? log.courseTitle.slice(0, 13) + '...' : log.courseTitle;
          map.set(customKey, {
            id: customKey,
            name: shortTitle,
            fullTitle: log.courseTitle,
            studyHours: 0,
            completedTasks: 0,
            targetHours: 3,
            color: '#8B5CF6',
          });
        }
        const item = map.get(customKey)!;
        item.completedTasks += 1;
        item.studyHours = Math.round((item.studyHours + (log.durationMinutes || 0) / 60) * 10) / 10;
      }
    });

    return Array.from(map.values());
  }, [courses, taskLogs, currentWeekStartStr]);

  // Calculations for past N days chart
  const chartDays = useMemo(() => {
    const days: { dateStr: string; label: string; dayName: string; count: number; minutes: number }[] = [];
    const now = new Date();

    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayIndex = d.getDay();
      const dayName = WEEK_DAYS.find((w) => w.index === dayIndex)?.name || '';
      
      const dayLogs = taskLogs.filter((log) => log.dateString === dStr);
      const count = dayLogs.length;
      const minutes = dayLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0);

      days.push({
        dateStr: dStr,
        label: `${d.getDate()}/${d.getMonth() + 1}`,
        dayName,
        count,
        minutes,
      });
    }
    return days;
  }, [taskLogs, timeRange]);

  const maxTasksInChart = useMemo(() => {
    const max = Math.max(...chartDays.map((d) => d.count), 1);
    return max;
  }, [chartDays]);

  // Streak calculation (consecutive days with at least 1 completed task)
  const currentStreak = useMemo(() => {
    let streak = 0;
    const now = new Date();
    // Check backwards
    for (let i = 0; i < 60; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const hasTask = taskLogs.some((l) => l.dateString === dStr);
      if (hasTask) {
        streak++;
      } else if (i === 0) {
        // If today has no task yet, check yesterday before breaking streak
        continue;
      } else {
        break;
      }
    }
    return streak;
  }, [taskLogs]);

  // Today metrics
  const todayLogs = useMemo(() => taskLogs.filter((l) => l.dateString === todayStr), [taskLogs, todayStr]);
  const todayMinutes = useMemo(() => todayLogs.reduce((acc, l) => acc + (l.durationMinutes || 0), 0), [todayLogs]);
  const todayHours = Math.round((todayMinutes / 60) * 10) / 10;
  const todayCriticalTasks = useMemo(() => todayLogs.filter((l) => l.priority === 'critical').length, [todayLogs]);

  // Course breakdown
  const courseStats = useMemo(() => {
    const map: Record<string, { title: string; color: string; count: number; minutes: number }> = {};
    
    courses.forEach((c) => {
      map[c.id] = { title: c.title, color: c.color, count: 0, minutes: 0 };
    });

    taskLogs.forEach((l) => {
      if (l.courseId && map[l.courseId]) {
        map[l.courseId].count += 1;
        map[l.courseId].minutes += l.durationMinutes || 0;
      }
    });

    return Object.entries(map).map(([id, data]) => ({ id, ...data }));
  }, [courses, taskLogs]);

  // Priority breakdown
  const priorityStats = useMemo(() => {
    const counts: Record<AlarmPriority, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      normal: 0,
    };
    taskLogs.forEach((l) => {
      if (counts[l.priority] !== undefined) {
        counts[l.priority]++;
      }
    });
    return counts;
  }, [taskLogs]);

  // Filtered task logs for table
  const filteredLogs = useMemo(() => {
    return taskLogs.filter((l) => {
      // Date filter
      if (dateFilter === 'today' && l.dateString !== todayStr) return false;
      if (dateFilter === 'yesterday' && l.dateString !== yesterdayStr) return false;
      if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        if (l.dateString < weekAgoStr) return false;
      }

      // Course filter
      if (courseFilter !== 'all' && l.courseId !== courseFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = l.title.toLowerCase().includes(q);
        const matchesCourse = l.courseTitle ? l.courseTitle.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesCourse) return false;
      }

      return true;
    });
  }, [taskLogs, dateFilter, todayStr, yesterdayStr, courseFilter, searchQuery]);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const matchedCourse = courses.find(
      (c) => c.id === quickCourseId || c.title.toLowerCase() === quickCustomCategory.trim().toLowerCase()
    );
    const finalCourseTitle = matchedCourse?.title || quickCustomCategory.trim() || undefined;
    const finalCourseId = matchedCourse?.id || undefined;

    onLogTask(
      quickTitle.trim(),
      quickPriority,
      finalCourseId,
      finalCourseTitle,
      Number(quickDuration) || 30
    );

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }

    setQuickTitle('');
    setQuickCustomCategory('');
    setQuickCourseId('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <span>إحصائيات الإنجاز والمهام اليومية</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            متابعة دقيقة لكل ما أنجزته من مهام دراسية ومحاضرات وجلسات تركيز
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>تسجيل إنجاز يدوي جديد</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Tasks */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">إنجازات اليوم</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
              {todayLogs.length}
            </span>
            <span className="text-xs text-slate-400 font-medium">مهام مكتملة</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>{todayLogs.length > 0 ? 'استمر، أداء ممتاز اليوم!' : 'في انتظار أول إنجاز اليوم'}</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">سلسلة الالتزام</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-amber-500">
              {currentStreak}
            </span>
            <span className="text-xs text-slate-400 font-medium">أيام متتالية</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            حافظ على المذاكرة يومياً لزيادة السلسلة
          </p>
        </div>

        {/* Study Hours Today */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">وقت المذاكرة اليوم</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
              {todayHours}
            </span>
            <span className="text-xs text-slate-400 font-medium">ساعة ({todayMinutes} د)</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            إجمالي دقائق التركيز المسجلة
          </p>
        </div>

        {/* Critical Tasks Done */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">مهام الأهمية القصوى</span>
            <Award className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-red-500">
              {todayCriticalTasks}
            </span>
            <span className="text-xs text-slate-400 font-medium">مهام حاسمة</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            {todayCriticalTasks > 0 ? 'أنجزت الأولويات الحرجة!' : 'لا توجد مهام قصوى اليوم'}
          </p>
        </div>
      </div>

      {/* Main Chart Section: Day-by-Day Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>معدل إنجاز المهام اليومي</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              عدد المهام والدقائق التي أنجزتها يوماً بيوم
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium self-start">
            <button
              onClick={() => setTimeRange(7)}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === 7
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              آخر 7 أيام
            </button>
            <button
              onClick={() => setTimeRange(14)}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeRange === 14
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              آخر 14 يوماً
            </button>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="h-44 flex items-end gap-2 sm:gap-4 justify-between border-b border-slate-200 dark:border-slate-800 px-2">
            {chartDays.map((day) => {
              const heightPercent = maxTasksInChart > 0 ? (day.count / maxTasksInChart) * 85 : 0;
              const isToday = day.dateStr === todayStr;

              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-slate-800 text-white text-[11px] rounded-lg py-1 px-2 pointer-events-none whitespace-nowrap shadow-lg z-20">
                    <span className="font-bold">{day.count} مهام</span> ({day.minutes} دقيقة)
                    <div className="text-[9px] text-slate-400">{day.dayName} {day.label}</div>
                  </div>

                  {/* Task count pill on top of bar */}
                  <span className={`text-[11px] font-mono font-bold mb-1 tabular-nums transition-transform group-hover:-translate-y-0.5 ${
                    isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {day.count > 0 ? day.count : ''}
                  </span>

                  {/* The bar */}
                  <div className="w-full max-w-[40px] bg-slate-100 dark:bg-slate-800/80 rounded-t-xl overflow-hidden flex items-end" style={{ height: '80%' }}>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-sm'
                          : day.count > 0
                          ? 'bg-gradient-to-t from-slate-400 to-slate-300 dark:from-slate-600 dark:to-slate-500 group-hover:from-indigo-500 group-hover:to-indigo-400'
                          : 'bg-transparent'
                      }`}
                      style={{
                        height: `${Math.max(day.count > 0 ? heightPercent : 4, 0)}%`,
                      }}
                    />
                  </div>

                  {/* Date label */}
                  <div className="mt-2 text-center">
                    <span className={`block text-[11px] font-semibold ${
                      isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {day.dayName.slice(0, 4)}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-mono">
                      {day.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recharts Section: Weekly Course Performance Vertical Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>معدل المذاكرة والمهام لكل كورس (الأسبوع الحالي)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              رسم بياني عمودي مدعوم بمكتبة Recharts يوضح الساعات والمهام المكتملة لكل كورس
            </p>
          </div>

          {/* Metric Toggle: Hours vs Tasks */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCourseChartMetric('hours')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                courseChartMetric === 'hours'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>ساعات المذاكرة (ساعة)</span>
            </button>

            <button
              onClick={() => setCourseChartMetric('tasks')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                courseChartMetric === 'tasks'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>المهام المكتملة (مهمة)</span>
            </button>
          </div>
        </div>

        {/* Recharts Container */}
        {weeklyCoursesData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
            <BookOpen className="w-8 h-8 mb-2 text-slate-300 dark:text-slate-600" />
            <span>لا توجد كورسات مضافة بعد لعرض الإحصائيات</span>
          </div>
        ) : (
          <div className="h-72 w-full pt-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyCoursesData}
                margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  className="text-slate-600 dark:text-slate-400 font-sans"
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                />
                <YAxis
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  className="text-slate-400 dark:text-slate-500 font-mono"
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={courseChartMetric === 'hours'}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-right text-xs space-y-1.5 min-w-[190px]">
                          <div className="flex items-center gap-1.5 font-bold border-b border-slate-700/80 pb-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <span>{item.fullTitle}</span>
                            {item.code && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({item.code})
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span>ساعات المذاكرة هذا الأسبوع:</span>
                            <span className="font-mono font-bold text-white tabular-nums">
                              {item.studyHours} ساعة
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span>المهام المنجزة:</span>
                            <span className="font-mono font-bold text-emerald-400 tabular-nums">
                              {item.completedTasks} مهمة
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                            <span>الهدف الأسبوعي:</span>
                            <span className="font-mono tabular-nums">
                              {item.targetHours} ساعات
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey={courseChartMetric === 'hours' ? 'studyHours' : 'completedTasks'}
                  name={courseChartMetric === 'hours' ? 'ساعات المذاكرة' : 'المهام المنجزة'}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={52}
                >
                  {weeklyCoursesData.map((entry) => (
                    <Cell key={`cell-${entry.id}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend / Summary Row */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {weeklyCoursesData.map((item) => (
              <div key={item.id} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {item.name}
                </span>
                <span className="font-mono text-slate-400">
                  (
                  {courseChartMetric === 'hours'
                    ? `${item.studyHours}س`
                    : `${item.completedTasks} مهمة`}
                  )
                </span>
              </div>
            ))}
          </div>

          <div className="text-slate-600 dark:text-slate-400 font-mono text-[11px] bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
            إجمالي الأسبوع الحالي:{' '}
            <strong className="text-indigo-600 dark:text-indigo-400">
              {courseChartMetric === 'hours'
                ? `${weeklyCoursesData.reduce((acc, c) => acc + c.studyHours, 0).toFixed(1)} ساعة`
                : `${weeklyCoursesData.reduce((acc, c) => acc + c.completedTasks, 0)} مهمة مكتملة`}
            </strong>
          </div>
        </div>
      </div>

      {/* Breakdowns Grid: By Course & By Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Breakdown by Course */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>توزيع الإنجاز حسب الكورس</span>
          </h3>

          <div className="space-y-3.5">
            {courseStats.map((item) => {
              const totalAllTasks = taskLogs.length || 1;
              const percent = Math.round((item.count / totalAllTasks) * 100);

              return (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.title}
                    </span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">
                      {item.count} مهام ({item.minutes} دقيقة) · {percent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Importance / Priority */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-500" />
            <span>توزيع الإنجاز حسب مستوى الأهمية</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(PRIORITY_CONFIG) as AlarmPriority[]).map((pKey) => {
              const meta = PRIORITY_CONFIG[pKey];
              const count = priorityStats[pKey] || 0;
              const total = taskLogs.length || 1;
              const percent = Math.round((count / total) * 100);

              return (
                <div
                  key={pKey}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                  style={{ borderRight: `4px solid ${meta.color}` }}
                >
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
                    {meta.label}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                      {count}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {percent}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Tasks Log Table with Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              سجل المهام المنجزة
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              قائمة تفصيلية بالمهام والجلسات المسجلة
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في المهام..."
                className="pr-8 pl-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-500 w-36 sm:w-44"
              />
            </div>

            {/* Date filter buttons */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 rounded-xl text-xs">
              <button
                onClick={() => setDateFilter('today')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  dateFilter === 'today' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                اليوم
              </button>
              <button
                onClick={() => setDateFilter('week')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  dateFilter === 'week' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                أسبوع
              </button>
              <button
                onClick={() => setDateFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  dateFilter === 'all' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                الكل
              </button>
            </div>
          </div>
        </div>

        {/* Task Items List */}
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center px-4">
            <CheckCircle2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              لا توجد مهام مسجلة مطابقة لهذا الفلتر
            </p>
            <p className="text-xs text-slate-400 mt-1">
              سجل مهامك عند انطلاق المنبه أو عبر زر "تسجيل إنجاز يدوي جديد"
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => {
              const pMeta = PRIORITY_CONFIG[log.priority] || PRIORITY_CONFIG.normal;
              const dateObj = new Date(log.completedAt);
              const timeStr = dateObj.toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={log.id}
                  className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {log.title}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${pMeta.bgLight} ${pMeta.textLight} ${pMeta.bgDark}`}
                        >
                          {pMeta.badgeLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        {log.courseTitle && (
                          <>
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                              {log.courseTitle}
                            </span>
                            <span>·</span>
                          </>
                        )}
                        <span>{log.dateString}</span>
                        <span>·</span>
                        <span className="font-mono">{timeStr}</span>
                        <span>·</span>
                        <span>{log.durationMinutes} دقيقة</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteLog(log.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    title="حذف هذا السجل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Quick Log Task */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>تسجيل مهمة دراسية تم إنجازها</span>
            </h3>

            <form onSubmit={handleQuickSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  ما الذي أنجزته؟ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="مثال: مذاكرة الفصل الأول، تلخيص محاضرة، حل تمرين..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                    الكورس أو التصنيف (اختياري)
                  </label>
                  <span className="text-[10px] text-slate-400">يمكنك كتابة أي اسم مخصص بحرية</span>
                </div>
                <input
                  type="text"
                  list="course-suggestions-list"
                  value={quickCustomCategory}
                  onChange={(e) => {
                    setQuickCustomCategory(e.target.value);
                    const found = courses.find((c) => c.title === e.target.value);
                    if (found) setQuickCourseId(found.id);
                    else setQuickCourseId('');
                  }}
                  placeholder="اكتب اسم المادة أو المهمة (مثلاً: مشروع، واجب، قراءة)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <datalist id="course-suggestions-list">
                  {courses.map((c) => (
                    <option key={c.id} value={c.title} />
                  ))}
                  <option value="مشروع تخرج" />
                  <option value="واجب وتكليف" />
                  <option value="مراجعة امتحان" />
                  <option value="قراءة ومطالعة" />
                  <option value="مهمة شخصية" />
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    درجة الأهمية
                  </label>
                  <select
                    value={quickPriority}
                    onChange={(e) => setQuickPriority(e.target.value as AlarmPriority)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="critical">قصوى 🔥</option>
                    <option value="high">عالية ⚡</option>
                    <option value="medium">متوسطة 📘</option>
                    <option value="normal">عادية ☕</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    المدة (بالدقائق)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    step="5"
                    value={quickDuration}
                    onChange={(e) => setQuickDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  تسجيل في الإحصائيات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
