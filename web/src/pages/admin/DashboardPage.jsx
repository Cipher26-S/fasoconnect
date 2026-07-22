import { Bell, ClipboardList, Download, Plus, Users, UserCog, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { StatusPill } from '../../components/admin/StatusPill.jsx';
import { adminService } from '../../services/adminService.js';

const DONUT_COLORS = ['#f97316', '#0f172a', '#64748b', '#fb923c', '#94a3b8', '#c2410c'];

export function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [artisanStats, setArtisanStats] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.summary(),
      adminService.artisanStats(),
      adminService.monthly(7),
      adminService.serviceRequests({ limit: 4 }),
    ])
      .then(([summaryData, artisanData, monthlyData, requestsData]) => {
        setSummary(summaryData);
        setArtisanStats(artisanData);
        setMonthly(monthlyData);
        setRecentRequests(requestsData.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    if (!monthly) return [];
    return monthly.serviceRequests.map((entry, index) => ({
      month: formatMonth(entry.month),
      requests: entry.count,
      users: monthly.userRegistrations[index]?.count ?? 0,
    }));
  }, [monthly]);

  const donutData = useMemo(() => {
    if (!artisanStats) return [];
    return artisanStats.byCategory
      .filter((entry) => entry.count > 0)
      .map((entry) => ({ name: entry.categoryName || 'Uncategorized', value: entry.count }));
  }, [artisanStats]);

  const totals = summary?.totals || {};
  const performance = summary?.performance || {};
  const verificationRate = artisanStats?.total ? Math.round((artisanStats.verified / artisanStats.total) * 100) : 0;

  return (
    <AdminLayout title="Tableau de bord">
      <div className="-mt-4 mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-sm text-on-surface-variant">Monitoring system performance and operational flows in Burkina Faso.</p>
        <button
          type="button"
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:brightness-105"
        >
          <Download className="h-4 w-4" /> Export Data
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={loading ? '—' : totals.users ?? 0} hint="All platform accounts" />
        <StatCard icon={UserCog} label="Total Customers" value={loading ? '—' : (totals.users ?? 0) - (totals.artisans ?? 0)} hint="Service seekers" />
        <StatCard icon={Wrench} label="Total Artisans" value={loading ? '—' : totals.artisans ?? 0} hint="Registered professionals" />
        <StatCard icon={ClipboardList} label="Pending Requests" value={loading ? '—' : performance.completionRate !== undefined ? (totals.serviceRequests ?? 0) - (performance.completedRequests ?? 0) : '—'} hint="Awaiting assignment" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="font-headline text-lg font-bold">Monthly Requests</h2>
          <p className="text-sm text-on-surface-variant">Volume of service requests over the last {chartData.length} months.</p>
          <div className="mt-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ left: -20, right: 10 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Line type="monotone" dataKey="requests" stroke="#f97316" strokeWidth={3} dot={false} name="Service requests" />
                <Line type="monotone" dataKey="users" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} name="New users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="font-headline text-lg font-bold">Artisans by Category</h2>
          <p className="text-sm text-on-surface-variant">Diversity of professional skills.</p>
          <div className="relative mt-2 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {donutData.map((entry, index) => (
                    <Cell key={entry.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-headline text-2xl font-bold">{artisanStats?.total ?? 0}</p>
                <p className="text-xs text-on-surface-variant">Total</p>
              </div>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {donutData.slice(0, 4).map((entry, index) => (
              <li key={entry.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }} />
                  {entry.name}
                </span>
                <span className="font-semibold">{artisanStats?.total ? Math.round((entry.value / artisanStats.total) * 100) : 0}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center justify-between px-6 py-5">
            <h2 className="font-headline text-lg font-bold">Recent Service Requests</h2>
            <button type="button" onClick={() => navigate('/service-requests')} className="text-sm font-semibold text-primary hover:underline">
              View All Requests
            </button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="border-y border-outline-variant bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
              <tr>
                <th className="px-6 py-3 font-mono font-medium">Client</th>
                <th className="px-6 py-3 font-mono font-medium">Service</th>
                <th className="px-6 py-3 font-mono font-medium">Location</th>
                <th className="px-6 py-3 font-mono font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((request) => (
                <tr key={request.id} className="border-b border-outline-variant last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary-container text-xs font-bold text-on-secondary-container">
                        {(request.customer?.fullName || '?').slice(0, 2).toUpperCase()}
                      </span>
                      {request.customer?.fullName || 'Client'}
                    </div>
                  </td>
                  <td className="px-6 py-4">{request.title}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{request.location || request.customer?.city || '—'}</td>
                  <td className="px-6 py-4">
                    <StatusPill status={request.status} />
                  </td>
                </tr>
              ))}
              {!loading && recentRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                    No service requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <div className="space-y-6">
          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-on-primary">
              <Plus className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-headline text-lg font-bold">Create Category</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Add a new professional trade to the ecosystem.</p>
            <button
              type="button"
              onClick={() => navigate('/categories')}
              className="mt-4 w-full rounded-md border border-outline-variant py-2.5 text-sm font-semibold hover:bg-surface-container-low"
            >
              New Category
            </button>
          </section>

          <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-on-secondary">
              <Bell className="h-6 w-6" />
            </span>
            <h3 className="mt-4 font-headline text-lg font-bold">Notifications</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Review platform-wide notification activity.</p>
            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="mt-4 w-full rounded-md border border-outline-variant py-2.5 text-sm font-semibold hover:bg-surface-container-low"
            >
              View Notifications
            </button>
          </section>

          <section className="rounded-lg bg-primary p-6 text-on-primary">
            <p className="text-xs font-bold uppercase tracking-widest">System Health</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-white" /> All systems operational
            </p>
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/30">
              <div className="h-full rounded-full bg-white" style={{ width: `${verificationRate}%` }} />
            </div>
            <p className="mt-2 text-xs">{verificationRate}% artisan verification rate reached.</p>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

function formatMonth(key) {
  const [year, month] = key.split('-');
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
  return date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
}
