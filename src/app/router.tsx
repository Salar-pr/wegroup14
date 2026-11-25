import { lazy, Suspense, useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { FeaturePlaceholder } from '../components/common/FeaturePlaceholder';
import { LoginPage } from '../features/auth';
import { RequireRole } from './RequireRole';
import { NotFoundPage } from './NotFoundPage';
import { ROUTES, ROLE_HOME } from '../constants/routes';
import { useAuth } from '../hooks';

/** Parent feature (UH-04) is code-split so its charts never block other roles. */
const ParentApp = lazy(() => import('../features/parent'));

function FeatureFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="text-[13px] text-text-muted">در حال بارگذاری…</p>
    </div>
  );
}

/** Scroll to top on every navigation. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** «/» — send each role to its own home (or to /login when anonymous). */
function RootRedirect() {
  const { isAuthenticated, currentUser } = useAuth();
  if (!isAuthenticated || !currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <Navigate to={ROLE_HOME[currentUser.role]} replace />;
}

/**
 * Routing contract.
 *
 * Every role area is a catch-all under its own base path. Until the owning
 * feature team (Admin / Teacher / Student / Parent) ships its pages, the
 * role area renders <FeaturePlaceholder role="…" /> so deep links never 404.
 *
 * Feature teams: keep your routes inside `/<role>/*` and request replacement
 * of the placeholder in this file — see docs/INTEGRATION_CONTRACT.md.
 */
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
          <Route index element={<FeaturePlaceholder role="admin" />} />
          <Route path="*" element={<FeaturePlaceholder role="admin" />} />
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
          <Route index element={<FeaturePlaceholder role="student" />} />
          <Route path="*" element={<FeaturePlaceholder role="student" />} />
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
          {/* Parent feature (UH-04) owns every path under /parent/* */}
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
