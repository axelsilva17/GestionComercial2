/**
 * Skeleton -- loading placeholder.
 *
 * Contract: DESIGN.md > Components > Skeleton.
 * Skeletons are always `aria-hidden` and always paired with a live region that
 * announces the load, because a screen-reader user gets nothing from a grey box.
 * The shimmer is suppressed under `prefers-reduced-motion`.
 */
export function Skeleton({ variant = 'text', className = '', ...rest }) {
  const shapes = {
    text: 'h-4 w-full',
    title: 'h-6 w-2/5',
    block: 'h-24 w-full',
    row: 'h-9 w-full',
    circle: 'size-10 rounded-full',
  }

  return (
    <div
      aria-hidden="true"
      className={[
        'bg-primary-subtle',
        'motion-safe:animate-pulse',
        shapes[variant],
        className,
      ].join(' ')}
      {...rest}
    />
  )
}

export default Skeleton
