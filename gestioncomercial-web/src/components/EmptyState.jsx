/**
 * EmptyState -- "there is nothing here yet", as opposed to an error or a load.
 *
 * Contract: DESIGN.md > Components > EmptyState.
 * Distinct from an error state on purpose: an empty result is a normal outcome
 * and must not be styled as a failure.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  children,
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 px-6 py-12 text-center ${className}`}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="flex size-11 items-center justify-center rounded-full bg-primary-subtle text-ink-subtle"
        >
          {icon}
        </div>
      )}

      <div className="max-w-md space-y-1">
        <p className="text-heading text-ink">{title}</p>
        {description && <p className="text-body text-ink-muted">{description}</p>}
        {children}
      </div>

      {action && <div className="mt-1 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}

export default EmptyState
