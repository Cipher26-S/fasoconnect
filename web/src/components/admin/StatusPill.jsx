const tones = {
  ACTIVE: 'bg-success/10 text-success',
  SUSPENDED: 'bg-error/10 text-error',
  PENDING: 'bg-warning/10 text-warning',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-indigo-100 text-indigo-700',
  IN_PROGRESS: 'bg-primary/10 text-primary',
  COMPLETED: 'bg-success/10 text-success',
  CANCELLED: 'bg-error/10 text-error',
  REJECTED: 'bg-error/10 text-error',
  true: 'bg-success/10 text-success',
  false: 'bg-warning/10 text-warning',
};

const labels = {
  true: 'APPROVED',
  false: 'PENDING',
};

export function StatusPill({ status }) {
  const key = String(status);
  return (
    <span className={`inline-flex rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${tones[key] || 'bg-surface-container-high text-on-surface-variant'}`}>
      {labels[key] || status || 'N/A'}
    </span>
  );
}
