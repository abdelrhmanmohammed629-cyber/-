import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, Flame, Bell, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Course } from '../types';
import { soundManager } from '../utils/audioSynthesizer';

interface Props {
  courses: Course[];
  volume: number;
  onLogCompletedFocus: (courseId?: string, courseTitle?: string, minutes?: number) => void;
}

export const FocusTimerView: React.FC<Props> = ({
  courses,
  volume,
  onLogCompletedFocus,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  useEffect(() => {
    let timer: number;
    if (isRunning && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      soundManager.preview('campus_chime', volume);
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      const course = courses.find((c) => c.id === selectedCourseId);
      onLogCompletedFocus(selectedCourseId || undefined, course?.title, selectedMinutes);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, selectedMinutes, selectedCourseId, courses, volume, onLogCompletedFocus]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedMinutes * 60);
  };

  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * 100;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
          مؤقت التركيز وجلسات المذاكرة
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          اضبط وقت المذاكرة بنظام بومودورو مع رنين المنبه عند انتهاء الوقت وتسجيل الإنجاز
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm text-center relative overflow-hidden">
        {/* Preset Selector */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => handleSelectPreset(mins)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedMinutes === mins
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {mins} دقيقة
            </button>
          ))}
        </div>

        {/* Course selection */}
        <div className="max-w-xs mx-auto mb-6">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none"
          >
            <option value="">مذاكرة عامة بدون كورس</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Circular / Large timer display */}
        <div className="relative w-56 h-56 mx-auto flex items-center justify-center mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="100"
              className="text-slate-100 dark:text-slate-800 stroke-current"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="112"
              cy="112"
              r="100"
              className="text-indigo-600 stroke-current transition-all duration-1000"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 100}
              strokeDashoffset={2 * Math.PI * 100 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-extrabold font-mono tabular-nums tracking-tighter text-slate-900 dark:text-white">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs text-slate-400 font-medium mt-1">
              {isRunning ? 'جلسة تركيز جارية' : 'المؤقت متوقف'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleStartPause}
            className={`px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 text-white shadow-lg transition-all transform active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>بدء الجلسة</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="إعادة ضبط"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
