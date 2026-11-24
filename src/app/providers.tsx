import type { ReactNode } from 'react';
import { AppProvider } from '../context';
import { Toaster } from '../components/feedback/Toast';

/**
 * Application-wide providers.
 * The app is frontend-only: there is no server, no API client and no
 * external data service here — only the in-memory AppContext.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      {children}
      <Toaster />
    </AppProvider>
  );
}
