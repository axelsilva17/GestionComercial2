/**
 * Authentication data access -- the ONLY module the Login screen talks to.
 *
 * Out of scope by design (feature doc > Out of scope): there is no real
 * authentication here. The mock exists so the screen can exercise every state
 * that a real endpoint would produce -- submitting, success, rejection -- without
 * pretending to be a security boundary.
 *
 * Two rules this module follows on purpose:
 *
*  1. Deterministic. The same input always produces the same output, so the
 *     success and failure states can be tested, screenshotted, and compared.
 *  2. No real credential is stored. `CUENTA_DEMO` is a throwaway local fixture
 *     that resolves to nothing outside this in-memory module. There is no
 *     password hash to leak because there is no password to hash.
 *
 * The failure message is deliberately generic. "El usuario no existe" versus
 * "La contraseña es incorrecta" is an account-enumeration oracle, and copying
 * that habit into a mock is how it ends up copied into production.
 */

import { AUTH_LATENCY_MS, delay } from './mockTransport.js'

/** @typedef {{ email: string, password: string }} Credenciales */

/** @typedef {{ token: string, nombre: string, email: string }} Sesion */

/** @type {Credenciales} */
const CUENTA_DEMO = {
  email: 'demo@gestion.local',
  password: 'demo1234',
}

/**
 * Exposed so the Login screen can tell the reviewer how to get past the form.
 * There is nothing to protect here: the pair resolves to one hardcoded fixture.
 *
 * @type {Readonly<Credenciales>}
 */
export const CREDENCIALES_DEMO = Object.freeze({ ...CUENTA_DEMO })

export const MENSAJE_CREDENCIALES = 'Las credenciales no son correctas. Revisá el usuario y la contraseña.'

/**
 * @param {Credenciales} credenciales
 * @returns {Promise<Sesion>} rejects with `MENSAJE_CREDENCIALES` on mismatch
 */
export async function signIn({ email, password }) {
  await delay(AUTH_LATENCY_MS)

  const coincide =
    String(email).trim().toLowerCase() === CUENTA_DEMO.email &&
    String(password) === CUENTA_DEMO.password

  if (!coincide) {
    throw new Error(MENSAJE_CREDENCIALES)
  }

  return {
    // Not a JWT and not meant to look like one. A real implementation gets this
    // from the server and never mints it in the browser.
    token: 'mock-sesion-local',
    nombre: 'Demo',
    email: CUENTA_DEMO.email,
  }
}