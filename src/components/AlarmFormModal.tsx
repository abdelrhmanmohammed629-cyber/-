import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Volume2, 
  Play, 
  Square, 
  AlertCircle, 
  Layers, 
  Check,
  Edit3,
  BookOpen,
  Tag
} from 'lucide-react';
import { Alarm, AlarmPriority, Course, RingtoneId } from '../types';
import { PRIORITY_CONFIG, WEEK_DAYS } from '../utils/constants';
import { AVAILABLE_RINGTONES, soundManager } from '../utils/audioSynthesizer';

interface Props {
  alarm: Alarm | null; // null if adding new
  defaultCourseId?: string;
  defaultRepeatDays?: number[];
  courses: Course[];
  volume: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (alarmData: Omit<Alarm, 'id' | 'createdAt'>) => void;
}

const QUICK_SUGGESTIONS = [
  'مذاكرة ومراجعة عامة',
  'متابعة المحاضرة وحل التمارين',
  'التحضير للامتحان القادم',
  'تسليم الواجب والتكليفات',
  'جلسة قراءة وتركيز عميق',
  'مهمة شخصية سريعة',
];

const QUICK_CATEGORIES = [
  'مشروع تخرج',
  'واجب وتكليف',
  'مراجعة امتحان',
  'برمجة وتطبيق عملي',
  'قراءة ومطالعة',
  'مهام عامة',
];

const QUICK_TIMES = [
  { label: '08:00 ص', value: '08:00' },
  { label: '10:30 ص', value: '10:30' },
  { label: '01:00 م', value: '13:00' },
  { label: '04:30 م', value: '16:30' },
  { label: '07:00 م', value: '19:00' },
  { label: '09:30 م', value: '21:30' },
];

