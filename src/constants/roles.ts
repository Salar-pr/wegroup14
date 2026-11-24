import {
  GraduationCap,
  Presentation,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { UserRole } from '../types';

export interface RoleMeta {
  id: UserRole;
  label: string;
  /** Short capability summary shown on the role-selection cards. */
  description: string;
  icon: LucideIcon;
  /** Soft accent used for the icon chip on the login screen. */
  accent: string;
  chip: string;
}

export const ROLES: RoleMeta[] = [
  {
    id: 'admin',
    label: 'مدیر',
    description: 'مدیریت کامل مدرسه، کاربران، کلاس‌ها و گزارش‌ها',
    icon: ShieldCheck,
    accent: '#2563EB',
    chip: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  {
    id: 'teacher',
    label: 'معلم',
    description: 'ثبت نمرات، حضور و غیاب، تکالیف و پیام به اولیا',
    icon: Presentation,
    accent: '#16A34A',
    chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  {
    id: 'student',
    label: 'دانش‌آموز',
    description: 'مشاهده نمرات، تکالیف، برنامه کلاسی و اطلاعیه‌ها',
    icon: GraduationCap,
    accent: '#F59E0B',
    chip: 'bg-amber-50 text-amber-800 ring-amber-200',
  },
  {
    id: 'parent',
    label: 'والدین',
    description: 'پیگیری عملکرد تحصیلی، حضور و شهریه فرزند',
    icon: Users,
    accent: '#7C3AED',
    chip: 'bg-violet-50 text-violet-700 ring-violet-200',
  },
];

export function getRoleMeta(role: UserRole): RoleMeta {
  const meta = ROLES.find((item) => item.id === role);
  if (!meta) {
    throw new Error(`Unknown role: ${role}`);
  }
  return meta;
}
