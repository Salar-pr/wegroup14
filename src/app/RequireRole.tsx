import type { ReactNode } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { ROUTES, ROLE_HOME, ROLE_LABELS } from '../constants/routes';
import { useAuth } from '../hooks';
import type { UserRole } from '../types';

interface RequireRoleProps {
  role: UserRole;
  children: ReactNode;
}

/**
 * Route guard — NOT real authentication, just demo gating.
 * - Anonymous visitors are sent to /login.
 * - Authenticated users with a different role see a friendly 403 screen.
 */
export function RequireRole({ role, children }: RequireRoleProps) {
  const { isAuthenticated, currentUser } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location.pathname }} />;
  }

  if (currentUser.role !== role) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-modal bg-red-50 text-danger">
          <ShieldX size={30} aria-hidden="true" />
        </div>
        <h1 className="text-xl font-extrabold text-text">دسترسی غیرمجاز</h1>
        <p className="max-w-sm text-[13px] leading-7 text-text-muted">
          حساب کاربری «{ROLE_LABELS[currentUser.role]}» شما اجازهٔ ورود به این بخش را ندارد.
          برای دسترسی، با حساب نمایشی مناسب وارد شوید.
        </p>
        <Link
          to={ROLE_HOME[currentUser.role]}
          className="inline-flex h-11 items-center justify-center rounded-btn bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
        >
          بازگشت به پیشخوان {ROLE_LABELS[currentUser.role]}
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
