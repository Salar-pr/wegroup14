import type { ID } from './common';

/** Roles supported by the demo system. */
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

/**
 * Session user — the object kept in runtime memory after login.
 * Never carries a password.
 */
export interface User {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatarColor: string;
  /** Human label such as «دبیر ریاضی» or «دانش‌آموز پایه دهم» */
  title?: string;
  /** Students only: the class the user belongs to. */
  classId?: ID;
  /** Parents only: the children linked to this account. */
  studentIds?: ID[];
}

/**
 * Demo account as defined in `src/data/users.ts`.
 * The password is intentionally stored only for the simulated login flow.
 */
export interface DemoAccount {
  user: User;
  password: string;
}
