import { AlarmPriority, PriorityMeta, Course, Alarm, TaskLog } from '../types';

export const PRIORITY_CONFIG: Record<AlarmPriority, PriorityMeta> = {
  critical: {
    id: 'critical',
    label: 'أهمية قصوى',
    badgeLabel: 'قصوى 🔥',
    description: 'مهام حاسمة، امتحانات، أو تسليمات لا تحتمل التأخير',
    color: '#EF4444',
    bgLight: 'bg-red-50',
    textLight: 'text-red-700',
    bgDark: 'dark:bg-red-950/40',
    borderLight: 'border-red-200',
    borderDark: 'dark:border-red-900/50',
  },
  high: {
    id: 'high',
    label: 'أهمية عالية',
    badgeLabel: 'عالية ⚡',
    description: 'مذاكرة مكثفة ومحاضرات رئيسية تحتاج تركيزاً عالياً',
    color: '#F59E0B',
    bgLight: 'bg-amber-50',
    textLight: 'text-amber-700',
    bgDark: 'dark:bg-amber-950/40',
    borderLight: 'border-amber-200',
    borderDark: 'dark:border-amber-900/50',
  },
  medium: {
    id: 'medium',
    label: 'أهمية متوسطة',
    badgeLabel: 'متوسطة 📘',
    description: 'مراجعة دورية وحل تمارين وتطبيقات عملية',
    color: '#3B82F6',
    bgLight: 'bg-blue-50',
    textLight: 'text-blue-700',
    bgDark: 'dark:bg-blue-950/40',
    borderLight: 'border-blue-200',
    borderDark: 'dark:border-blue-900/50',
  },
  normal: {
    id: 'normal',
    label: 'أهمية عادية',
    badgeLabel: 'عادية ☕',
    description: 'قراءة عامة، تلخيص سريع، أو جلسة استكشافية',
    color: '#10B981',
    bgLight: 'bg-emerald-50',
    textLight: 'text-emerald-700',
    bgDark: 'dark:bg-emerald-950/40',
    borderLight: 'border-emerald-200',
    borderDark: 'dark:border-emerald-900/50',
  },
};

export const WEEK_DAYS = [
  { index: 0, name: 'الأحد', short: 'أحد' },
  { index: 1, name: 'الإثنين', short: 'إثنين' },
  { index: 2, name: 'الثلاثاء', short: 'ثلاثاء' },
  { index: 3, name: 'الأربعاء', short: 'أربعاء' },
  { index: 4, name: 'الخميس', short: 'خميس' },
  { index: 5, name: 'الجمعة', short: 'جمعة' },
  { index: 6, name: 'السبت', short: 'سبت' },
];

export const COURSE_COLORS = [
  { name: 'أزرق ملكي', value: '#3B82F6' },
  { name: 'بنفسجي داكن', value: '#8B5CF6' },
  { name: 'زمردي', value: '#10B981' },
  { name: 'عنبري دافئ', value: '#F59E0B' },
  { name: 'وردي ياقوتي', value: '#EC4899' },
  { name: 'تركوازي', value: '#06B6D4' },
  { name: 'أحمر قرمزي', value: '#EF4444' },
  { name: 'نيلي ليلي', value: '#6366F1' },
];

export const COURSE_ICONS = [
  'BookOpen',
  'Code',
  'Cpu',
  'Calculator',
  'Languages',
  'Brain',
  'Database',
  'Palette',
  'Atom',
  'GraduationCap',
];

