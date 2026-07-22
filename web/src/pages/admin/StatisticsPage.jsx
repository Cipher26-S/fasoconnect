import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { adminService } from '../../services/adminService.js';

export function StatisticsPage() {
  const [userStats, setUserStats] = useState(null);
  const [requestStats, setRequestStats] = useState(null);
  const [assignmentStats, setAssignmentStats] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);

  useEffect(() => {
    adminService.userStats().then(setUserStats);
    adminService.requestStats().then(setRequestStats);
    adminService.assignmentStats().then(setAssignmentStats);
    adminService.reviewStats().then(setReviewStats);
  }, []);

  return (
    <AdminLayout title="Statistics">
      <p className="-mt-4 mb-6 max-w-xl text-sm text-on-surface-variant">Detailed breakdowns across users, service requests, assignments and reviews.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Breakdown title="Users by Role" data={userStats?.byRole} />
        <Breakdown title="Users by Status" data={userStats?.byStatus} />
        <Breakdown title="Service Requests by Status" data={requestStats?.byStatus} />
        <Breakdown title="Assignments by Status" data={assignmentStats?.byStatus} />
        <Breakdown title="Reviews by Rating" data={reviewStats?.byRating} labelSuffix=" stars" />
        <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
          <h2 className="font-headline text-lg font-bold">Service Requests Overview</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <Row label="Average budget" value={requestStats?.averageBudget ? `${requestStats.averageBudget} FCFA` : '—'} />
            <Row label="Completion rate" value={requestStats ? `${requestStats.completionRate}%` : '—'} />
            <Row label="Completed requests" value={requestStats?.completed ?? '—'} />
          </dl>
        </section>
      </div>
    </AdminLayout>
  );
}

function Breakdown({ title, data, labelSuffix = '' }) {
  const entries = data ? Object.entries(data) : [];
  const max = Math.max(1, ...entries.map(([, value]) => value));

  return (
    <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
      <h2 className="font-headline text-lg font-bold">{title}</h2>
      <div className="mt-4 space-y-3">
        {entries.map(([key, value]) => (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{key}{labelSuffix}</span>
              <span className="font-mono text-on-surface-variant">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(value / max) * 100}%` }} />
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-on-surface-variant">No data yet.</p>}
      </div>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-outline-variant pb-2 last:border-0">
      <dt className="text-on-surface-variant">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
