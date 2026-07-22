import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Pagination({ page, totalPages, total, onChange }) {
  if (!total) return null;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-outline-variant px-5 py-4 text-sm text-on-surface-variant sm:flex-row">
      <p>
        Page <span className="font-semibold text-on-surface">{page}</span> of{' '}
        <span className="font-semibold text-on-surface">{totalPages}</span> &middot; {total} results
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="grid h-9 w-9 place-items-center rounded-md border border-outline-variant text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="grid h-9 w-9 place-items-center rounded-md border border-outline-variant text-on-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
