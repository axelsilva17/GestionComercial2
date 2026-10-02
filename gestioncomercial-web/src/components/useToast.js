/**
 * Toast consumer hook and its context.
 *
 * Kept out of `ToastProvider.jsx` so that module exports only a component.
 */
import { createContext, useContext } from 'react'

export const ToastContext = createContext(null)

/**
 * @param {{ tone?: 'info' | 'accent' | 'warning' | 'danger', title: string,
 *           description?: string, duration?: number }} options
 * @returns {(id: string) => void} dismiss handle for the created toast
 */
export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside a <ToastProvider>.')
  }

  return context
}
