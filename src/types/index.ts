export type AlarmPriority = 'critical' | 'high' | 'medium' | 'normal';

export type RingtoneId = 
  | 'digital_beep' 
  | 'campus_chime' 
  | 'zen_marimba' 
  | 'energy_synth' 
  | 'radar_pulsar' 
  | 'vintage_clock';

export interface RingtoneInfo {
  id: RingtoneId;
  name: string;
  description: string;
  category: 'كلاسيكي' | 'هادئ' | 'نشط' | 'أكاديمي';
}

export interface Course {
  id: string;
  title: string;
  code?: string;
  instructor?: string;
  color: string;
  iconName: string;
  targetHoursPerWeek: number;
  description?: string;
  createdAt: string;
}

export interface Alarm {
  id: string;
  courseId?: string;
  customCategory?: string; // User can type any custom course/task name directly
  title: string;
  time: string; // "HH:MM" 24h
  priority: AlarmPriority;
  ringtone: RingtoneId;
  repeatDays: number[]; // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  enabled: boolean;
  notes?: string;
  snoozeUntil?: string; // ISO timestamp if currently snoozed
  lastTriggeredDate?: string;
  createdAt: string;
}

export interface TaskLog {
  id: string;
  alarmId?: string;
  courseId?: string;
  courseTitle?: string;
  title: string;
  priority: AlarmPriority;
  completedAt: string; // ISO date-time
  dateString: string; // YYYY-MM-DD
  durationMinutes: number;
  notes?: string;
}

export interface PriorityMeta {
  id: AlarmPriority;
  label: string;
  badgeLabel: string;
  description: string;
  color: string;
  bgLight: string;
  textLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
}
