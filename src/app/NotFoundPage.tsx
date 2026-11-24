import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useAuth } from '../hooks';
import { ROLE_HOME, ROUTES } from '../constants/routes';

export function NotFoundPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const home =
    isAuthenticated && currentUser ? ROLE_HOME[currentUser.role] : ROUTES.LOGIN;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-modal bg-slate-100 text-text-muted">
        <Compass size={30} aria-hidden="true" />
      </div>
      <p className="text-[13px] font-bold text-text-muted">خطای ۴۰۴</p>
      <h1 className="-mt-2 text-2xl font-extrabold text-text">صفحه‌ای که دنبال آن هستید پیدا نشد</h1>
      <p className="max-w-sm text-[13px] leading-7 text-text-muted">
        ممکن است آدرس را اشتباه وارد کرده باشید یا صفحه جابه‌جا شده باشد.
      </p>
      <Link
        to={home}
        className="inline-flex h-11 items-center justify-center rounded-btn bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
      >
        بازگشت به صفحهٔ اصلی
      </Link>
    </div>
  );
}
