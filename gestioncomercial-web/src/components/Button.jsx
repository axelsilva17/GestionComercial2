/**
 * Button -- the only way to trigger an action in the application.
 *
 * Contract: DESIGN.md > Components > Button.
 * Rules enforced here rather than left to the caller:
 *  - an icon-only button must carry an accessible name
 *  - `loading` implies disabled, `aria-busy`, and a non-translating width
 *  - every variant is a token reference, never a raw value
 */
import { Loader2 } from 'lucide-react'

/** Shared shape. Focus is not here on purpose: the base layer owns the ring. */
const BASE =
  'inline-flex items-center cursor-pointer justify-center gap-2 rounded-md border font-medium ' +
  'transition-colors duration-[var(--gc-duration-fast)] ease-[var(--gc-ease-ui)] ' +
  'disabled:cursor-not-allowed'

const VARIANTS = {
  /** Primary CTA. Inverse ink on accent-strong, measured at 5.48:1. */
  primary:
    'border-transparent bg-accent-strong text-ink-inverse ' +
    'hover:bg-accent-strong-hover active:bg-accent-strong-active',
  /** Secondary action. Surface fill, decorative border. */
  secondary:
    'border-line-strong bg-surface text-ink ' +
    'hover:bg-surface-hover active:bg-surface-sunken',
  /** Tertiary action for toolbars and table rows. */
  ghost:
    'border-transparent bg-transparent text-ink-muted ' +
    'hover:bg-surface-hover hover:text-ink active:bg-surface-sunken',
  /** Destructive commit. White on danger, measured at 4.83:1. */
  danger:
    'border-transparent bg-danger text-ink-inverse ' +
    'hover:bg-danger-hover active:bg-danger-hover',
  /** Text action. Still a real button -- never an anchor-styled click handler. */
  link:
    'border-transparent bg-transparent text-accent-ink underline-offset-4 ' +
    'hover:underline active:text-accent-strong',
}

const SIZES = {
  sm: 'h-9 px-3 text-label',
  md: 'h-10 px-4 text-body',
  lg: 'h-11 px-5 text-body',
}

/** Square variants. The painted box stays small; the hit area grows below. */
const ICON_SIZES = {
  sm: 'size-9',
  md: 'size-10',
  lg: 'size-11',
}

export function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  loading = false,
  disabled = false,
  iconOnly = false,
  className = '',
  children,
  // React 19 passes `ref` as an ordinary prop to function components; taking it
  // explicitly keeps the intent readable at every call site.
  ref,
  ...rest
}) {
  if (iconOnly && !rest['aria-label'] && !rest['aria-labelledby']) {
    throw new Error(
      'Button: an icon-only button must provide `aria-label` or `aria-labelledby`.',
    )
  }

  const isDisabled = disabled || loading

  // Icon-only controls are visually 32/36/40px. The transparent negative-offset
  // pseudo element expands the *hit* area to 44px minimum without changing the
  // painted box, so dense toolbars stay dense and remain touch-legible.
  const hitArea = iconOnly
    ? 'relative after:absolute after:inset-0 after:-m-2 after:content-[""]'
    : ''

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        BASE,
        VARIANTS[variant],
        iconOnly ? ICON_SIZES[size] : SIZES[size],
        hitArea,
        isDisabled &&
          'pointer-events-none border-line bg-disabled-bg text-disabled-ink shadow-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading && (
        <Loader2
          aria-hidden="true"
          className="size-4 shrink-0 animate-spin motion-reduce:animate-none"
        />
      )}
      {children}
    </button>
  )
}

export default Button
