/**
 * PagePlaceholder -- the landing pad a screen is composed onto.
 *
 * Contract: DESIGN.md > Layout > Page shell.
 * Every screen opens with the same header (title, description, actions) so the
 * vertical rhythm is identical across routes. This component exists so T4-T6
 * fill in the body instead of re-deciding the frame -- including the page-level
 * action button, which is part of the frame and not of the screen.
 *
 * `actions` renders bottom-aligned on narrow viewports rather than beside the
 * title, so a primary CTA is never squeezed into a 375px column.
 */
import Card from './Card.jsx'

export function PagePlaceholder({ title, description, actions, task, children }) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-display text-ink">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-body text-ink-muted">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        )}
      </header>

      {children ?? (
        <Card>
          <div className="flex flex-col items-start gap-2">
            <span className="rounded-sm bg-primary-subtle px-2 py-0.5 font-mono text-caption text-primary-subtle-ink">
              {task}
            </span>
            <p className="text-body text-ink-muted">
              Pantalla reservada. Se construye sobre las primitivas de{' '}
              <code className="font-mono text-mono">src/components/</code> sin
              re-estilar nada.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default PagePlaceholder
