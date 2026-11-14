import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  // Add QueryClientProvider, theme, and other app-wide providers here.
  return <>{children}</>;
}
