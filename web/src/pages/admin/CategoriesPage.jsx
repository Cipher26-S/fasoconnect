import { ListTree, Plus, Users, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { adminService } from '../../services/adminService.js';

export function CategoriesPage() {
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => adminService.categoryStats().then(setStats);

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await adminService.createCategory(form);
      setForm({ name: '', description: '' });
      await load();
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Categories">
      <p className="-mt-4 mb-6 max-w-xl text-sm text-on-surface-variant">Manage the professional trades available on the platform.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard icon={ListTree} label="Total Categories" value={stats?.total ?? '—'} />
        <StatCard icon={Wrench} label="Categories With Artisans" value={stats ? stats.categories.filter((c) => c.artisanCount > 0).length : '—'} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="h-fit rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="font-headline text-lg font-bold">New Category</h2>
          <form className="mt-4 space-y-3" onSubmit={onSubmit}>
            <input
              required
              placeholder="Category name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              placeholder="Description"
              rows={3}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-md border border-outline-variant bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {error && <p className="text-sm font-semibold text-error">{error}</p>}
            <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:brightness-105 disabled:opacity-60">
              <Plus className="h-4 w-4" /> {submitting ? 'Adding...' : 'Add Category'}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
                <tr>
                  <th className="px-5 py-3 font-mono font-medium">Category</th>
                  <th className="px-5 py-3 font-mono font-medium">Artisans</th>
                  <th className="px-5 py-3 font-mono font-medium">Requests</th>
                </tr>
              </thead>
              <tbody>
                {stats?.categories.map((category) => (
                  <tr key={category.id} className="border-t border-outline-variant">
                    <td className="px-5 py-4 font-semibold">{category.name}</td>
                    <td className="px-5 py-4 text-on-surface-variant">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {category.artisanCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-on-surface-variant">{category.requestCount}</td>
                  </tr>
                ))}
                {stats && stats.categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-10 text-center text-on-surface-variant">No categories yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
