export function EmptyState({ title, description, actionLabel, onAction, icon: Icon }) {
  return (
    <div className="panel p-12 text-center">
      {Icon && (
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Icon />
        </div>
      )}
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
