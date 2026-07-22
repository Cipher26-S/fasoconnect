import { MessageSquare, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { Pagination } from '../../components/admin/Pagination.jsx';
import { StatCard } from '../../components/admin/StatCard.jsx';
import { adminService } from '../../services/adminService.js';

export function ReviewsPage() {
  const [stats, setStats] = useState(null);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ data: [], pagination: { page: 1, totalPages: 1, total: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.reviewStats().then(setStats);
  }, []);

  useEffect(() => {
    setLoading(true);
    adminService.reviews({ page, limit: 10 }).then(setResult).finally(() => setLoading(false));
  }, [page]);

  return (
    <AdminLayout title="Reviews">
      <p className="-mt-4 mb-6 max-w-xl text-sm text-on-surface-variant">Customer feedback submitted across all completed service requests.</p>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={MessageSquare} label="Total Reviews" value={stats?.total ?? '—'} />
        <StatCard icon={Star} label="Average Rating" value={stats?.averageRating ?? '—'} iconBg="bg-primary-container" iconColor="text-primary" />
        <StatCard icon={Star} label="5-Star Reviews" value={stats?.byRating?.[5] ?? '—'} />
      </div>

      <section className="mt-6 rounded-lg border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-xs uppercase tracking-wide text-on-surface-variant">
            <tr>
              <th className="px-5 py-3 font-mono font-medium">Reviewer</th>
              <th className="px-5 py-3 font-mono font-medium">Artisan</th>
              <th className="px-5 py-3 font-mono font-medium">Service</th>
              <th className="px-5 py-3 font-mono font-medium">Rating</th>
              <th className="px-5 py-3 font-mono font-medium">Comment</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((review) => (
              <tr key={review.id} className="border-t border-outline-variant align-top">
                <td className="px-5 py-4">{review.reviewer?.fullName || '—'}</td>
                <td className="px-5 py-4 text-on-surface-variant">{review.reviewee?.fullName || '—'}</td>
                <td className="px-5 py-4 text-on-surface-variant">{review.serviceRequest?.title || '—'}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-1 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {review.rating}
                  </span>
                </td>
                <td className="max-w-xs px-5 py-4 text-on-surface-variant">{review.comment || <span className="italic">No comment</span>}</td>
              </tr>
            ))}
            {!loading && result.data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-on-surface-variant">No reviews yet.</td>
              </tr>
            )}
          </tbody>
        </table>

        <Pagination page={result.pagination?.page ?? 1} totalPages={result.pagination?.totalPages ?? 1} total={result.pagination?.total ?? 0} onChange={setPage} />
      </section>
    </AdminLayout>
  );
}
