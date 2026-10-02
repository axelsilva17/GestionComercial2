/**
 * Dashboard data access -- the ONLY module the Dashboard screen talks to.
 *
 * Same single-file-swap rule as `products.js`. Three reads rather than one
 * because each region of the screen owns its own loading and failure state:
 * a slow activity table must not hold the KPI tiles hostage.
 *
 * Stock indicators are derived from the product fixtures at module load, the
 * way a real API would serve them pre-aggregated from a cache. They do not
 * follow later mutations of the product store -- two independent endpoints, two
 * independent read models, exactly as they would be once the backend exists.
 *
 * @typedef {import('./fixtures.js').Venta} Venta
 * @typedef {import('./fixtures.js').Sucursal} Sucursal
 * @typedef {import('./fixtures.js').Usuario} Usuario
 */

import {
  CLIENTES,
  INDICADORES_VENTAS,
  PRODUCTOS,
  SUCURSALES,
  USUARIOS,
  VENTAS,
  VENTAS_POR_DIA,
} from './fixtures.js'
import { READ_LATENCY_MS, delay, readScenario } from './mockTransport.js'

/**
 * @typedef {object} Indicadores
 * @property {number} ventasDelMes          pesos, month to date
 * @property {number} variacionVsMesAnterior fraction, e.g. 0.1243 for +12,4%
 * @property {number} ticketPromedio         pesos
 * @property {number} stockTotal             units across all branches
 * @property {number} productosActivos
 * @property {number} productosStockBajo     0 < StockActual <= StockMinimo
 * @property {number} productosAgotados      StockActual === 0
 * @property {number} clientesActivos
 * @property {number} ventasHoy              pesos
 */

/** @type {Indicadores} */
const INDICADORES = {
  ...INDICADORES_VENTAS,
  stockTotal: PRODUCTOS.reduce((total, producto) => total + producto.StockActual, 0),
  productosActivos: PRODUCTOS.filter((producto) => producto.Activo).length,
  productosStockBajo: PRODUCTOS.filter(
    (producto) => producto.Activo && producto.StockActual > 0 && producto.StockActual <= producto.StockMinimo,
  ).length,
  productosAgotados: PRODUCTOS.filter(
    (producto) => producto.Activo && producto.StockActual === 0,
  ).length,
  clientesActivos: CLIENTES.filter((cliente) => cliente.Activo).length,
  ventasHoy: VENTAS_POR_DIA.at(-1)?.total ?? 0,
}

/**
 * @typedef {object} VentaConRelations
 * @property {Venta} venta
 * @property {string} sucursal     display name, or a placeholder when null
 * @property {string} usuario
 */

/** Flattens the foreign keys the way a joined API response would. */
function hydrate(venta) {
  const sucursal = SUCURSALES.find((item) => item.Id === venta.IdSucursal)
  const usuario = USUARIOS.find((item) => item.Id === venta.IdUsuario)

  return {
    venta,
    sucursal: sucursal?.Nombre ?? 'Sucursal no asignada',
    usuario: usuario?.Nombre ?? 'Sin asignar',
  }
}

function rejectIfScenarioFails() {
  if (readScenario() === 'error') {
    throw new Error('No se pudieron cargar los indicadores del panel.')
  }
}

/**
 * @returns {Promise<Indicadores>}
 */
export async function getIndicadores() {
  await delay(READ_LATENCY_MS)
  rejectIfScenarioFails()

  return { ...INDICADORES }
}

/**
 * @typedef {object} PuntoSerie
 * @property {string} fecha ISO-8601
 * @property {number} total pesos
 */

/**
 * @returns {Promise<PuntoSerie[]>} one point per day, oldest first
 */
export async function getSerieVentas() {
  await delay(READ_LATENCY_MS)
  rejectIfScenarioFails()

  return VENTAS_POR_DIA.map((punto) => ({ ...punto }))
}

/**
 * @param {number} limit
 * @returns {Promise<VentaConRelations[]>} most recent first
 */
export async function getVentasRecientes(limit = 8) {
  await delay(READ_LATENCY_MS)
  rejectIfScenarioFails()

  return [...VENTAS]
    .sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha))
    .slice(0, limit)
    .map(hydrate)
}

/**
 * Products that need attention: out of stock first, then at-or-below minimum.
 *
 * Derived from the same fixtures as the indicators so the counter on the KPI
 * tile and the list under it can never disagree with each other.
 *
 * @param {number} limit
 * @returns {Promise<{ producto: import('./fixtures.js').Producto, sucursal: string, agotado: boolean }[]>}
 */
export async function getAlertasStock(limit = 6) {
  await delay(READ_LATENCY_MS)
  rejectIfScenarioFails()

  return PRODUCTOS.filter(
    (producto) => producto.Activo && producto.StockActual <= producto.StockMinimo,
  )
    .sort((a, b) => a.StockActual - a.StockMinimo - (b.StockActual - b.StockMinimo))
    .slice(0, limit)
    .map((producto) => ({
      producto,
      sucursal:
        SUCURSALES.find((sucursal) => sucursal.Id === producto.IdSucursal)?.Nombre ??
        'Sin sucursal',
      agotado: producto.StockActual === 0,
    }))
}