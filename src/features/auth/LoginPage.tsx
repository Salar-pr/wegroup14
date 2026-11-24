import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { AuthLayout } from '../../app/layouts/AuthLayout';
import { Avatar, Badge, Button, Input } from '../../components';
import { ROLES } from '../../constants/roles';
import { ROLE_HOME } from '../../constants/routes';
import { getDemoAccountByRole } from '../../data';
import { useAuth, useToast } from '../../hooks';
import { cn, isValidEmail, isValidPassword } from '../../utils';
import type { UserRole } from '../../types';

export default function LoginPage() {
  const { isAuthenticated, currentUser, login, loginAsRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('admin@school.ir');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<UserRole | null>(null);

  // Keep the form in sync with the selected role's demo credentials (demo convenience)
  useEffect(() => {
    const account = getDemoAccountByRole(selectedRole);
    setEmail(account.user.email);
    setPassword(account.password);
    setFieldErrors({});
    setFormError(null);
  }, [selectedRole]);

  // Already signed in? Go straight to the role home.
  if (isAuthenticated && currentUser) {
    return <Navigate to={ROLE_HOME[currentUser.role]} replace />;
  }

  const selectedAccount = getDemoAccountByRole(selectedRole);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const errors: { email?: string; password?: string } = {};
    if (!isValidEmail(email)) {
      errors.email = 'لطفاً یک رایانامه معتبر وارد کنید (مثال: name@school.ir).';
    }
    if (!isValidPassword(password)) {
      errors.password = 'رمز عبور باید حداقل ۶ نویسه باشد.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.ok) {
      setFormError(result.error);
      showToast('error', result.error, 'ورود ناموفق');
      return;
    }
    showToast('success', `خوش آمدید، ${result.user.name} عزیز!`, 'ورود موفق');
    navigate(ROLE_HOME[result.user.role], { replace: true });
  };

  const handleDemoLogin = async (role: UserRole) => {
    setDemoLoadingRole(role);
    try {
      const user = await loginAsRole(role);
      showToast('success', `خوش آمدید، ${user.name} عزیز!`, 'ورود با حساب نمایشی');
      navigate(ROLE_HOME[user.role], { replace: true });
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <AuthLayout>
      {/* Mobile brand mark */}
      <div className="mb-6 flex flex-col items-center gap-2 text-center lg:hidden">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-navy text-white">
          <GraduationCap size={30} aria-hidden="true" />
        </div>
        <p className="text-lg font-extrabold text-text">مدرسه‌یار</p>
        <p className="-mt-1 text-[11px] text-text-muted">سامانه یکپارچه مدیریت مدرسه</p>
      </div>

      <div className="rounded-modal border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-text">خوش آمدید</h1>
            <p className="mt-1.5 text-[13px] leading-6 text-text-muted">
              برای ورود، نقش خود را انتخاب کنید؛ سپس با حساب نمایشی یا ایمیل و رمز عبور وارد شوید.
            </p>
          </div>
          <Badge variant="info" dot={false} className="shrink-0">
            <Zap size={11} className="ms-0.5" aria-hidden="true" />
            نسخه نمایشی
          </Badge>
        </div>

        {/* ---------- Role selection ---------- */}
        <fieldset className="mt-4">
          <legend className="mb-2 text-[12px] font-bold text-text">نقش خود را انتخاب کنید</legend>
          <div className="grid grid-cols-2 gap-1.5">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const selected = role.id === selectedRole;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  aria-pressed={selected}
                  className={cn(
                    'relative flex flex-col items-start gap-1.5 rounded-card border p-2.5 text-start transition-all duration-150',
                    selected
                      ? 'border-primary bg-blue-50/60 ring-2 ring-primary/30'
                      : 'border-border bg-surface hover:border-slate-300 hover:bg-slate-50',
                  )}
                >
                  {selected && (
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                      className="absolute end-2 top-2 text-primary"
                    />
                  )}
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-btn ring-1 ring-inset',
                      role.chip,
                    )}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[13px] font-extrabold text-text">
                      {role.label}
                    </span>
                    <span className="mt-0.5 block text-[9px] leading-4 text-text-muted">
                      {role.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* ---------- Demo account quick-login ---------- */}
        <div
          key={selectedRole}
          className="mt-3 rounded-card border border-dashed border-blue-200 bg-blue-50/50 p-2.5"
        >
          <div className="flex items-center gap-3">
            <Avatar
              name={selectedAccount.user.name}
              color={selectedAccount.user.avatarColor}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold text-text">{selectedAccount.user.name}</p>
              <p className="text-[10px] text-text-muted">{selectedAccount.user.title}</p>
            </div>
            <ShieldCheck size={18} className="shrink-0 text-primary" aria-hidden="true" />
          </div>
          <dl className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-blue-100 pt-2.5 text-[10px] text-text-muted">
            <div className="flex items-center gap-1.5">
              <dt>ایمیل:</dt>
              <dd dir="ltr" className="font-mono font-semibold text-text">
                {selectedAccount.user.email}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>رمز:</dt>
              <dd dir="ltr" className="font-mono font-semibold text-text">
                {selectedAccount.password}
              </dd>
            </div>
          </dl>
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            className="mt-2.5 border border-blue-100 bg-white text-primary hover:bg-blue-50"
            isLoading={demoLoadingRole === selectedRole}
            disabled={isSubmitting || demoLoadingRole !== null}
            onClick={() => void handleDemoLogin(selectedRole)}
            leftIcon={GraduationCap}
          >
            ورود با حساب نمایشی
          </Button>
        </div>

        {/* ---------- Divider ---------- */}
        <div className="my-3 flex items-center gap-3 text-[10px] font-medium text-text-muted">
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
          یا با ایمیل و رمز عبور وارد شوید
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>

        {/* ---------- Credentials form ---------- */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
          <Input
            label="رایانامه"
            type="email"
            name="email"
            autoComplete="username"
            dir="ltr"
            required
            leftIcon={Mail}
            placeholder="name@school.ir"
            value={email}
            error={fieldErrors.email}
            onChange={(event) => {
              setEmail(event.target.value);
              setFieldErrors((prev) => ({ ...prev, email: undefined }));
              setFormError(null);
            }}
          />
          <Input
            label="رمز عبور"
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            dir="ltr"
            required
            leftIcon={Lock}
            placeholder="••••••••"
            value={password}
            error={fieldErrors.password}
            onChange={(event) => {
              setPassword(event.target.value);
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
              setFormError(null);
            }}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
                aria-pressed={showPassword}
                className="rounded-btn p-2 text-text-muted transition-colors hover:bg-slate-100 hover:text-text"
              >
                {showPassword ? (
                  <EyeOff size={17} aria-hidden="true" />
                ) : (
                  <Eye size={17} aria-hidden="true" />
                )}
              </button>
            }
          />

          {formError && (
            <p
              role="alert"
              className="rounded-btn border border-red-200 bg-red-50 px-3 py-2 text-[12px] font-medium leading-6 text-danger"
            >
              {formError}
            </p>
          )}

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-text-muted">
              حساب ندارید؟ با حساب نمایشی بالا وارد شوید.
            </span>
            <button
              type="button"
              onClick={() =>
                showToast('info', 'برای بازیابی رمز عبور با دفتر مدرسه تماس بگیرید.', 'بازیابی رمز عبور')
              }
              className="text-[11px] font-bold text-primary transition-colors hover:text-primary-dark"
            >
              رمز عبور را فراموش کرده‌ام
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            disabled={demoLoadingRole !== null}
            leftIcon={ShieldCheck}
          >
            ورود به سامانه
          </Button>
        </form>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 px-2 text-center text-[10px] leading-5 text-text-muted">
        <ShieldCheck size={13} aria-hidden="true" className="shrink-0" />
        این یک نسخهٔ نمایشی است؛ هیچ اطلاعاتی به سرور ارسال نمی‌شود و پس از بارگذاری مجدد صفحه،
        داده‌ها به حالت اولیه بازمی‌گردند.
      </p>
    </AuthLayout>
  );
}
