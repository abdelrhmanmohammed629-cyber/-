import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  AlertCircle,
  Layers,
  Sparkles
} from 'lucide-react';
import { Alarm, AlarmPriority, Course } from '../types';
import { PRIORITY_CONFIG } from '../utils/constants';
import { AlarmCard } from './AlarmCard';

interface Props {
  alarms: Alarm[];
  courses: Course[];
  volume: number;
  onOpenNewAlarm: () => void;
  onToggleEnabled: (alarmId: string, enabled: boolean) => void;
  onEdit: (alarm: Alarm) => void;
  onDuplicate: (alarm: Alarm) => void;
  onDelete: (alarmId: string) => void;
  onTriggerTest: (alarm: Alarm) => void;
}

export const AlarmsListView: React.FC<Props> = ({
  alarms,
  courses,
  volume,
  onOpenNewAlarm,
  onToggleEnabled,
  onEdit,
  onDuplicate,
  onDelete,
  onTriggerTest,
}) => {
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'time' | 'priority'>('time');

  // Filter & sort alarms
  const filteredAlarms = useMemo(() => {
    return alarms
      .filter((alarm) => {
        // Priority filter
        if (priorityFilter !== 'all' && alarm.priority !== priorityFilter) {
          return false;
        }

        // Course filter
        if (courseFilter !== 'all' && alarm.courseId !== courseFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = alarm.title.toLowerCase().includes(q);
          const matchesNotes = alarm.notes ? alarm.notes.toLowerCase().includes(q) : false;
          if (!matchesTitle && !matchesNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'time') {
          return a.time.localeCompare(b.time);
        } else {
          const order: Record<AlarmPriority, number> = {
            critical: 0,
            high: 1,
            medium: 2,
            normal: 3,
          };
          return order[a.priority] - order[b.priority];
        }
      });
  }, [alarms, priorityFilter, courseFilter, searchQuery, sortBy]);

  const activeCount = alarms.filter((a) => a.enabled).length;

  return (
    <div className="space-y-6">
      {/* Controls Bar: Filters & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المنبهات والملاحظات..."
            className="w-full pr-10 pl-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">كل درجات الأهمية</option>
            <option value="critical">أهمية قصوى 🔥</option>
            <option value="high">أهمية عالية ⚡</option>
            <option value="medium">أهمية متوسطة 📘</option>
            <option value="normal">أهمية عادية ☕</option>
          </select>

          {/* Course Filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">كل الكورسات</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <button
            onClick={() => setSortBy((prev) => (prev === 'time' ? 'priority' : 'time'))}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 transition-colors"
            title="تبديل الترتيب"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>{sortBy === 'time' ? 'مرتب حسب الوقت' : 'مرتب حسب الأهمية'}</span>
          </button>
        </div>
      </div>

      {/* Alarms Summary Kicker */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          عرض <strong className="text-slate-900 dark:text-white">{filteredAlarms.length}</strong> من إجمالي {alarms.length} منبه ({activeCount} منبه مفعّل)
        </span>
      </div>

      {/* Alarms Grid */}
      {filteredAlarms.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            لا توجد منبهات مطابقة للبحث أو الفلتر
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
            يمكنك إضافة منبه جديد أو إعادة ضبط الفلاتر الحالية
          </p>
          <button
            onClick={onOpenNewAlarm}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة منبه الآن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlarms.map((alarm) => {
            const course = courses.find((c) => c.id === alarm.courseId);
            return (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                course={course}
                volume={volume}
                onToggleEnabled={onToggleEnabled}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onTriggerTest={onTriggerTest}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
