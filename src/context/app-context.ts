import { createContext } from 'react';
import type { Database } from '../data';
import type { Toast, ToastType, User, UserRole } from '../types';

export type LoginResult =
  | { ok: true; user: User }
  | { ok: false; error: string };

/**
 * The single shared application context.
 *
 * Contract for feature teams (do not change without the team lead):
 * - Auth:    currentUser, isAuthenticated, login, loginAsRole, logout, hasRole
 * - Data:    db (live in-memory collections), updateEntity, resetDemoData
 * - Toasts:  toasts, showToast, dismissToast
 * - Shell:   sidebarOpen / toggleSidebar / closeSidebar (mobile drawer),
 *            sidebarCollapsed / toggleSidebarCollapsed (desktop rail)
 */
export interface AppContextValue {
  // ---- Auth ----
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  loginAsRole: (role: UserRole) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;

  // ---- In-memory data ----
  db: Database;
  updateEntity: <K extends keyof Database>(
    key: K,
    updater: (items: Database[K]) => Database[K],
  ) => void;
  resetDemoData: () => void;

  // ---- Toasts ----
  toasts: Toast[];
  showToast: (type: ToastType, message: string, title?: string) => string;
  dismissToast: (id: string) => void;

  // ---- Layout shell ----
  /** Mobile drawer visibility */
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  /** Desktop collapsed (icon-only) rail */
  sidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);
