/**
 * The surface definition, exported so anything that needs "a card-shaped box"
 * consumes the same tokens instead of retyping them.
 *
 * A tile (`routes/KpiTile.jsx`) genuinely needs a card's border, fill and
 * elevation -- but it must not become a `<section>`, because four KPI regions are
 * landmark noise for a screen-reader user and buy nothing. Composing `Card`
 * would force that choice; retyping the classes invites drift, which is how the
 * tiles ended up with a stale `shadow-xs` while the rest of the app moved.
 * One exported constant, no growth in `Card`'s own API.
 */
export const CARD_SURFACE = 'rounded-lg border border-line bg-surface shadow-xs'

/**
 * Card -- the only surface that may carry elevation.
 *
 * Contract: DESIGN.md > Components > Card.
 * A card is a border plus one shadow step. It never nests: a card inside a card
 * is a sign the inner one should be a section inside the outer one.
 */
export function Card({
  title,
  description,
  actions,
  footer,
  padded = true,
  className = '',
  children,
  ...rest
}) {
  const hasHeader = title || description || actions

  return (
    <section className={`${CARD_SURFACE} ${className}`} {...rest}>
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-heading text-ink">{title}</h2>}
            {description && (
              <p className="mt-0.5 text-caption text-ink-subtle">{description}</p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}

      <div className={padded ? 'p-5' : ''}>{children}</div>

      {footer && (
        <footer className="border-t border-line px-5 py-3">{footer}</footer>
      )}
    </section>
  )
}

export default Card