// Seed initial data
export const INITIAL_COURSES: Course[] = [
  {
    id: 'c-web-dev',
    title: 'تطوير تطبيقات الويب الحديثة',
    code: 'CS-301',
    instructor: 'د. أحمد الشافعي',
    color: '#3B82F6',
    iconName: 'Code',
    targetHoursPerWeek: 8,
    description: 'دراسة React، TypeScript، وبناء واجهات المستخدم التفاعلية المتطورة.',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'c-ai-ml',
    title: 'مقدمة في الذكاء الاصطناعي',
    code: 'AI-204',
    instructor: 'د. نادية كمال',
    color: '#8B5CF6',
    iconName: 'Brain',
    targetHoursPerWeek: 6,
    description: 'الشبكات العصبية، معالجة اللغات الطبيعية، وتطبيقات النماذج الذكية.',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'c-algorithms',
    title: 'الخوارزميات وهياكل البيانات',
    code: 'CS-202',
    instructor: 'د. طارق محمود',
    color: '#F59E0B',
    iconName: 'Cpu',
    targetHoursPerWeek: 7,
    description: 'تحليل التعقيد الحسابي، الأشجار، الرسوم البيانية، والبرمجة الديناميكية.',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: 'c-english',
    title: 'الإنجليزية الأكاديمية والمهنية',
    code: 'ENG-102',
    instructor: 'أ. سارة عبد الرحمن',
    color: '#10B981',
    iconName: 'Languages',
    targetHoursPerWeek: 4,
    description: 'المصطلحات التقنية، كتابة الأوراق العلمية ومهارات العرض التقديمي.',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
];

export const INITIAL_ALARMS: Alarm[] = [
  {
    id: 'alarm-1',
    courseId: 'c-web-dev',
    title: 'مذاكرة مكونات React والـ Hooks المتقدمة',
    time: '08:30',
    priority: 'high',
    ringtone: 'campus_chime',
    repeatDays: [0, 1, 2, 3, 4], // Sun to Thu
    enabled: true,
    notes: 'التركيز على useEffect و useMemo وحل التمارين العملية',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'alarm-2',
    courseId: 'c-ai-ml',
    title: 'مشروع تسليم نموذج التصنيف الآلي',
    time: '14:00',
    priority: 'critical',
    ringtone: 'radar_pulsar',
    repeatDays: [1, 3], // Mon, Wed
    enabled: true,
    notes: 'موعد حاسم، مراجعة دقة النموذج وإرسال التقرير النهائي',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'alarm-3',
    courseId: 'c-algorithms',
    title: 'حل مسائل LeetCode على الأشجار الثنائية',
    time: '18:15',
    priority: 'medium',
    ringtone: 'energy_synth',
    repeatDays: [0, 2, 4, 6],
    enabled: true,
    notes: 'حل مسألتين متوسطتين ومسألة صعبة مع تسجيل الوقت',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'alarm-4',
    courseId: 'c-english',
    title: 'ممارسة الاستماع وقراءة مقال تقني',
    time: '21:00',
    priority: 'normal',
    ringtone: 'zen_marimba',
    repeatDays: [0, 1, 2, 3, 4, 5, 6], // Daily
    enabled: true,
    notes: 'تدريب 20 دقيقة قبل النوم',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

// Generate past 7 days initial task completions so charts look lively and authentic
export const generateInitialTaskLogs = (): TaskLog[] => {
  const logs: TaskLog[] = [];
  const now = new Date();
  
  const sampleTasks = [
    { title: 'إنهاء تلخيص المحاضرة الرابعة', courseId: 'c-web-dev', courseTitle: 'تطوير تطبيقات الويب الحديثة', priority: 'high' as AlarmPriority, duration: 45 },
    { title: 'بناء واجهة لوحة التحكم التفاعلية', courseId: 'c-web-dev', courseTitle: 'تطوير تطبيقات الويب الحديثة', priority: 'critical' as AlarmPriority, duration: 60 },
    { title: 'مراجعة خوارزمية البحث الثنائي', courseId: 'c-algorithms', courseTitle: 'الخوارزميات وهياكل البيانات', priority: 'medium' as AlarmPriority, duration: 40 },
    { title: 'تدريب نموذج الانحدار الخطي', courseId: 'c-ai-ml', courseTitle: 'مقدمة في الذكاء الاصطناعي', priority: 'critical' as AlarmPriority, duration: 55 },
    { title: 'قراءة ملخص ورقة بحثية بالإنجليزية', courseId: 'c-english', courseTitle: 'الإنجليزية الأكاديمية والمهنية', priority: 'normal' as AlarmPriority, duration: 30 },
    { title: 'حل اختبار تجريبي في الخوارزميات', courseId: 'c-algorithms', courseTitle: 'الخوارزميات وهياكل البيانات', priority: 'high' as AlarmPriority, duration: 50 },
    { title: 'مراجعة كود المشروع النهائي', courseId: 'c-web-dev', courseTitle: 'تطوير تطبيقات الويب الحديثة', priority: 'high' as AlarmPriority, duration: 45 },
    { title: 'جلسة مراجعة أسبوعية عامة', courseId: 'c-ai-ml', courseTitle: 'مقدمة في الذكاء الاصطناعي', priority: 'medium' as AlarmPriority, duration: 35 },
  ];

  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now);
    dayDate.setDate(now.getDate() - i);
    const dateStr = dayDate.toISOString().split('T')[0];
    
    // 2 to 4 tasks completed per day
    const count = 2 + ((i * 3 + 1) % 3);
    for (let j = 0; j < count; j++) {
      const sample = sampleTasks[(i + j) % sampleTasks.length];
      const taskTime = new Date(dayDate);
      taskTime.setHours(9 + (j * 3), 15 * j, 0, 0);
      
      logs.push({
        id: `seed-log-${i}-${j}`,
        title: sample.title,
        courseId: sample.courseId,
        courseTitle: sample.courseTitle,
        priority: sample.priority,
        durationMinutes: sample.duration,
        dateString: dateStr,
        completedAt: taskTime.toISOString(),
      });
    }
  }

  return logs;
};
