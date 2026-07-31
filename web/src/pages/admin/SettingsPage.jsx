import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const inputClass = 'w-full rounded-md border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', city: '', bio: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        city: user.city || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      await updateProfile(form);
      setSuccess(true);
    } catch (apiError) {
      setError(apiError.message || 'Unable to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Settings">
      <p className="-mt-4 mb-6 max-w-xl text-sm text-on-surface-variant">Your administrator account details.</p>

      <section className="max-w-lg rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-container text-lg font-bold text-on-primary-container">
            {(user?.fullName || 'A').slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="font-headline text-lg font-bold">{user?.fullName}</p>
            <p className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> {user?.role}
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-3 border-t border-outline-variant pt-4" onSubmit={onSubmit}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-on-surface-variant">Email</span>
            <span className="font-semibold">{user?.email}</span>
          </div>

          <label className="block text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Full name
            <input
              required
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Phone
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            City
            <input
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              className={`mt-1 ${inputClass}`}
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Bio
            <textarea
              rows={3}
              maxLength={500}
              value={form.bio}
              onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
              className={`mt-1 resize-none ${inputClass}`}
            />
          </label>

          {error && <p className="text-sm font-semibold text-error">{error}</p>}
          {success && (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
              <CheckCircle2 className="h-4 w-4" /> Profile updated successfully.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:brightness-105 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </section>

      <section className="mt-6 max-w-lg rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
        Platform-wide configuration (feature flags, integrations, branding) is not implemented on the backend yet.
      </section>
    </AdminLayout>
  );
}
