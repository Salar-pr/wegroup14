import { useApp } from './useApp';

/** Live in-memory data slice: collections + a type-safe updater. */
export function useData() {
  const { db, updateEntity, resetDemoData } = useApp();
  return { db, updateEntity, resetDemoData };
}
