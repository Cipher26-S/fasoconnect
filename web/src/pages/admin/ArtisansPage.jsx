import { CheckCircle2, ShieldCheck, Star, UserPlus, Wrench, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { Pagination } from '../../components/admin/Pagination.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { adminService } from '../../services/adminService.js';

const emptyArtisanForm = { fullName: '', email: '', password: '', phone: '', city: '', categoryId: '', experienceYears: '', hourlyRate: '' };

const TABS = [
  { key: '', label: 'All Artisans' },
  { key: 'false', label: 'Pending Validation' },
  { key: 'true', label: 'Approved' },
];

export function ArtisansPage() {
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [creating, setCreating] = useState(false);
  const [newArtisan, setNewArtisan] = useState(emptyArtisanForm);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadStats = () => adminService.artisanStats().then(setStats);

  useEffect(() => {
    loadStats();
    adminService.categories().then((data) => setCategories(data.data ?? data));
  }, []);

  const loadArtisans = () => {
    setLoading(true);
    return adminService
      .artisans({ page, limit: 10, verified: tab || undefined, search: search || undefined })
      .then(setResult)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadArtisans();
  }, [page, tab, search]);

  const onCreateArtisan = async (event) => {
    event.preventDefault();
    setCreateSubmitting(true);
    setCreateError('');
    try {
      await adminService.createArtisan({
        ...newArtisan,
        experienceYears: Number(newArtisan.experienceYears),
        hourlyRate: newArtisan.hourlyRate ? Number(newArtisan.hourlyRate) : undefined,
      });
      setNewArtisan(emptyArtisanForm);
      setCreating(false);
      await loadArtisans();
      loadStats();
    } catch (apiError) {
      setCreateError(apiError.response?.data?.message || 'Unable to create artisan.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const setVerified = async (artisan, verified) => {
    setBusyId(artisan.id);
    try {
      await adminService.verifyArtisan(artisan.id, verified);
      setResult((current) => ({ ...current, data: current.data.map((item) => (item.id === artisan.id ? { ...item, verified } : item)) }));
      adminService.artisanStats().then(setStats);
    } finally {
      setBusyId(null);
    }
  };

  const topCategory = stats?.byCategory?.reduce((best, entry) => (entry.count > (best?.count ?? -1) ? entry : best), null);

  return (
    <AdminLayout title="Artisans Management" searchPlaceholder="Search artisans by name, category or ID..." onSearch={(value) => { setPage(1); setSearch(value); }}>
      <div className="-mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-on-surface-variant">Manage and validate professional artisans across Burkina Faso.</p>
        <button type="button" onClick={() => setCreating(true)} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:brightness-105">
          <UserPlus className="h-4 w-4" /> Add New Artisan
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Wrench}
          label="Total Artisans"
          value={stats?.registered ?? '—'}
          hint={stats ? `${stats.total} with complete profile · ${stats.incompleteProfiles} pending onboarding` : undefined}
        />
        <StatCard icon={ShieldCheck} label="Verified" value={stats?.verified ?? '—'} iconBg="bg-success/10" iconColor="text-success" />
        <StatCard icon={XCircle} label="Pending Validation" value={stats?.unverified ?? '—'} iconBg="bg-warning/10" iconColor="text-warning" />
        <StatCard icon={Star} label="Top Category" value={topCategory?.categoryName || '—'} hint={topCategory ? `${topCategory.count} active professionals` : undefined} />
      </div>

      <section className="mt-6 rounded-lg border border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-wrap items-center gap-6 border-b border-outline-variant px-5 pt-4">
          {TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => { setPage(1); setTab(item.key); }}
              className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
                tab === item.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-5 py-3 font-mono font-medium">Artisan</th>
              <th className="px-5 py-3 font-mono font-medium">Category</th>
              <th className="px-5 py-3 font-mono font-medium">Rating</th>
              <th className="px-5 py-3 font-mono font-medium">Location</th>
              <th className="px-5 py-3 font-mono font-medium">Status</th>
              <th className="px-5 py-3 font-mono font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((artisan) => (
              <tr key={artisan.id} className="border-t border-outline-variant">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-secondary-container text-xs font-bold text-on-secondary-container">
                      {artisan.user?.profilePicture ? (
                        <img src={artisan.user.profilePicture} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (artisan.user?.fullName || '?').slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <div>
                      <p className="font-semibold">{artisan.user?.fullName}</p>
                      <p className="font-mono text-xs text-on-surface-variant">ID: {artisan.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-on-surface-variant">{artisan.category?.name || '—'}</td>
                <td className="px-5 py-4">
                  {artisan.averageRating ? (
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {artisan.averageRating}
                    </span>
                  ) : (
                    <span className="italic text-on-surface-variant">New artisan</span>
                  )}
                </td>
                <td className="px-5 py-4 text-on-surface-variant">{artisan.user?.city || '—'}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${artisan.verified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                    {artisan.verified ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {artisan.verified ? (
                      <button
                        type="button"
                        disabled={busyId === artisan.id}
                        onClick={() => setVerified(artisan, false)}
                        className="rounded-md border border-outline-variant px-3 py-1.5 text-xs font-semibold text-error hover:bg-error-container disabled:opacity-40"
                      >
                        Revoke
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          disabled={busyId === artisan.id}
                          onClick={() => setVerified(artisan, true)}
                          className="flex items-center gap-1 rounded-md bg-success/10 px-3 py-1.5 text-xs font-semibold text-success hover:bg-success/20 disabled:opacity-40"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!loading && result.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-on-surface-variant">No artisans match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination page={result.pagination?.page ?? 1} totalPages={result.pagination?.totalPages ?? 1} total={result.pagination?.total ?? 0} onChange={setPage} />
      </section>

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/40 px-4" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md rounded-lg bg-surface-container-lowest p-6 shadow-modal" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="font-headline text-xl font-bold">Add New Artisan</h3>
              <button type="button" onClick={() => setCreating(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface-container-low">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form className="mt-4 space-y-3" onSubmit={onCreateArtisan}>
              <input
                required
                placeholder="Full name"
                value={newArtisan.fullName}
                onChange={(event) => setNewArtisan((current) => ({ ...current, fullName: event.target.value }))}
                className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={newArtisan.email}
                onChange={(event) => setNewArtisan((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                required
                type="password"
                placeholder="Password"
                minLength={6}
                value={newArtisan.password}
                onChange={(event) => setNewArtisan((current) => ({ ...current, password: event.target.value }))}
                className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                placeholder="Phone (optional)"
                value={newArtisan.phone}
                onChange={(event) => setNewArtisan((current) => ({ ...current, phone: event.target.value }))}
                className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                placeholder="City (optional)"
                value={newArtisan.city}
                onChange={(event) => setNewArtisan((current) => ({ ...current, city: event.target.value }))}
                className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <select
                required
                value={newArtisan.categoryId}
                onChange={(event) => setNewArtisan((current) => ({ ...current, categoryId: event.target.value }))}
                className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <input
                  required
                  type="number"
                  min={0}
                  placeholder="Experience (years)"
                  value={newArtisan.experienceYears}
                  onChange={(event) => setNewArtisan((current) => ({ ...current, experienceYears: event.target.value }))}
                  className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Hourly rate (optional)"
                  value={newArtisan.hourlyRate}
                  onChange={(event) => setNewArtisan((current) => ({ ...current, hourlyRate: event.target.value }))}
                  className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              {createError && <p className="text-sm font-semibold text-error">{createError}</p>}
              <button
                type="submit"
                disabled={createSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:brightness-105 disabled:opacity-60"
              >
                <UserPlus className="h-4 w-4" /> {createSubmitting ? 'Adding...' : 'Add Artisan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
