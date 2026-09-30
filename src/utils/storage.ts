import { Alarm, Course, TaskLog } from '../types';
import { INITIAL_ALARMS, INITIAL_COURSES, generateInitialTaskLogs } from './constants';

const KEYS = {
  COURSES: 'studypulse_courses_v1',
  ALARMS: 'studypulse_alarms_v1',
  TASK_LOGS: 'studypulse_task_logs_v1',
  SETTINGS: 'studypulse_settings_v1',
};

export interface AppSettings {
  volume: number; // 0.1 to 1.0
  notificationsEnabled: boolean;
  theme: 'light' | 'dark';
}

const DEFAULT_SETTINGS: AppSettings = {
  volume: 0.8,
  notificationsEnabled: true,
  theme: 'light',
};

export const storage = {
  // Courses
  getCourses: (): Course[] => {
    try {
      const data = localStorage.getItem(KEYS.COURSES);
      if (!data) {
        localStorage.setItem(KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
        return INITIAL_COURSES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_COURSES;
    }
  },

  saveCourses: (courses: Course[]): void => {
    try {
      localStorage.setItem(KEYS.COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses', e);
    }
  },

  // Alarms
  getAlarms: (): Alarm[] => {
    try {
      const data = localStorage.getItem(KEYS.ALARMS);
      if (!data) {
        localStorage.setItem(KEYS.ALARMS, JSON.stringify(INITIAL_ALARMS));
        return INITIAL_ALARMS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ALARMS;
    }
  },

  saveAlarms: (alarms: Alarm[]): void => {
    try {
      localStorage.setItem(KEYS.ALARMS, JSON.stringify(alarms));
    } catch (e) {
      console.error('Failed to save alarms', e);
    }
  },

  // Task Logs (Completed study tasks)
  getTaskLogs: (): TaskLog[] => {
    try {
      const data = localStorage.getItem(KEYS.TASK_LOGS);
      if (!data) {
        const initial = generateInitialTaskLogs();
        localStorage.setItem(KEYS.TASK_LOGS, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(data);
    } catch {
      return generateInitialTaskLogs();
    }
  },

  saveTaskLogs: (logs: TaskLog[]): void => {
    try {
      localStorage.setItem(KEYS.TASK_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to save task logs', e);
    }
  },

  logTaskCompletion: (
    title: string,
    priority: TaskLog['priority'],
    courseId?: string,
    courseTitle?: string,
    durationMinutes: number = 30,
    alarmId?: string
  ): TaskLog => {
    const current = storage.getTaskLogs();
    const now = new Date();
    const newLog: TaskLog = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      alarmId,
      courseId,
      courseTitle,
      title,
      priority,
      completedAt: now.toISOString(),
      dateString: now.toISOString().split('T')[0],
      durationMinutes,
    };
    const updated = [newLog, ...current];
    storage.saveTaskLogs(updated);
    return newLog;
  },

  // Settings
  getSettings: (): AppSettings => {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: (settings: Partial<AppSettings>): AppSettings => {
    const current = storage.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
    return updated;
  },

  // Reset or export/import
  exportData: (): string => {
    const payload = {
      courses: storage.getCourses(),
      alarms: storage.getAlarms(),
      taskLogs: storage.getTaskLogs(),
      settings: storage.getSettings(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importData: (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.courses)) storage.saveCourses(parsed.courses);
      if (Array.isArray(parsed.alarms)) storage.saveAlarms(parsed.alarms);
      if (Array.isArray(parsed.taskLogs)) storage.saveTaskLogs(parsed.taskLogs);
      if (parsed.settings) storage.saveSettings(parsed.settings);
      return true;
    } catch (e) {
      console.error('Invalid import JSON', e);
      return false;
    }
  },
};
