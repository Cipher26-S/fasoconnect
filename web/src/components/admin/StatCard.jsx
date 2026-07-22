export function StatCard({ icon: Icon, label, value, hint, iconBg = 'bg-primary-container', iconColor = 'text-primary' }) {
  return (
    <article className="rounded-lg border border-outline-variant bg-surface-container-lowest p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm text-on-surface-variant">{label}</p>
        {Icon && (
          <span className={`grid h-9 w-9 place-items-center rounded-md ${iconBg} ${iconColor}`}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
        )}
      </div>
      <p className="mt-2 font-headline text-3xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-on-surface-variant">{hint}</p>}
    </article>
  );
}
