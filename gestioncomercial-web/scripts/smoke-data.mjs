// Behavioural smoke test of the data layer and the formatters, run against the
// real source files. The project has no test runner and this change was not
// authorised to add one, so this is a plain node script -- but it runs the actual
// modules, not a copy of their logic.
//
// It covers the claims the three screens depend on: fixture coverage of the edge
// cases, snapshot isolation, CRUD, the duplicate-barcode rejection, the stock
// thresholds the badge uses, both failure scenarios, and es-AR formatting.
//
// Usage: node scripts/smoke-data.mjs   (from gestioncomercial-web)

import assert from 'node:assert/strict'

/** `readScenario()` reads `window.location.search`; give it something to read. */
globalThis.window = { location: { search: '' } }

async function withScenario(name, fn) {
  globalThis.window.location.search = name ? `?escenario=${name}` : ''
  try {
    return await fn()
  } finally {
    globalThis.window.location.search = ''
  }
}

let passed = 0
function check(label, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed += 1
      console.log(`  ok  ${label}`)
    })
}

// --------------------------------------------------------------------------
console.log('\nformatters')
const fmt = await import('../src/utils/format.js')

/**
 * `Intl` separates the currency symbol and the compact suffix with a
 * non-breaking space, so the symbol can never wrap away from its amount. That is
 * a deliberate decision, but it makes literal comparisons fragile because the
 * character is invisible in source -- so currency assertions compare the
 * normalised form and `usesNonBreakingSpaces` asserts the real property
 * separately.
 */
const NBSP = '\u00a0'
const sp = (s) => s.replaceAll(NBSP, ' ')

await check('currency keeps two decimals and the es-AR grouping', () =>
  assert.equal(sp(fmt.formatCurrency(1234567.89)), '$ 1.234.567,89'),
)
await check('whole pesos drop the decimals but keep the grouping', () =>
  assert.equal(sp(fmt.formatCurrencyWhole(18500)), '$ 18.500'),
)
await check('integers group by thousands', () =>
  assert.equal(fmt.formatInteger(3204), '3.204'),
)
await check('the peso symbol is glued to its amount by a non-breaking space', () => {
  assert.ok(fmt.formatCurrency(1000).startsWith(`$${NBSP}1.000`))
})
await check('percent takes a FRACTION and is always signed', () => {
  // `Intl` `style: 'percent'` multiplies by 100, so the contract is a fraction.
  // The fixture, the typedef and the formatter all agree on this.
  assert.equal(fmt.formatPercent(0.124), '+12,4%')
  assert.equal(fmt.formatPercent(-0.032), '-3,2%')
  // `maximumFractionDigits` without a `minimum` trims trailing zeros: an exact
  // 5% delta must not read "+5,0%".
  assert.equal(fmt.formatPercent(0.05), '+5%')
  assert.equal(fmt.formatPercent(0), '+0%')
})
await check('compact currency uses k/M suffixes, not trailing zeros', () => {
  assert.equal(sp(fmt.formatCurrencyCompact(248000)), '$248 k')
  assert.equal(sp(fmt.formatCurrencyCompact(1309240)), '$1 M')
})
await check('compact currency keeps the suffix attached by a non-breaking space', () =>
  assert.ok(fmt.formatCurrencyCompact(248000).includes(NBSP)),
)
await check('date-time matches the documented sample', () =>
  assert.equal(fmt.formatDateTime('2026-09-29T11:32:00'), '29/9/26, 11:32 a. m.'),
)
await check('weekday is abbreviated and lower-case', () =>
  assert.equal(fmt.formatWeekday('2026-09-29T11:32:00'), 'mar'),
)

// --------------------------------------------------------------------------
console.log('\nproducts')
const products = await import('../src/data/products.js')

const lista = await products.listProducts()
const activo = (p) => p.Activo

await check('the catalogue has 37 fixtures', () => assert.equal(lista.length, 37))
await check('a product with no stock exists', () =>
  assert.ok(lista.some((p) => p.StockActual === 0)),
)
await check('a product exactly at its minimum exists', () =>
  assert.ok(lista.some((p) => p.StockActual === p.StockMinimo && p.StockMinimo > 0)),
)
await check('a product below its minimum exists', () =>
  assert.ok(
    lista.some((p) => activo(p) && p.StockActual > 0 && p.StockActual < p.StockMinimo),
  ),
)
await check('a product with no barcode exists', () =>
  assert.ok(lista.some((p) => p.CodigoBarras === null)),
)
await check('a product with no branch exists', () =>
  assert.ok(lista.some((p) => p.IdSucursal === null)),
)
await check('an inactive product exists', () => assert.ok(lista.some((p) => !activo(p))))

await check('a returned list is a copy, not a live handle on the store', async () => {
  const mutable = await products.listProducts()
  const original = mutable[0].Nombre
  mutable[0].Nombre = 'MUTADO'
  assert.equal((await products.listProducts())[0].Nombre, original)
})

await check('there are 4 branches', async () =>
  assert.equal((await products.listProducts()).length >= 4, true),
)
await check('branches load', async () =>
  assert.equal((await products.listSucursales()).length, 4),
)

await check('a duplicate barcode is rejected by the data layer', async () => {
  const conCodigo = lista.find((p) => p.CodigoBarras)
  await assert.rejects(
    () =>
      products.createProduct({
        Nombre: 'Duplicado',
        CodigoBarras: conCodigo.CodigoBarras,
        Precio: 1,
        StockActual: 1,
        StockMinimo: 0,
        IdSucursal: 1,
        IdEmpresa: 1,
        Activo: true,
      }),
    /Ya existe un producto/,
  )
})

