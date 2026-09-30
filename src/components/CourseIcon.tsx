import React from 'react';
import {
  BookOpen,
  Code,
  Cpu,
  Calculator,
  Languages,
  Brain,
  Database,
  Palette,
  Atom,
  GraduationCap,
  Clock,
  Layers,
} from 'lucide-react';

interface Props {
  name: string;
  className?: string;
  size?: number;
}

export const CourseIcon: React.FC<Props> = ({ name, className = 'w-5 h-5', size }) => {
  const iconMap: Record<string, React.FC<{ className?: string; size?: number }>> = {
    BookOpen,
    Code,
    Cpu,
    Calculator,
    Languages,
    Brain,
    Database,
    Palette,
    Atom,
    GraduationCap,
    Clock,
    Layers,
  };

  const IconComp = iconMap[name] || BookOpen;
  return <IconComp className={className} size={size} />;
};
