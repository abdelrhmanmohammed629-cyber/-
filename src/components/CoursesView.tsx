import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  BookOpen, 
  CheckCircle, 
  Bell, 
  X, 
  Sparkles,
  User,
  GraduationCap
} from 'lucide-react';
import { Alarm, Course, TaskLog } from '../types';
import { COURSE_COLORS, COURSE_ICONS } from '../utils/constants';
import { CourseIcon } from './CourseIcon';

interface Props {
  courses: Course[];
  alarms: Alarm[];
  taskLogs: TaskLog[];
  onAddCourse: (course: Omit<Course, 'id' | 'createdAt'>) => void;
  onEditCourse: (courseId: string, updated: Partial<Course>) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddAlarmForCourse: (courseId: string) => void;
}

export const CoursesView: React.FC<Props> = ({
  courses,
  alarms,
  taskLogs,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onAddAlarmForCourse,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [color, setColor] = useState(COURSE_COLORS[0].value);
  const [iconName, setIconName] = useState(COURSE_ICONS[0]);
  const [targetHours, setTargetHours] = useState(6);
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingCourse(null);
    setTitle('');
    setCode('');
    setInstructor('');
    setColor(COURSE_COLORS[Math.floor(Math.random() * COURSE_COLORS.length)].value);
    setIconName(COURSE_ICONS[Math.floor(Math.random() * COURSE_ICONS.length)]);
    setTargetHours(6);
    setDescription('');
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setCode(c.code || '');
    setInstructor(c.instructor || '');
    setColor(c.color);
    setIconName(c.iconName);
    setTargetHours(c.targetHoursPerWeek);
    setDescription(c.description || '');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingCourse) {
      onEditCourse(editingCourse.id, {
        title: title.trim(),
        code: code.trim() || undefined,
        instructor: instructor.trim() || undefined,
        color,
        iconName,
        targetHoursPerWeek: Number(targetHours) || 5,
        description: description.trim() || undefined,
      });
    } else {
      onAddCourse({
        title: title.trim(),
        code: code.trim() || undefined,
        instructor: instructor.trim() || undefined,
        color,
        iconName,
        targetHoursPerWeek: Number(targetHours) || 5,
        description: description.trim() || undefined,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            الكورسات والمواد الدراسية
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            نظّم موادك وتابع ساعات المذاكرة والمهام والمنبهات الخاصة بكل كورس
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة كورس جديد</span>
        </button>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
            لا توجد كورسات مضافة بعد
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            أضف كورساتك الجامعية أو دوراتك التدريبية لربط المنبهات بها وتتبع إنجازك
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
          >
            إضافة أول كورس
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map((course) => {
            const courseAlarms = alarms.filter((a) => a.courseId === course.id);
            const courseLogs = taskLogs.filter((t) => t.courseId === course.id);
            const totalMinutes = courseLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);
            const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
            const progressPercent = Math.min(
              100,
              Math.round((totalHours / (course.targetHoursPerWeek || 1)) * 100)
            );

            return (
              <div
                key={course.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Accent top line */}
                <div
                  className="absolute top-0 right-0 left-0 h-1.5"
                  style={{ backgroundColor: course.color }}
                />

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: course.color }}
                    >
                      <CourseIcon name={course.iconName} className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {course.title}
                        </h3>
                        {course.code && (
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {course.code}
                          </span>
                        )}
                      </div>
                      {course.instructor && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3" />
                          <span>{course.instructor}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(course)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="تعديل الكورس"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCourse(course.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="حذف الكورس"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {course.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-4 border border-slate-100 dark:border-slate-800">
                  <div className="text-center">
                    <span className="text-[11px] text-slate-400 block">المنبهات</span>
                    <span className="text-sm font-bold font-mono text-slate-800 dark:text-slate-100">
                      {courseAlarms.length}
                    </span>
                  </div>
                  <div className="text-center border-r border-l border-slate-200 dark:border-slate-700/60">
                    <span className="text-[11px] text-slate-400 block">المهام المنجزة</span>
                    <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {courseLogs.length}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[11px] text-slate-400 block">ساعات المذاكرة</span>
                    <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                      {totalHours} س
                    </span>
                  </div>
                </div>

                {/* Progress bar towards weekly goal */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      الهدف الأسبوعي ({course.targetHoursPerWeek} ساعات)
                    </span>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: course.color,
                      }}
                    />
                  </div>
                </div>

                {/* Quick Add Alarm for this Course */}
                <button
                  onClick={() => onAddAlarmForCourse(course.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>ضبط منبه لهذا الكورس</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add / Edit Course */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600" />
                {editingCourse ? 'تعديل بيانات الكورس' : 'إضافة كورس جديد'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  اسم الكورس / المادة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: هندسة البرمجيات، شبكات الحاسوب..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    رمز الكورس (اختياري)
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="مثال: CS-201"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                    المحاضر / الدكتور (اختياري)
                  </label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="د. أحمد..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  لون تمييز الكورس
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COURSE_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c.value
                          ? 'scale-110 ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  أيقونة الكورس
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COURSE_ICONS.map((iName) => (
                    <button
                      key={iName}
                      type="button"
                      onClick={() => setIconName(iName)}
                      className={`p-2 rounded-xl border transition-all ${
                        iconName === iName
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <CourseIcon name={iName} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  هدف ساعات المذاكرة الأسبوعية
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={targetHours}
                  onChange={(e) => setTargetHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  وصف أو محتوى المادة (اختياري)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="موضوعات الكورس الرئيسية وأهداف المذاكرة..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  {editingCourse ? 'تحديث الكورس' : 'حفظ الكورس'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
