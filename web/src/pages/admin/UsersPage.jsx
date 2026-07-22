import { Ban, CheckCircle2, Eye, UserCheck, UserPlus, Users as UsersIcon, UserX, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { Pagination } from '../../components/admin/Pagination.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { StatusPill } from '../../components/admin/StatusPill.jsx';
import { adminService } from '../../services/adminService.js';

const ROLE_LABELS = { ADMIN: 'Admin', CUSTOMER: 'Customer', ARTISAN: 'Artisan' };

export function UsersPage() {
  const [stats, setStats] = useState(null);
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    adminService.userStats().then(setStats);
  }, []);

  useEffect(() => {
    setLoading(true);
    adminService
      .users({ page, limit: 10, role: role || undefined, status: status || undefined, search: search || undefined })
      .then(setResult)
      .finally(() => setLoading(false));
  }, [page, role, status, search]);

  const toggleStatus = async (user) => {
    setBusyId(user.id);
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminService.updateUserStatus(user.id, nextStatus);
      setResult((current) => ({
        ...current,
        data: current.data.map((item) => (item.id === user.id ? { ...item, status: nextStatus } : item)),
      }));
      adminService.userStats().then(setStats);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout title="Users Management" searchPlaceholder="Search for users, artisans..." onSearch={(value) => { setPage(1); setSearch(value); }}>
      <div className="-mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-on-surface-variant">Manage and monitor all platform users and their activity status.</p>
        <button type="button" className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:brightness-105">
          <UserPlus className="h-4 w-4" /> Add New User
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={UsersIcon} label="Total Users" value={stats?.total ?? '—'} />
        <StatCard icon={UserCheck} label="Active" value={stats?.byStatus?.ACTIVE ?? '—'} iconBg="bg-success/10" iconColor="text-success" />
        <StatCard icon={UsersIcon} label="Artisans" value={stats?.byRole?.ARTISAN ?? '—'} />
        <StatCard icon={UserX} label="Suspended" value={stats?.byStatus?.SUSPENDED ?? '—'} iconBg="bg-error/10" iconColor="text-error" />
      </div>

      <section className="mt-6 rounded-lg border border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-wrap items-center gap-3 border-b border-outline-variant px-5 py-4">
          <select value={role} onChange={(event) => { setPage(1); setRole(event.target.value); }} className="rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm">
            <option value="">Role: All</option>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select value={status} onChange={(event) => { setPage(1); setStatus(event.target.value); }} className="rounded-md border border-outline-variant bg-surface px-3 py-2 text-sm">
            <option value="">Status: All</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <div className="flex-1" />
          <p className="text-sm text-on-surface-variant">
            Showing <span className="font-semibold text-on-surface">{result.data.length}</span> of{' '}
            <span className="font-semibold text-on-surface">{result.pagination?.total ?? 0}</span> users
          </p>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-5 py-3 font-mono font-medium">User</th>
              <th className="px-5 py-3 font-mono font-medium">Email</th>
              <th className="px-5 py-3 font-mono font-medium">Role</th>
              <th className="px-5 py-3 font-mono font-medium">Status</th>
              <th className="px-5 py-3 font-mono font-medium">Join Date</th>
              <th className="px-5 py-3 font-mono font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((user) => (
              <tr key={user.id} className="border-t border-outline-variant">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-secondary-container text-xs font-bold text-on-secondary-container">
                      {user.profilePicture ? <img src={user.profilePicture} alt="" className="h-full w-full object-cover" /> : user.fullName.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="font-mono text-xs text-on-surface-variant">ID: {user.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-on-surface-variant">{user.email}</td>
                <td className="px-5 py-4">
                  <span className="rounded bg-surface-container-high px-2 py-1 text-xs font-semibold">{ROLE_LABELS[user.role] || user.role}</span>
                </td>
                <td className="px-5 py-4">
                  <StatusPill status={user.status} />
                </td>
                <td className="px-5 py-4 text-on-surface-variant">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" onClick={() => setSelected(user)} className="grid h-8 w-8 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container-low" title="View">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={busyId === user.id}
                      onClick={() => toggleStatus(user)}
                      title={user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      className="grid h-8 w-8 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
                    >
                      {user.status === 'ACTIVE' ? <Ban className="h-4 w-4 text-error" /> : <CheckCircle2 className="h-4 w-4 text-success" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && result.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-on-surface-variant">No users match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination page={result.pagination?.page ?? 1} totalPages={result.pagination?.totalPages ?? 1} total={result.pagination?.total ?? 0} onChange={setPage} />
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/40 px-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md rounded-lg bg-surface-container-lowest p-6 shadow-modal" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h3 className="font-headline text-xl font-bold">{selected.fullName}</h3>
              <button type="button" onClick={() => setSelected(null)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-surface-container-low">
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Email" value={selected.email} />
              <Row label="Phone" value={selected.phone || '—'} />
              <Row label="Role" value={ROLE_LABELS[selected.role] || selected.role} />
              <Row label="Status" value={<StatusPill status={selected.status} />} />
              <Row label="City" value={selected.city || '—'} />
              <Row label="Joined" value={new Date(selected.createdAt).toLocaleDateString()} />
            </dl>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-outline-variant pb-2">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
