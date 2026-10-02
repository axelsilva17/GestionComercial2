/**
 * Simulated transport for the mock data layer.
 *
 * The screens must talk to something that behaves like a network so the loading
 * states are real states and not a `useEffect` that happens to resolve in the
 * same tick. Everything here disappears when the API swap happens; it exists
 * only so `products.js`, `dashboard.js` and `auth.js` can keep their promise
 * signatures identical to the ones a real HTTP client would expose.
 */

/** Baseline latency for a read. Long enough that the skeleton is actually seen. */
export const READ_LATENCY_MS = 450

/** Latency for a write. Slightly longer: a mutation does more work server-side. */
export const WRITE_LATENCY_MS = 550

/** Latency for an authentication attempt. */
export const AUTH_LATENCY_MS = 700

/**
 * @param {number} ms
 * @returns {Promise<void>} resolves after `ms`
 */
export function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

/**
 * Failure modes a screen has to survive, selected from the query string.
 *
 * The empty catalogue and the load failure are both required states of the
 * Productos screen, and a mock that can only ever return rows makes them
 * unreachable and therefore unverified. `?escenario=vacio` and `?escenario=error`
 * put the data module in that mode; no other part of the app reads the param.
 *
 * @returns {'vacio' | 'error' | null}
 */
export function readScenario() {
  const value = new URLSearchParams(window.location.search).get('escenario')
  return value === 'vacio' || value === 'error' ? value : null
}