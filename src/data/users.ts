import type { DemoAccount } from '../types';

/**
 * Demo accounts for the simulated login flow.
 * Passwords exist here ONLY to make the demo feel like a real product;
 * authentication is not real and nothing leaves the browser.
 */
export const demoAccounts: DemoAccount[] = [
  {
    password: 'admin123',
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
    password: 'parent123',
    user: {
      id: 'u-parent',
      name: 'زهرا کریمی',
      email: 'parent@school.ir',
      role: 'parent',
      phone: '09121120001',
      avatarColor: '#7C3AED',
      title: 'ولی سارا محمدی',
      studentIds: ['s-01'],
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
