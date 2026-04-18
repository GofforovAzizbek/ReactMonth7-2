export function ErrorState({ message, onRetry, className = "" }) {
  return (
    <div
      className={`rounded-[24px] border border-[#e5e7eb] bg-white p-8 text-center ${className}`}
    >
      <p className="mb-4 text-base text-[#ff3333]">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="inline-flex h-11 items-center rounded-full bg-black px-6 text-sm font-medium text-white transition hover:bg-black/85"
        >
          Try Again
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[24px] border border-[#e5e7eb] bg-white p-8 text-center">
      <h3 className="mb-2 text-2xl font-bold text-black">{title}</h3>
      <p className="mx-auto mb-5 max-w-[420px] text-sm text-black/60">
        {description}
      </p>
      {action}
    </div>
  );
}
