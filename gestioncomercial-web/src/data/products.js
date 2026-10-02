/**
 * Products data access -- the ONLY module the Productos screen talks to.
 *
 * Architecture requirement: the API swap must be a single-file change. Nothing
 * outside this file knows that the data comes from fixtures; every caller gets
 * a promise and a domain-shaped object. Replacing the bodies below with `fetch`
 * calls is the entire migration, and no screen has to move.
 *
 * Every function resolves with a copy: callers that mutate what they receive
 * must not be able to corrupt the store for the next reader.
 *
 * @typedef {import('./fixtures.js').Producto} Producto
 * @typedef {import('./fixtures.js').Sucursal} Sucursal
 */

import { PRODUCTOS, SUCURSALES } from './fixtures.js'
import { READ_LATENCY_MS, WRITE_LATENCY_MS, delay, readScenario } from './mockTransport.js'

/**
 * In-memory store. A real repository would be a database; the important part
 * is that it lives behind this module and nowhere else.
 *
 * @type {Producto[]}
 */
let store = PRODUCTOS.map((producto) => ({ ...producto }))

/** @returns {Producto[]} */
function snapshot() {
  return store.map((producto) => ({ ...producto }))
}

/**
 * `?escenario=error` makes every read reject, so the screen's failure path is
 * reachable on demand instead of being an untested branch.
 */
function rejectIfScenarioFails() {
  if (readScenario() === 'error') {
    throw new Error('No se pudo conectar con el servidor de productos.')
  }
}

/**
 * @returns {Promise<Producto[]>} all products, newest identifier last
 */
export async function listProducts() {
  await delay(READ_LATENCY_MS)
  rejectIfScenarioFails()

  if (readScenario() === 'vacio') return []

  return snapshot()
}

/**
 * Branches, for the branch selector of the product form and for resolving
 * `Producto.IdSucursal` to a name in the table.
 *
 * @returns {Promise<Sucursal[]>}
 */
export async function listSucursales() {
  await delay(READ_LATENCY_MS)
  rejectIfScenarioFails()

  return SUCURSALES.map((sucursal) => ({ ...sucursal }))
}

/**
 * @param {Omit<Producto, 'Id'>} draft
 * @returns {Promise<Producto>} the stored record, including its assigned `Id`
 */
export async function createProduct(draft) {
  await delay(WRITE_LATENCY_MS)

  if (draft.CodigoBarras && store.some((p) => p.CodigoBarras === draft.CodigoBarras)) {
    throw new Error('Ya existe un producto con ese código de barras.')
  }

  const siguienteId = store.reduce((max, producto) => Math.max(max, producto.Id), 0) + 1
  const producto = { ...draft, Id: siguienteId }

  store = [...store, producto]
  return { ...producto }
}

/**
 * @param {number} id
 * @param {Partial<Producto>} changes
 * @returns {Promise<Producto>} the updated record
 */
export async function updateProduct(id, changes) {
  await delay(WRITE_LATENCY_MS)

  const existente = store.find((producto) => producto.Id === id)
  if (!existente) {
    throw new Error('El producto ya no existe.')
  }

  if (
    changes.CodigoBarras &&
    store.some((producto) => producto.Id !== id && producto.CodigoBarras === changes.CodigoBarras)
  ) {
    throw new Error('Ya existe un producto con ese código de barras.')
  }

  const producto = { ...existente, ...changes, Id: id }
  store = store.map((item) => (item.Id === id ? producto : item))

  return { ...producto }
}

/**
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteProduct(id) {
  await delay(WRITE_LATENCY_MS)

  const existe = store.some((producto) => producto.Id === id)
  if (!existe) {
    throw new Error('El producto ya no existe.')
  }

  store = store.filter((producto) => producto.Id !== id)
}