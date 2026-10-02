/**
 * Route module barrel.
 *
 * Screens own their bodies in `src/routes/*.jsx`; this file only re-exports them
 * so `App.jsx` has a single import surface. The T4/T5/T6 bodies are no longer
 * placeholders -- what replaced them is documented in `DESIGN.md`.
 */
export { default as Login } from './Login.jsx'
export { default as Dashboard } from './Dashboard.jsx'
export { default as Productos } from './Productos.jsx'