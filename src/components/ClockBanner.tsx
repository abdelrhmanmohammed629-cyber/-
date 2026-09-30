import React, { useState, useEffect } from 'react';
import { Clock, Bell, Volume2, AlertCircle, Sparkles, VolumeX } from 'lucide-react';
import { Alarm } from '../types';
import { WEEK_DAYS } from '../utils/constants';

interface Props {
  alarms: Alarm[];
  volume: number;
  onVolumeChange: (vol: number) => void;
  onTestSound: () => void;
}

export const ClockBanner: React.FC<Props> = ({
  alarms,
  volume,
  onVolumeChange,
  onTestSound,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time components
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  const isPM = hours >= 12;
  const hours12 = hours % 12 || 12;

  const dayOfWeek = WEEK_DAYS.find((d) => d.index === currentTime.getDay())?.name || '';
  const dateFormatted = currentTime.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate next alarm
  const activeAlarms = alarms.filter((a) => a.enabled);
  const currentTotalMins = hours * 60 + minutes;

  const nextAlarmInfo = React.useMemo(() => {
    if (activeAlarms.length === 0) return null;

    let nearestAlarm: Alarm | null = null;
    let minDiff = Infinity;

    activeAlarms.forEach((alarm) => {
      const [aH, aM] = alarm.time.split(':').map(Number);
      const aTotalMins = aH * 60 + aM;
      let diff = aTotalMins - currentTotalMins;
      if (diff <= 0) {
        diff += 24 * 60; // Next day
      }

      if (diff < minDiff) {
        minDiff = diff;
        nearestAlarm = alarm;
      }
    });

    if (!nearestAlarm) return null;

    const diffHours = Math.floor(minDiff / 60);
    const diffMins = minDiff % 60;

    return {
      alarm: nearestAlarm as Alarm,
      timeRemainingStr:
        diffHours > 0
          ? `خلال ${diffHours} س و ${diffMins} د`
          : `خلال ${diffMins} دقيقة`,
    };
  }, [activeAlarms, currentTotalMins]);

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden mb-8">
      {/* Background soft ambient glowing circles */}
      <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute right-10 -top-10 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Live Clock */}
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '60s' }} />
            <span>{dayOfWeek}، {dateFormatted}</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight tabular-nums">
              {String(hours12).padStart(2, '0')}:{String(minutes).padStart(2, '0')}
            </span>
            <span className="text-2xl font-mono text-indigo-300 tabular-nums">
              :{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-sm font-bold bg-indigo-500/30 px-2 py-0.5 rounded-lg text-indigo-100">
              {isPM ? 'مساءً' : 'صباحاً'}
            </span>
          </div>

          {/* Next Alarm Notice */}
          {nextAlarmInfo ? (
            <div className="mt-3 flex items-center gap-2 text-xs text-indigo-200 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl max-w-fit border border-white/10">
              <Bell className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              <span>المنبه القادم:</span>
              <strong className="text-white truncate max-w-[150px]">
                {nextAlarmInfo.alarm.title}
              </strong>
              <span className="font-mono text-indigo-300">({nextAlarmInfo.alarm.time})</span>
              <span>·</span>
              <span className="text-amber-300 font-bold">{nextAlarmInfo.timeRemainingStr}</span>
            </div>
          ) : (
            <p className="mt-3 text-xs text-indigo-300">
              لا توجد منبهات مفعّلة حالياً
            </p>
          )}
        </div>

        {/* Right Side: Quick Volume & Test controls */}
        <div className="flex flex-col sm:items-end gap-3 bg-black/20 backdrop-blur-md p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
            <div className="flex items-center gap-2 text-xs text-indigo-200">
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-indigo-300" />
              )}
              <span>مستوى صوت النغمات</span>
            </div>
            <span className="text-xs font-mono font-bold text-white tabular-nums">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Volume slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full sm:w-48 accent-indigo-400 cursor-pointer"
          />

          <div className="flex items-center gap-2 pt-1 w-full justify-end">
            <button
              onClick={onTestSound}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 text-white transition-colors border border-indigo-400/30 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>اختبار صوت المنبه الآن</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
