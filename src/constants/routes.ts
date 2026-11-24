import type { UserRole } from '../types';

/** Single source of truth for every route in the app. */
export const ROUTES = {
  LOGIN: '/login',
  ADMIN: '/admin',
  TEACHER: '/teacher',
  STUDENT: '/student',
  PARENT: '/parent',
} as const;

/** Where each role lands after login / when visiting «/». */
export const ROLE_HOME: Record<UserRole, string> = {
  admin: ROUTES.ADMIN,
  teacher: ROUTES.TEACHER,
  student: ROUTES.STUDENT,
  parent: ROUTES.PARENT,
};

/** Persian display labels for roles. */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'مدیر',
  teacher: 'معلم',
  student: 'دانش‌آموز',
  parent: 'والدین',
};

/** Plural audience wording used in announcement badges. */
export const AUDIENCE_LABELS: Record<'all' | 'admins' | 'teachers' | 'students' | 'parents', string> = {
  all: 'همه',
  admins: 'مدیران',
  teachers: 'معلمان',
  students: 'دانش‌آموزان',
  parents: 'اولیا',
};
