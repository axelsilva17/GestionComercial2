/**
 * useResource -- the loading / data / error tri-state, once.
 *
 * Both the Dashboard and the Productos screen need the same four states
 * (loading, loaded, empty, failed) and the same guard against setting state
 * after unmount. Written once here instead of three times per screen, because a
 * screen that reimplements `useEffect` fetch logic is a screen that eventually
 * forgets the unmount guard.
 *
 * The loader is intentionally NOT part of the dependency list. Screens pass an
 * inline arrow, which is a new function on every render; including it would
 * refetch in a loop. Callers state their real dependencies explicitly, and the
 * internal `recargar` tick is what triggers a manual retry.
 */
import { useCallback, useEffect, useState } from 'react'

/**
 * @template T
 * @param {() => Promise<T>} load
 * @param {unknown[]} deps dependencies of the request, not of the loader itself
 * @returns {{ cargando: boolean, datos: T | null, error: string, recargar: () => void }}
 */
export function useResource(load, deps) {
  const [tick, setTick] = useState(0)
  const [estado, setEstado] = useState({ cargando: true, datos: null, error: '' })

  useEffect(() => {
    let vigente = true

    // Every request restarts from the loading state: a retry after a failure has
    // to show a skeleton again, otherwise the screen pretends it has data.
    setEstado({ cargando: true, datos: null, error: '' })

    load().then(
      (datos) => {
        if (vigente) setEstado({ cargando: false, datos, error: '' })
      },
      (error) => {
        if (vigente) {
          setEstado({
            cargando: false,
            datos: null,
            error: error?.message ?? 'Ocurrió un error inesperado.',
          })
        }
      },
    )

    return () => {
      vigente = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const recargar = useCallback(() => setTick((valor) => valor + 1), [])

  return { ...estado, recargar }
}