import { useApp } from './useApp';

/** Toast slice of the shared context. */
export function useToast() {
  const { toasts, showToast, dismissToast } = useApp();
  return { toasts, showToast, dismissToast };
}
