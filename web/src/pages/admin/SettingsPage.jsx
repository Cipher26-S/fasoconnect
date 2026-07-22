import { ShieldCheck } from 'lucide-react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export function SettingsPage() {
  const { user } = useAuth();

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
        <dl className="mt-6 space-y-3 border-t border-outline-variant pt-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-on-surface-variant">Email</dt>
            <dd className="font-semibold">{user?.email}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-on-surface-variant">Phone</dt>
            <dd className="font-semibold">{user?.phone || '—'}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 max-w-lg rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest p-6 text-sm text-on-surface-variant">
        Platform-wide configuration (feature flags, integrations, branding) is not implemented on the backend yet.
      </section>
    </AdminLayout>
  );
}
