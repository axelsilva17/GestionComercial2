/**
 * ToastProvider -- transient notification stack.
 *
 * Contract: DESIGN.md > Components > Toast.
 *
 * Component-only module on purpose: the context and its hook live in
 * `useToast.js` so this file exports a single component, which keeps the
 * react-refresh fast-path intact.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Toast } from './Toast.jsx'
import { ToastContext } from './useToast.js'

const DEFAULT_DURATION = 5000

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextId = useRef(0)
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const push = useCallback(
    ({ tone = 'info', title, description, duration = DEFAULT_DURATION }) => {
      const id = `toast-${nextId.current++}`
      setToasts((current) => [...current, { id, tone, title, description }])

      // Errors persist until dismissed: a transient failure notice is a notice
      // the user reads after it has already disappeared.
      if (tone !== 'danger' && duration > 0) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), duration),
        )
      }

      return id
    },
    [dismiss],
  )

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss])

  // A pending auto-dismiss must not fire into an unmounted tree.
  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of pending.values()) clearTimeout(timer)
      pending.clear()
    }
  }, [])

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* `polite`, not `assertive`: a confirmation should not interrupt whatever
          the user is currently typing into. Errors arrive as inline text too. */}
      <div
        role="region"
        aria-label="Notificaciones"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[var(--gc-z-toast)] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export default ToastProvider
