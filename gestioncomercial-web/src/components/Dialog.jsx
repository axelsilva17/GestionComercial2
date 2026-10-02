/**
 * Dialog -- modal dialog.
 *
 * Contract: DESIGN.md > Components > Dialog.
 * Owns the full focus lifecycle, because getting it wrong is the single most
 * common accessibility failure in an internal tool:
 *  - on open, focus moves into the dialog (first control, or the panel itself)
 *  - Tab and Shift+Tab cycle within the dialog and cannot escape it
 *  - Escape closes
 *  - on close, focus returns to whatever opened it
 *  - background scroll is locked, and the scrim is a token, not a raw rgba
 */
import { X } from 'lucide-react'
import { useCallback, useEffect, useId, useRef } from 'react'
import Button from './Button.jsx'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function Dialog({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  closeLabel = 'Cerrar',
  children,
}) {
  const panelRef = useRef(null)
  const restoreFocusRef = useRef(null)
  const titleId = useId()
  const descriptionId = useId()

  const getFocusable = useCallback(
    () => Array.from(panelRef.current?.querySelectorAll(FOCUSABLE) ?? []),
    [],
  )

  // Open: remember the trigger, move focus in, lock background scroll.
  useEffect(() => {
    if (!open) return

    restoreFocusRef.current = document.activeElement
    const [first] = getFocusable()
    ;(first ?? panelRef.current)?.focus()

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflow
      // Guard against the trigger having been unmounted in the meantime.
      if (restoreFocusRef.current instanceof HTMLElement) {
        restoreFocusRef.current.focus()
      }
    }
  }, [open, getFocusable])

  // Keys: Escape closes, Tab is trapped.
  useEffect(() => {
    if (!open) return

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusable()
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, getFocusable])

  if (!open) return null

  const widths = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }

  return (
    <div
      className="fixed inset-0 z-[var(--gc-z-dialog)] flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Scrim: decorative. The dismissal behaviour lives on the panel's own
          cancel button and on Escape, so a screen-reader user is never offered
          a nameless clickable region. */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-overlay"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={[
          'relative flex max-h-[85vh] w-full flex-col overflow-hidden',
          'rounded-lg border border-line bg-surface shadow-lg',
          widths[size],
        ].join(' ')}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-heading text-ink">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-0.5 text-caption text-ink-subtle">
                {description}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X aria-hidden="true" className="size-4" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-line bg-surface-sunken px-5 py-3">
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}

export default Dialog