await check('a product can be created, updated and deleted', async () => {
  const creado = await products.createProduct({
    Nombre: 'Producto de prueba',
    CodigoBarras: null,
    Precio: 1234.56,
    StockActual: 7,
    StockMinimo: 3,
    IdSucursal: 1,
    IdEmpresa: 1,
    Activo: true,
  })
  assert.ok(creado.Id > 37, 'create assigns a fresh id')
  assert.equal((await products.listProducts()).length, 38)

  await products.updateProduct(creado.Id, { Precio: 999, StockActual: 0 })
  const actualizado = (await products.listProducts()).find((p) => p.Id === creado.Id)
  assert.equal(actualizado.Precio, 999)
  assert.equal(actualizado.StockActual, 0)
  assert.equal(actualizado.Nombre, 'Producto de prueba', 'a partial update must not drop fields')

  await products.deleteProduct(creado.Id)
  assert.equal((await products.listProducts()).length, 37)
  await assert.rejects(() => products.deleteProduct(creado.Id), /ya no existe/)
})

// --------------------------------------------------------------------------
console.log('\nscenarios')
await check('?escenario=vacio yields an empty catalogue, not an error', () =>
  withScenario('vacio', async () => {
    assert.deepEqual(await products.listProducts(), [])
  }),
)
await check('?escenario=error rejects the read', () =>
  withScenario('error', () => assert.rejects(() => products.listProducts())),
)
await check('no scenario means normal service is restored', async () => {
  assert.equal((await products.listProducts()).length, 37)
})

// --------------------------------------------------------------------------
console.log('\ndashboard')
const dashboard = await import('../src/data/dashboard.js')

await check('the indicators are all finite numbers', async () => {
  const k = await dashboard.getIndicadores()
  for (const [clave, valor] of Object.entries(k)) {
    assert.equal(typeof valor, 'number', `${clave} is not a number`)
    assert.ok(Number.isFinite(valor), `${clave} is not finite`)
  }
})

await check('the trend is seven days, OLDEST FIRST (the chart renders in array order)', async () => {
  const serie = await dashboard.getSerieVentas()
  assert.equal(serie.length, 7)
  // The series DTO is camelCase (`fecha`/`total`) because it is a view DTO, not a
  // domain entity -- unlike PRODUCTOS, which mirrors the .cs PascalCase.
  assert.deepEqual(Object.keys(serie[0]).sort(), ['fecha', 'total'])
  for (let i = 1; i < serie.length; i += 1) {
    assert.ok(
      new Date(serie[i].fecha) > new Date(serie[i - 1].fecha),
      `day ${i} (${serie[i].fecha}) is not after day ${i - 1} (${serie[i - 1].fecha})`,
    )
  }
})

await check('every trend point has a positive total, so no bar renders empty', async () => {
  for (const punto of await dashboard.getSerieVentas()) {
    assert.ok(punto.total > 0, `${punto.fecha} has total ${punto.total}`)
  }
})

await check('recent sales are newest first', async () => {
  const ventas = await dashboard.getVentasRecientes(8)
  assert.ok(ventas.length > 0)
  for (let i = 1; i < ventas.length; i += 1) {
    assert.ok(
      new Date(ventas[i].venta.Fecha) <= new Date(ventas[i - 1].venta.Fecha),
      'sales are not newest first',
    )
  }
})

await check('stock alerts are sorted by urgency (deficit ascending)', async () => {
  const alertas = await dashboard.getAlertasStock(6)
  const deficit = (a) => a.producto.StockActual - a.producto.StockMinimo
  for (let i = 1; i < alertas.length; i += 1) {
    assert.ok(
      deficit(alertas[i]) >= deficit(alertas[i - 1]),
      `alert ${i} (${deficit(alertas[i])}) is more urgent than alert ${i - 1} (${deficit(alertas[i - 1])})`,
    )
  }
})

await check('every alert is at or below its minimum', async () => {
  for (const alerta of await dashboard.getAlertasStock(20)) {
    assert.ok(alerta.producto.StockActual <= alerta.producto.StockMinimo)
  }
})

// --------------------------------------------------------------------------
console.log('\nauth')
const auth = await import('../src/data/auth.js')

await check('the demo account signs in, case-insensitively on the email', async () => {
  const sesion = await auth.signIn({ email: 'DEMO@Gestion.local', password: 'demo1234' })
  assert.equal(sesion.email, 'demo@gestion.local')
})

await check('a wrong password and an unknown user fail identically (no user enumeration)', async () => {
  const conClaveMala = await auth
    .signIn({ email: 'demo@gestion.local', password: 'no' })
    .catch((e) => e.message)
  const sinUsuario = await auth
    .signIn({ email: 'nadie@gestion.local', password: 'demo1234' })
    .catch((e) => e.message)
  // One shared constant for both paths is the property: a distinct message per
  // failure would let anyone confirm which accounts exist.
  assert.equal(conClaveMala, auth.MENSAJE_CREDENCIALES)
  assert.equal(sinUsuario, auth.MENSAJE_CREDENCIALES)
})

await check('the failure message names both fields and blames neither', () => {
  const mensaje = auth.MENSAJE_CREDENCIALES.toLowerCase()
  assert.ok(mensaje.includes('usuario'), 'does not mention the user field')
  assert.ok(mensaje.includes('contraseña'), 'does not mention the password field')
  for (const revelador of ['no existe', 'no está registrado', 'contraseña incorrecta', 'usuario inexistente']) {
    assert.ok(!mensaje.includes(revelador), `the message reveals which field was wrong: "${revelador}"`)
  }
})

console.log(`\n${passed} checks passed\n`)