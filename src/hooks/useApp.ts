import { useContext } from 'react';
import { AppContext, type AppContextValue } from '../context';

/** Access the full shared context. Throws outside <AppProvider>. */
export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within <AppProvider>. Wrap your tree in <Providers>.');
  }
  return context;
}
