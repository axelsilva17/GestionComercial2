/**
 * Toast -- one transient notification.
 *
 * Contract: DESIGN.md > Components > Toast.
 * Every tone pairs a distinct icon with a text label, so the meaning survives
 * without colour perception. The dismiss control is a real button with a label.
 */
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import Button from './Button.jsx'

// All four rails use the `-ink` step: the strong end of each ramp, which is the
// only one that clears 3:1 against the surface fill at 4px.
const TONES = {
  info: { icon: Info, iconClass: 'text-info-ink', rail: 'border-l-info-ink' },
  accent: {
    icon: CheckCircle2,
    iconClass: 'text-accent-ink',
    rail: 'border-l-accent-ink',
  },
  warning: {
    icon: AlertCircle,
    iconClass: 'text-warning-ink',
    rail: 'border-l-warning-ink',
  },
  danger: { icon: XCircle, iconClass: 'text-danger-ink', rail: 'border-l-danger-ink' },
}

export function Toast({ toast, onDismiss }) {
  const { icon: Icon, iconClass, rail } = TONES[toast.tone] ?? TONES.info

  return (
    <div
      className={[
        'pointer-events-auto flex w-full max-w-sm items-start gap-3',
        'rounded-md border border-line border-l-4 bg-surface p-3 shadow-md',
        'motion-safe:animate-toast-in',
        rail,
      ].join(' ')}
    >
      <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${iconClass}`} />

      <div className="min-w-0 flex-1">
        <p className="text-label text-ink">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-caption text-ink-muted">{toast.description}</p>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label="Descartar notificación"
        onClick={() => onDismiss(toast.id)}
        className="-mt-1 -mr-1"
      >
        <X aria-hidden="true" className="size-3.5" />
      </Button>
    </div>
  )
}

export default Toast
