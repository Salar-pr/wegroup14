/**
 * DEV-ONLY preview harness for the admin feature (not part of the app bundle).
 *
 * Purpose: let the team leader review the TASK 02 pages in the browser before
 * the one-line router swap described in `src/features/admin/INTEGRATION.md`
 * is applied. It never touches `src/app/` — it simply mounts `<AdminApp />`
 * inside the shared shell with a demo admin session.
 *
 * Run with:  npx vite --config tools/admin-preview/vite.preview.config.ts
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Providers } from '../../app/providers';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../hooks';
import { AdminApp } from './AdminApp';
import '@fontsource/vazirmatn/400.css';
import '@fontsource/vazirmatn/500.css';
import '@fontsource/vazirmatn/700.css';
import '@fontsource/vazirmatn/800.css';
import '../../styles/index.css';

/** Signs in the demo admin account so the shell renders a real user. */
function DemoAdminSession({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loginAsRole } = useAuth();

  React.useEffect(() => {
    if (!isAuthenticated) void loginAsRole('admin');
  }, [isAuthenticated, loginAsRole]);

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <MemoryRouter initialEntries={['/admin']}>
        <DemoAdminSession>
          <Routes>
            <Route path="/admin/*" element={<DashboardLayout />}>
              <Route path="*" element={<AdminApp />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </DemoAdminSession>
      </MemoryRouter>
    </Providers>
  </React.StrictMode>,
);
