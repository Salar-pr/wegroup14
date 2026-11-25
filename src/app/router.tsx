import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FeaturePlaceholder } from '../components/common/FeaturePlaceholder';
import { LoginPage } from '../features/auth';
import { RequireRole } from './RequireRole';
import { NotFoundPage } from './NotFoundPage';
import { ROUTES, ROLE_HOME } from '../constants/routes';
import { useAuth } from '../hooks';

const AdminApp = lazy(() => import('../features/admin'));
const StudentApp = lazy(() => import('../features/student'));
const ParentApp = lazy(() => import('../features/parent'));

function FeatureFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-[13px] text-text-muted">در حال بارگذاری…</p>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RootRedirect() {
  const { isAuthenticated, currentUser } = useAuth();
  if (!isAuthenticated || !currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <Navigate to={ROLE_HOME[currentUser.role]} replace />;
}

export function Router() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Auth */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />

        {/* Root: role-aware redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Admin area */}
        <Route
          path={`${ROUTES.ADMIN}/*`}
          element={
            <RequireRole role="admin">
              <DashboardLayout />
            </RequireRole>
          }
        >
          <Route
            path="*"
            element={
              <Suspense fallback={<FeatureFallback />}>
                <AdminApp />
              </Suspense>
            }
          />
        </Route>

        {/* Teacher area */}
        <Route
          path={`${ROUTES.TEACHER}/*`}
          element={
            <RequireRole role="teacher">
              <DashboardLayout />
            </RequireRole>
          }
        >
          <Route index element={<FeaturePlaceholder role="teacher" />} />
          <Route path="*" element={<FeaturePlaceholder role="teacher" />} />
        </Route>

        {/* Student area */}
        <Route
          path={`${ROUTES.STUDENT}/*`}
          element={
            <RequireRole role="student">
              <DashboardLayout />
            </RequireRole>
          }
        >
          <Route
            path="*"
            element={
              <Suspense fallback={<FeatureFallback />}>
                <StudentApp />
              </Suspense>
            }
          />
        </Route>

        {/* Parent area */}
        <Route
          path={`${ROUTES.PARENT}/*`}
          element={
            <RequireRole role="parent">
              <DashboardLayout />
            </RequireRole>
          }
        >
          <Route
            path="*"
            element={
              <Suspense fallback={<FeatureFallback />}>
                <ParentApp />
              </Suspense>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
