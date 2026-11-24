import { useApp } from './useApp';

/** Auth slice of the shared context: session user + actions. */
export function useAuth() {
  const {
    currentUser,
    isAuthenticated,
    login,
    loginAsRole,
    logout,
    hasRole,
  } = useApp();

  return { currentUser, isAuthenticated, login, loginAsRole, logout, hasRole };
}
