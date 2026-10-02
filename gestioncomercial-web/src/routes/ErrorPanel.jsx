/**
 * ErrorPanel -- a load failure.
 *
 * Kept distinct from `EmptyState` on purpose, and that distinction is the whole
 * point. `EmptyState` means "there is nothing here", which is a normal outcome
 * and reads as neutral. A failure means "we do not know what is here", and it
 * has to look different: a warning tone, a persistent message, and a retry
 * affordance instead of a create action.
 *
 * `danger-subtle` is the fill documented in DESIGN.md for error surfaces, and
 * `danger-ink` on it measures 5.91:1 in the light scheme.
 */
import { AlertTriangle, RotateCcw } from 'lucide-react'
import Button from '../components/Button.jsx'

export function ErrorPanel({
  title = 'No se pudieron cargar los datos',
  description,
  onRetry,
  retryLabel = 'Reintentar',
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-danger bg-danger-subtle p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-danger-ink"
        />
        <div className="space-y-1">
          <p className="text-heading text-danger-ink">{title}</p>
          {description && <p className="text-body text-ink-muted">{description}</p>}
        </div>
      </div>

      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCcw aria-hidden="true" className="size-4 shrink-0" />
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

export default ErrorPanel