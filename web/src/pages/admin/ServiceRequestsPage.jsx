import { CheckCircle2, Clock, Eye, UserCog, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { Pagination } from '../../components/admin/Pagination.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { StatusPill } from '../../components/admin/StatusPill.jsx';
import { adminService } from '../../services/adminService.js';

const STATUSES = ['PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export function ServiceRequestsPage() {
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    adminService.requestStats().then(setStats);
  }, []);

  useEffect(() => {
    setLoading(true);
    adminService
      .serviceRequests({ page, limit: 10, status: status || undefined, search: search || undefined })
      .then(setResult)
      .finally(() => setLoading(false));
  }, [page, status, search]);

  const inFlight = (stats?.byStatus?.ASSIGNED ?? 0) + (stats?.byStatus?.ACCEPTED ?? 0) + (stats?.byStatus?.IN_PROGRESS ?? 0);

  return (
    <AdminLayout title="Service Requests" searchPlaceholder="Search requests, customers or artisans..." onSearch={(value) => { setPage(1); setSearch(value); }}>
      <div className="-mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-on-surface-variant">Monitor and manage all service orders from customers across Burkina Faso.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} label="Pending" value={stats?.byStatus?.PENDING ?? '—'} iconBg="bg-warning/10" iconColor="text-warning" />
        <StatCard icon={UserCog} label="In Progress" value={inFlight} iconBg="bg-blue-100" iconColor="text-blue-700" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats?.byStatus?.COMPLETED ?? '—'} iconBg="bg-success/10" iconColor="text-success" />
        <StatCard icon={XCircle} label="Cancelled" value={stats?.byStatus?.CANCELLED ?? '—'} iconBg="bg-error/10" iconColor="text-error" />
      </div>

      <section className="mt-6 rounded-lg border border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-wrap items-center gap-3 border-b border-outline-variant px-5 py-4">
          <span className="text-sm font-semibold text-on-surface-variant">Filter by:</span>
          <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} className="rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm">
            <option value="">All Statuses</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>{value.replace('_', ' ')}</option>
            ))}
          </select>
          {status && (
            <button type="button" onClick={() => setStatus('')} className="text-sm font-semibold text-primary hover:underline">
              Clear
            </button>
          )}
          <div className="flex-1" />
          <p className="text-sm text-on-surface-variant">
            Viewing <span className="font-semibold text-on-surface">{result.data.length}</span> of{' '}
            <span className="font-semibold text-on-surface">{result.pagination?.total ?? 0}</span>
          </p>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-5 py-3 font-mono font-medium">Request ID</th>
              <th className="px-5 py-3 font-mono font-medium">Customer</th>
              <th className="px-5 py-3 font-mono font-medium">Service</th>
              <th className="px-5 py-3 font-mono font-medium">Date</th>
              <th className="px-5 py-3 font-mono font-medium">Assigned Artisan</th>
              <th className="px-5 py-3 font-mono font-medium">Status</th>
              <th className="px-5 py-3 font-mono font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((request) => (
              <tr key={request.id} className="border-t border-outline-variant align-top">
                <td className="px-5 py-4 font-mono text-xs text-on-surface-variant">#{request.id.slice(0, 8).toUpperCase()}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary-container text-xs font-bold text-on-secondary-container">
                      {(request.customer?.fullName || '?').slice(0, 2).toUpperCase()}
                    </span>
                    {request.customer?.fullName || '—'}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <p className="font-semibold">{request.title}</p>
                  <p className="text-xs text-on-surface-variant">{request.location || request.customer?.city || '—'}</p>
                </td>
                <td className="px-5 py-4 text-on-surface-variant">{new Date(request.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                <td className="px-5 py-4 text-on-surface-variant">
                  {request.artisan?.user?.fullName || <span className="italic text-outline">Unassigned</span>}
                </td>
                <td className="px-5 py-4">
                  <StatusPill status={request.status} />
                </td>
                <td className="px-5 py-4 text-right">
                  <button type="button" onClick={() => setSelected(request)} className="grid h-8 w-8 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container-low" title="View">
                    <Eye className="ml-auto h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {!loading && result.data.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-on-surface-variant">No service requests match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination page={result.pagination?.page ?? 1} totalPages={result.pagination?.totalPages ?? 1} total={result.pagination?.total ?? 0} onChange={setPage} />
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/40 px-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-lg bg-surface-container-lowest p-6 shadow-modal" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-on-surface-variant">#{selected.id.slice(0, 8).toUpperCase()}</p>
                <h3 className="font-headline text-xl font-bold">{selected.title}</h3>
              </div>
              <StatusPill status={selected.status} />
            </div>
            <p className="mt-4 text-sm text-on-surface-variant">{selected.description}</p>
            <dl className="mt-4 space-y-3 border-t border-outline-variant pt-4 text-sm">
              <Row label="Customer" value={selected.customer?.fullName || '—'} />
              <Row label="Artisan" value={selected.artisan?.user?.fullName || 'Unassigned'} />
              <Row label="Category" value={selected.category?.name || '—'} />
              <Row label="Location" value={selected.location || '—'} />
              <Row label="Budget" value={selected.budget ? `${selected.budget} FCFA` : '—'} />
            </dl>
            <button type="button" onClick={() => setSelected(null)} className="mt-6 w-full rounded-md border border-outline-variant py-2.5 text-sm font-semibold hover:bg-surface-container-low">
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
