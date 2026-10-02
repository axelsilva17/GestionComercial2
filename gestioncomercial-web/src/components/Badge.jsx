/**
 * Badge -- a compact, non-interactive status label.
 *
 * Contract: DESIGN.md > Components > Badge.
 * Colour is never the only signal: every tone has a distinct label, and callers
 * are expected to pair the badge with text. A badge is not a button -- if it
 * needs to be clickable it is a Button.
 */
const TONES = {
  neutral: 'bg-primary-subtle text-primary-subtle-ink',
  accent: 'bg-accent-subtle text-accent-ink',
  warning: 'bg-warning-subtle text-warning-ink',
  danger: 'bg-danger-subtle text-danger-ink',
  info: 'bg-info-subtle text-info-ink',
}

export function Badge({ tone = 'neutral', className = '', children, ...rest }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-sm px-2 py-0.5',
        'text-caption font-medium whitespace-nowrap',
        TONES[tone],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </span>
  )
}

export default Badge