export const AlarmFormModal: React.FC<Props> = ({
  alarm,
  defaultCourseId,
  defaultRepeatDays,
  courses,
  volume,
  isOpen,
  onClose,
  onSave,
}) => {
  const isEditing = Boolean(alarm && alarm.id);

  const [title, setTitle] = useState('');
  
  // Category mode: 'custom' (user types freely) | 'existing' (pick from courses) | 'none'
  const [categoryMode, setCategoryMode] = useState<'custom' | 'existing' | 'none'>('custom');
  const [courseId, setCourseId] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  
  const [time, setTime] = useState('08:30');
  const [priority, setPriority] = useState<AlarmPriority>('high');
  const [ringtone, setRingtone] = useState<RingtoneId>('campus_chime');
  const [repeatDays, setRepeatDays] = useState<number[]>([0, 1, 2, 3, 4]);
  const [notes, setNotes] = useState('');
  const [previewingRingtone, setPreviewingRingtone] = useState<RingtoneId | null>(null);

  // Synchronize state on open
  useEffect(() => {
    if (isOpen) {
      if (alarm) {
        setTitle(alarm.title || '');
        if (alarm.courseId) {
          setCategoryMode('existing');
          setCourseId(alarm.courseId);
          setCustomCategory('');
        } else if (alarm.customCategory) {
          setCategoryMode('custom');
          setCustomCategory(alarm.customCategory);
          setCourseId('');
        } else {
          setCategoryMode('none');
          setCourseId('');
          setCustomCategory('');
        }
        setTime(alarm.time || '08:30');
        setPriority(alarm.priority || 'high');
        setRingtone(alarm.ringtone || 'campus_chime');
        setRepeatDays(alarm.repeatDays || [0, 1, 2, 3, 4]);
        setNotes(alarm.notes || '');
      } else {
        setTitle('');
        if (defaultCourseId) {
          setCategoryMode('existing');
          setCourseId(defaultCourseId);
          setCustomCategory('');
        } else {
          setCategoryMode('custom');
          setCustomCategory('');
          setCourseId('');
        }
        const now = new Date();
        now.setMinutes(now.getMinutes() + 15);
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        setTime(`${hh}:${mm}`);
        setPriority('high');
        setRingtone('campus_chime');
        setRepeatDays(defaultRepeatDays || [0, 1, 2, 3, 4]);
        setNotes('');
      }
      setPreviewingRingtone(null);
    }
  }, [isOpen, alarm, defaultCourseId, defaultRepeatDays]);

  if (!isOpen) return null;

  const handleToggleDay = (dayIndex: number) => {
    if (repeatDays.includes(dayIndex)) {
      setRepeatDays(repeatDays.filter((d) => d !== dayIndex));
    } else {
      setRepeatDays([...repeatDays, dayIndex].sort());
    }
  };

  const handlePresetDays = (preset: 'daily' | 'weekdays' | 'weekend' | 'once') => {
    if (preset === 'daily') setRepeatDays([0, 1, 2, 3, 4, 5, 6]);
    else if (preset === 'weekdays') setRepeatDays([0, 1, 2, 3, 4]);
    else if (preset === 'weekend') setRepeatDays([5, 6]);
    else if (preset === 'once') setRepeatDays([]);
  };

  const handlePreviewSound = (rId: RingtoneId) => {
    if (previewingRingtone === rId) {
      soundManager.stop();
      setPreviewingRingtone(null);
    } else {
      setPreviewingRingtone(rId);
      soundManager.preview(rId, volume);
      setTimeout(() => {
        setPreviewingRingtone((curr) => (curr === rId ? null : curr));
      }, 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.stop();

    const finalTitle = title.trim() || 'جلسة مذاكرة جديدة';
    const finalTime = time.trim() || '08:30';

    let resolvedCourseId: string | undefined = undefined;
    let resolvedCustomCategory: string | undefined = undefined;

    if (categoryMode === 'existing' && courseId) {
      resolvedCourseId = courseId;
    } else if (categoryMode === 'custom' && customCategory.trim()) {
      resolvedCustomCategory = customCategory.trim();
    }

    onSave({
      title: finalTitle,
      courseId: resolvedCourseId,
      customCategory: resolvedCustomCategory,
      time: finalTime,
      priority,
      ringtone,
      repeatDays,
      enabled: alarm ? alarm.enabled : true,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'تعديل المنبه الدراسي' : 'إضافة منبه جديد (كورس أو مهمة)'}
              </h2>
              <p className="text-xs text-slate-400">
                تحكم كامل: يمكنك كتابة اسم الكورس أو المهمة يدوياً أو اختيار كورس مسجل
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundManager.stop();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title & Suggestions */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              عنوان المنبه / ما الذي تريد إنجازه؟ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: حل شيت الرياضيات، مذاكرة الفصل الرابع، تدريب لغات..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[11px] text-slate-400 font-medium">مقترحات سريعة:</span>
              {QUICK_SUGGESTIONS.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setTitle(sug)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Course / Category Section (Free Custom Writing OR Select from Courses) */}
          <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-indigo-600" />
                <span>تصنيف الكورس أو المهمة:</span>
              </label>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setCategoryMode('custom')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    categoryMode === 'custom'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  كتابة مخصصة ✍️
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryMode('existing')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    categoryMode === 'existing'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  اختيار كورس 📚
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryMode('none')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium ${
                    categoryMode === 'none'
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
                  }`}
                >
                  بدون تصنيف
                </button>
              </div>
            </div>

            {/* Mode 1: Custom Freeform Text Input */}
            {categoryMode === 'custom' && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="اكتب اسم المادة أو نوع المهمة بحرية (مثلاً: مشروع الذكاء الاصطناعي، واجب لغة، قراءة)..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                {/* Quick Category Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium">تصنيفات شائعة:</span>
                  {QUICK_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCustomCategory(cat)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400 cursor-pointer"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 2: Existing Courses Dropdown */}
            {categoryMode === 'existing' && (
              <div className="relative">
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="">اختر كورس من قائمتك...</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} {c.code ? `(${c.code})` : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
            )}

            {/* Mode 3: None */}
            {categoryMode === 'none' && (
              <p className="text-xs text-slate-400">
                سيعامل هذا المنبه كمهمة دراسية عامة غير مقيدة بأي كورس أو تصنيف محدد.
              </p>
            )}
          </div>

          {/* Alarm Time Picker */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              وقت التنبيه (ساعة : دقيقة) <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-mono tracking-wider tabular-nums bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />

            {/* Quick Times Presets */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[11px] text-slate-400 font-medium">أوقات مقترحة:</span>
              {QUICK_TIMES.map((qt) => (
                <button
                  key={qt.value}
                  type="button"
                  onClick={() => setTime(qt.value)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                    time === qt.value
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority / Importance Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              مدى الأهمية (درجة الأولوية)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(PRIORITY_CONFIG) as AlarmPriority[]).map((pKey) => {
                const p = PRIORITY_CONFIG[pKey];
                const isSelected = priority === pKey;
                return (
                  <button
                    key={pKey}
                    type="button"
                    onClick={() => setPriority(pKey)}
                    className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/70 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 font-bold" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {p.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                      {p.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ringtone Selector with Live Audio Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                نغمة المنبه
              </label>
              <span className="text-xs text-slate-400">انقر لتجربة النغمة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {AVAILABLE_RINGTONES.map((r) => {
                const isSelected = ringtone === r.id;
                const isPlaying = previewingRingtone === r.id;

                return (
                  <div
                    key={r.id}
                    onClick={() => setRingtone(r.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex-1 ml-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {r.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {r.category}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">
                        {r.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewSound(r.id);
                      }}
                      title="استمع للنغمة"
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        isPlaying
                          ? 'bg-indigo-600 text-white animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600'
                      }`}
                    >
                      {isPlaying ? (
                        <Square className="w-3 h-3 fill-current" />
                      ) : (
                        <Play className="w-3 h-3 fill-current" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Repeat / Recurrence Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                تكرار التنبيه
              </label>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => handlePresetDays('daily')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer"
                >
                  يومياً
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays('weekdays')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer"
                >
                  أيام الدراسة
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetDays('once')}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 cursor-pointer"
                >
                  مرة واحدة
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
              {WEEK_DAYS.map((day) => {
                const isActive = repeatDays.includes(day.index);
                return (
                  <button
                    key={day.index}
                    type="button"
                    onClick={() => handleToggleDay(day.index)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {day.short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="مثال: مراجعة الفصل الثالث، تحضير التقرير، إلخ..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                soundManager.stop();
                onClose();
              }}
              className="px-5 py-2.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 font-bold" />
              <span>{isEditing ? 'حفظ التعديلات' : 'إضافة المنبه الآن'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
