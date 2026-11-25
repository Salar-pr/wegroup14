import type { DemoAccount } from '../types';

// These credentials are for the local UI demo, not real authentication.
export const demoAccounts: DemoAccount[] = [
  {
    password: 'admin123',
    scenario: 'نمای کلی مدرسه و مدیریت پرونده‌ها',
    user: {
      id: 'u-admin',
      name: 'امیر قاسمی',
      email: 'admin@school.ir',
      role: 'admin',
      phone: '09121110000',
      avatarColor: '#2563EB',
      title: 'مدیر مدرسه',
    },
  },
  {
    password: 'teacher123',
    scenario: 'پنل معلم هنوز در دست طراحی است',
    user: {
      id: 'u-teacher',
      name: 'مریم کریمی',
      email: 'teacher@school.ir',
      role: 'teacher',
      phone: '09121110002',
      avatarColor: '#16A34A',
      title: 'دبیر ریاضی و حسابان',
    },
  },
  {
    password: 'student123',
    scenario: 'نمره‌های خوب و حضور منظم',
    user: {
      id: 'u-student',
      name: 'سارا محمدی',
      email: 'student@school.ir',
      role: 'student',
      phone: '09191111001',
      avatarColor: '#F59E0B',
      title: 'دانش‌آموز پایه دهم ریاضی',
      classId: 'c-01',
    },
  },
  {
    password: 'student123',
    scenario: 'نمره‌های پایین و غیبت‌های نیازمند پیگیری',
    user: {
      id: 'u-student-bardia',
      name: 'بردیا هاشمی',
      email: 'bardia@school.ir',
      role: 'student',
      phone: '09191111012',
      avatarColor: '#F59E0B',
      title: 'دانش‌آموز یازدهم ریاضی',
      classId: 'c-03',
    },
  },
  {
    password: 'student123',
    scenario: 'فرزند دوم خانواده محمدی',
    user: {
      id: 'u-student-ali',
      name: 'علی محمدی',
      email: 'ali.m@school.ir',
      role: 'student',
      phone: '09191111025',
      avatarColor: '#0EA5E9',
      title: 'دانش‌آموز دهم ریاضی',
      classId: 'c-01',
    },
  },
  {
    password: 'parent123',
    scenario: 'دو فرزند با وضعیت تحصیلی متفاوت',
    user: {
      id: 'u-parent',
      name: 'زهرا کریمی',
      email: 'parent@school.ir',
      role: 'parent',
      phone: '09121120001',
      avatarColor: '#7C3AED',
      title: 'ولی سارا محمدی',
      studentIds: ['s-01', 's-25'],
    },
  },
  {
    password: 'parent123',
    scenario: 'شهریه پرداخت‌شده و پرونده تک‌فرزند',
    user: {
      id: 'u-parent-rezaei',
      name: 'حسن رضایی',
      email: 'h.rezaei@school.ir',
      role: 'parent',
      phone: '09121120002',
      avatarColor: '#2563EB',
      title: 'ولی امیر رضایی',
      studentIds: ['s-02'],
    },
  },
  {
    password: 'parent123',
    scenario: 'شهریه معوق و پیگیری وضعیت درسی',
    user: {
      id: 'u-parent-hosseini',
      name: 'فاطمه حسینی',
      email: 'f.hosseini@school.ir',
      role: 'parent',
      phone: '09121120003',
      avatarColor: '#DB2777',
      title: 'ولی رعنا حسینی',
      studentIds: ['s-03'],
    },
  },
];

export function getDemoAccountByRole(role: DemoAccount['user']['role']): DemoAccount {
  const account = demoAccounts.find((item) => item.user.role === role);
  if (!account) {
    throw new Error(`No demo account registered for role: ${role}`);
  }
  return account;
}

export function findDemoAccountByCredentials(
  email: string,
  password: string,
): DemoAccount | null {
  const normalizedEmail = email.trim().toLowerCase();
  const account = demoAccounts.find(
    (item) => item.user.email.toLowerCase() === normalizedEmail && item.password === password,
  );
  return account ?? null;
}
