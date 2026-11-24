import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createMockDatabase,
  findDemoAccountByCredentials,
  getDemoAccountByRole,
  type Database,
} from '../data';
import type { Toast, ToastType, User, UserRole } from '../types';
import { delay } from '../utils';
import { AppContext, type AppContextValue, type LoginResult } from './app-context';

const SIMULATED_AUTH_LATENCY_MS = 750;
const TOAST_DURATION_MS = 4500;

let toastCounter = 0;
function nextToastId(): string {
  toastCounter += 1;
  return `toast-${Date.now()}-${toastCounter}`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  // ---- Auth (runtime-only; lost on reload by design) ----
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // ---- In-memory mock database ----
  const [db, setDb] = useState<Database>(() => createMockDatabase());

  // ---- Toasts ----
  const [toasts, setToasts] = useState<Toast[]>([]);

  // ---- Layout shell ----
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string): string => {
      const id = nextToastId();
      setToasts((prev) => [...prev.slice(-2), { id, type, message, title }]);
      return id;
    },
    [],
  );

  // Auto-dismiss toasts
  useEffect(() => {
    if (toasts.length === 0) return undefined;
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toasts]);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      await delay(SIMULATED_AUTH_LATENCY_MS);
      const account = findDemoAccountByCredentials(email, password);
      if (!account) {
        return {
          ok: false,
          error: 'ایمیل یا رمز عبور وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.',
        };
      }
      setCurrentUser(account.user);
      return { ok: true, user: account.user };
    },
    [],
  );

  const loginAsRole = useCallback(async (role: UserRole): Promise<User> => {
    await delay(SIMULATED_AUTH_LATENCY_MS);
    const account = getDemoAccountByRole(role);
    setCurrentUser(account.user);
    return account.user;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setSidebarOpen(false);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => (currentUser ? roles.includes(currentUser.role) : false),
    [currentUser],
  );

  const updateEntity = useCallback(
    <K extends keyof Database>(
      key: K,
      updater: (items: Database[K]) => Database[K],
    ) => {
      setDb((prev) => ({ ...prev, [key]: updater(prev[key]) }));
    },
    [],
  );

  const resetDemoData = useCallback(() => {
    setDb(createMockDatabase());
  }, []);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const toggleSidebarCollapsed = useCallback(
    () => setSidebarCollapsed((prev) => !prev),
    [],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      login,
      loginAsRole,
      logout,
      hasRole,
      db,
      updateEntity,
      resetDemoData,
      toasts,
      showToast,
      dismissToast,
      sidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      sidebarCollapsed,
      toggleSidebarCollapsed,
    }),
    [
      currentUser,
      login,
      loginAsRole,
      logout,
      hasRole,
      db,
      updateEntity,
      resetDemoData,
      toasts,
      showToast,
      dismissToast,
      sidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      sidebarCollapsed,
      toggleSidebarCollapsed,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
