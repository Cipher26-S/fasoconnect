import { Lock, LogIn, Mail, ShieldCheck, ShieldQuestion } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export function LoginPage() {
  const { login, logout, isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/';

  if (isAuthenticated && user?.role === 'ADMIN') return <Navigate to={redirectTo} replace />;

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const loggedInUser = await login(form);
      if (loggedInUser.role !== 'ADMIN') {
        await logout();
        setError("Ce compte n'a pas les droits administrateur.");
        setSubmitting(false);
        return;
      }
      navigate(redirectTo, { replace: true });
    } catch (apiError) {
      setError(apiError.message || 'Connexion impossible.');
      setSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-4 py-12 font-sans text-on-surface">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(#f97316 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
      />
      <div className="z-10 w-full max-w-[440px] rounded-xl border border-outline-variant bg-surface-container-lowest p-10 shadow-ambient">
        <div className="mb-8 flex flex-col items-center">
          <span className="mb-4 grid h-16 w-16 place-items-center rounded-lg bg-primary text-on-primary">
            <ShieldCheck className="h-9 w-9" />
          </span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary">FasoConnect</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">Admin Console</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-on-surface-variant">Admin email</span>
            <span className="relative flex items-center">
              <Mail className="pointer-events-none absolute left-3 h-[18px] w-[18px] text-on-surface-variant" />
              <input
                type="email"
                required
                placeholder="admin@fasoconnect.com"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded border border-outline-variant bg-surface py-2.5 pl-10 pr-3 text-sm outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </span>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-on-surface-variant">Password</span>
            <span className="relative flex items-center">
              <Lock className="pointer-events-none absolute left-3 h-[18px] w-[18px] text-on-surface-variant" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded border border-outline-variant bg-surface py-2.5 pl-10 pr-3 text-sm outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </span>
          </label>

          {error && (
            <p className="flex items-center gap-2 rounded-lg bg-error-container px-3 py-2 text-sm font-semibold text-error">
              <ShieldQuestion className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-headline text-base font-semibold text-on-primary transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-70"
          >
            {submitting ? 'Connexion...' : 'Login'}
            <LogIn className="h-[18px] w-[18px]" />
          </button>
        </form>

        <div className="mt-8 border-t border-outline-variant pt-6 text-center">
          <p className="text-sm text-on-surface-variant">Authorized access only. Use of this system is monitored.</p>
          <div className="mt-3 flex justify-center gap-4 text-[11px] font-semibold text-outline">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure SSL
            </span>
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3.5 w-3.5" /> Encryption active
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
