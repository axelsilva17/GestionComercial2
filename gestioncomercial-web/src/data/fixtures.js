/**
 * Mock fixtures -- the raw data behind the data layer.
 *
 * Shapes mirror `GestionComercial.Domain/Entidades/*.cs` EXACTLY, property for
 * property. The project stays plain JSX (no TypeScript), so each entity is
 * declared as a JSDoc typedef and the C# property it came from is named in the
 * comment. When the API lands, these typedefs are the contract the response
 * bodies are validated against; if a `Producto.cs` property changes, the
 * corresponding typedef changes in the same commit.
 *
 * C# -> JS mapping decisions:
 *  - `int` / `decimal` -> `number`. ASP.NET serialises both as JSON numbers.
 *  - `string?` / `int?` -> `T | null`. `null` is meaningful, not "absent": a
 *    `Producto` without `CodigoBarras` is a real record, and the Productos
 *    screen renders it as such.
 *  - `DateTime` -> ISO-8601 string with an explicit offset, exactly what the
 *    serializer emits.
 *  - Property names stay PascalCase, identical to the C# properties, because
 *    these fixtures are specified as an exact mirror of the entities. Note that
 *    ASP.NET Core's *default* JSON contract is camelCase, so the real API layer
 *    will need a serializer setting (`JsonNamingPolicy = null` / a naming policy
 *    of "none") or a casing adapter. That decision belongs to the API swap, not
 *    to the screens: it is a single-module change in `data/products.js`.
 *
 * Navigation properties are intentionally absent from the fixtures except where
 * a screen needs the joined name; the domain exposes them as `virtual Empresa`
 * and `virtual Sucursal?`, and a real API would either inline them or expose
 * them under separate endpoints. Neither choice is guessed at here.
 */

/**
 * @typedef {object} Empresa
 * @property {number} Id            -- GestionComercial.Domain.Entidades.Empresa
 * @property {string} RazonSocial
 * @property {string | null} NombreComercial
 * @property {string | null} CuitCuil
 * @property {boolean} Activo
 */

/**
 * @typedef {object} Sucursal
 * @property {number} Id
 * @property {string} Nombre
 * @property {string | null} Direccion
 * @property {string | null} HorarioAtencion
 * @property {number} IdEmpresa
 * @property {boolean} Activo
 */

/**
 * @typedef {object} Producto
 * @property {number} Id
 * @property {string} Nombre        -- required, max 100 chars (see Producto.cs)
 * @property {string | null} CodigoBarras -- nullable, max 50 chars
 * @property {number} Precio        -- decimal
 * @property {number} StockActual
 * @property {number} StockMinimo
 * @property {number} IdEmpresa
 * @property {number | null} IdSucursal -- nullable
 * @property {boolean} Activo
 */

/**
 * @typedef {object} Cliente
 * @property {number} Id
 * @property {string} Nombre        -- required, max 100 chars
 * @property {string | null} Documento  -- nullable, max 20 chars
 * @property {string | null} Telefono   -- nullable, max 150 chars
 * @property {string | null} Email      -- nullable, max 200 chars
 * @property {number} IdEmpresa
 * @property {boolean} Activo
 */

/**
 * @typedef {object} Venta
 * @property {number} Id
 * @property {number} Total         -- decimal
 * @property {number} Descuento     -- decimal
 * @property {string} Fecha         -- DateTime, ISO-8601
 * @property {number} IdEmpresa
 * @property {number | null} IdSucursal -- nullable
 * @property {number} IdUsuario
 * @property {boolean} Anulada
 */

/**
 * @typedef {object} Usuario
 * @property {number} Id
 * @property {string} Nombre
 *
 * NOTE: there is no `Usuario` entity in `GestionComercial.Domain/Entidades`, but
 * `Venta.IdUsuario` is a non-nullable FK. This lookup exists only to give the
 * recent-activity table a name instead of a bare integer. If a `Usuario.cs`
 * entity lands, this fixture is replaced by its endpoint.
 */

/** @type {Empresa[]} */
export const EMPRESAS = [
  {
    Id: 1,
    RazonSocial: 'Distribuidora Pampero S.R.L.',
    NombreComercial: 'Pampero',
    CuitCuil: '30-71234567-9',
    Activo: true,
  },
]

/** @type {Sucursal[]} */
export const SUCURSALES = [
  {
    Id: 1,
    Nombre: 'Casa Central',
    Direccion: 'Av. Corrientes 2450, CABA',
    HorarioAtencion: 'Lun a Vie 8 a 20 h',
    IdEmpresa: 1,
    Activo: true,
  },
  {
    Id: 2,
    Nombre: 'Sucursal Norte',
    Direccion: 'Av. Cabildo 1180, CABA',
    HorarioAtencion: 'Lun a Sáb 9 a 21 h',
    IdEmpresa: 1,
    Activo: true,
  },
  {
    Id: 3,
    Nombre: 'Sucursal Sur',
    Direccion: 'Av. Mitre 3320, Avellaneda',
    HorarioAtencion: 'Lun a Sáb 9 a 20 h',
    IdEmpresa: 1,
    Activo: true,
  },
  {
    Id: 4,
    Nombre: 'Sucursal Oeste',
    Direccion: 'Av. Rivadavia 11220, Morón',
    HorarioAtencion: 'Lun a Vie 9 a 19 h',
    IdEmpresa: 1,
    Activo: true,
  },
]

/**
 * @type {Producto[]}
 *
 * The list is deliberately not uniform. It exists to make the rare states real:
 * stock at zero, stock at or below the minimum, a record with no barcode, a
 * record with no branch, an inactive record, and enough rows (36) that paging
 * and sorting have something to bite on.
 */
export const PRODUCTOS = [
  {
    Id: 1,
    Nombre: 'Café molido premium 1 kg',
    CodigoBarras: '7791234000017',
    Precio: 18500,
    StockActual: 148,
    StockMinimo: 20,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 2,
    Nombre: 'Té verde en saquitos x100',
    CodigoBarras: '7791234000024',
    Precio: 9800,
    StockActual: 62,
    StockMinimo: 10,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    // Out of stock: the badge has to say so without relying on colour.
    Id: 3,
    Nombre: 'Azúcar refinada 1 kg',
    CodigoBarras: '7791234000031',
    Precio: 1450,
    StockActual: 0,
    StockMinimo: 12,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 4,
    Nombre: 'Harina de trigo 000 x1 kg',
    CodigoBarras: '7791234000048',
    Precio: 1650,
    StockActual: 240,
    StockMinimo: 30,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    // Exactly at the minimum: the boundary belongs to "stock bajo", not to
    // "disponible".
    Id: 5,
    Nombre: 'Aceite de girasol 900 ml',
    CodigoBarras: '7791234000055',
    Precio: 3200,
    StockActual: 8,
    StockMinimo: 15,
    IdEmpresa: 1,
    IdSucursal: 2,
    Activo: true,
  },
  {
    Id: 6,
    Nombre: 'Arroz grano largo 1 kg',
    CodigoBarras: '7791234000062',
    Precio: 2100,
    StockActual: 190,
    StockMinimo: 25,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 7,
    Nombre: 'Fideos secos 500 g',
    CodigoBarras: '7791234000079',
    Precio: 1150,
    StockActual: 6,
    StockMinimo: 10,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    // No barcode: the entity allows it, so the table has to render it.
    Id: 8,
    Nombre: 'Salsa de tomate 400 g',
    CodigoBarras: null,
    Precio: 2400,
    StockActual: 95,
    StockMinimo: 20,
    IdEmpresa: 1,
    IdSucursal: 2,
    Activo: true,
  },
  {
    Id: 9,
    Nombre: 'Atún en lata 170 g',
    CodigoBarras: '7791234000093',
    Precio: 3100,
    StockActual: 320,
    StockMinimo: 40,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 10,
    Nombre: 'Lecha entera 1 L',
    CodigoBarras: '7791234000109',
    Precio: 1290,
    StockActual: 74,
    StockMinimo: 18,
    IdEmpresa: 1,
    IdSucursal: 2,
    Activo: true,
  },
  {
    Id: 11,
    Nombre: 'Yogur natural 1 kg',
    CodigoBarras: '7791234000116',
    Precio: 5200,
    StockActual: 5,
    StockMinimo: 12,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 12,
    Nombre: 'Queso crema 250 g',
    CodigoBarras: '7791234000123',
    Precio: 6400,
    StockActual: 41,
    StockMinimo: 10,
    IdEmpresa: 1,
    IdSucursal: 2,
    Activo: true,
  },
  {
    Id: 13,
    Nombre: 'Manteca 250 g',
    CodigoBarras: '7791234000130',
    Precio: 5800,
    StockActual: 0,
    StockMinimo: 8,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 14,
    Nombre: 'Chocolate en polvo 400 g',
    CodigoBarras: '7791234000147',
    Precio: 4300,
    StockActual: 3,
    StockMinimo: 10,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 15,
    Nombre: 'Galletas de avena x6',
    CodigoBarras: '7791234000154',
    Precio: 2900,
    StockActual: 130,
    StockMinimo: 15,
    IdEmpresa: 1,
    IdSucursal: 2,
    Activo: true,
  },
  {
    Id: 16,
    Nombre: 'Detergente concentrado 3 L',
    CodigoBarras: '7791234000161',
    Precio: 11900,
    StockActual: 27,
    StockMinimo: 8,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 17,
    Nombre: 'Lavandina concentrado 1 L',
    CodigoBarras: '7791234000178',
    Precio: 1650,
    StockActual: 1,
    StockMinimo: 6,
    IdEmpresa: 1,
    IdSucursal: 2,
    Activo: true,
  },
  {
    Id: 18,
    Nombre: 'Papel higiénico x4',
    CodigoBarras: null,
    Precio: 8900,
    StockActual: 66,
    StockMinimo: 12,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 19,
    Nombre: 'Lavavajillas concentrado 500 ml',
    CodigoBarras: '7791234000192',
    Precio: 2450,
    StockActual: 0,
    StockMinimo: 5,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 20,
    Nombre: 'Limpieza de pisos 3 L',
    CodigoBarras: '7791234000208',
    Precio: 5400,
    StockActual: 9,
    StockMinimo: 10,
    IdEmpresa: 1,
    IdSucursal: 3,
    Activo: true,
  },
  {
    Id: 21,
    Nombre: 'Bolsas de residuos 45 L x10',
    CodigoBarras: '7791234000215',
    Precio: 7300,
    StockActual: 58,
    StockMinimo: 12,
    IdEmpresa: 1,
    IdSucursal: 3,
    Activo: true,
  },
  {
    Id: 22,
    Nombre: 'Toallas de cocina x4',
    CodigoBarras: '7791234000222',
    Precio: 2100,
    StockActual: 44,
    StockMinimo: 8,
    IdEmpresa: 1,
    IdSucursal: 2,
    Activo: true,
  },
  {
    Id: 23,
    Nombre: 'Café instantáneo 250 g',
    CodigoBarras: '7791234000239',
    Precio: 12750,
    StockActual: 0,
    StockMinimo: 6,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 24,
    Nombre: 'Tostadora de mesa 2 ranuras',
    CodigoBarras: '7791234000246',
    Precio: 68500,
    StockActual: 6,
    StockMinimo: 3,
    IdEmpresa: 1,
    IdSucursal: 4,
    Activo: true,
  },
  {
    // Stock exactly equal to the minimum.
    Id: 25,
    Nombre: 'Licuadora 1,2 L',
    CodigoBarras: '7791234000253',
    Precio: 54900,
    StockActual: 2,
    StockMinimo: 2,
    IdEmpresa: 1,
    IdSucursal: 4,
    Activo: true,
  },
  {
    Id: 26,
    Nombre: 'Pava eléctrica 1,7 L',
    CodigoBarras: '7791234000260',
    Precio: 39900,
    StockActual: 12,
    StockMinimo: 4,
    IdEmpresa: 1,
    IdSucursal: 4,
    Activo: true,
  },
  {
    Id: 27,
    Nombre: 'Juego de tazas 6 u',
    CodigoBarras: null,
    Precio: 21500,
    StockActual: 9,
    StockMinimo: 3,
    IdEmpresa: 1,
    IdSucursal: 4,
    Activo: true,
  },
  {
    Id: 28,
    Nombre: 'Bandeja de aluminio',
    CodigoBarras: '7791234000284',
    Precio: 9800,
    StockActual: 15,
    StockMinimo: 3,
    IdEmpresa: 1,
    IdSucursal: 3,
    Activo: true,
  },
  {
    Id: 29,
    Nombre: 'Bol de vidrio 2 L',
    CodigoBarras: '7791234000291',
    Precio: 12400,
    StockActual: 0,
    StockMinimo: 4,
    IdEmpresa: 1,
    IdSucursal: 3,
    Activo: true,
  },
  {
    Id: 30,
    Nombre: 'Cubiertos de acero 24 u',
    CodigoBarras: '7791234000307',
    Precio: 34200,
    StockActual: 4,
    StockMinimo: 2,
    IdEmpresa: 1,
    IdSucursal: 4,
    Activo: true,
  },
  {
    Id: 31,
    Nombre: 'Vajilla de melamina 12 u',
    CodigoBarras: '7791234000314',
    Precio: 45800,
    StockActual: 7,
    StockMinimo: 2,
    IdEmpresa: 1,
    IdSucursal: 4,
    Activo: true,
  },
  {
    Id: 32,
    Nombre: 'Guantes de nitrilo x100',
    CodigoBarras: '7791234000321',
    Precio: 18900,
    StockActual: 210,
    StockMinimo: 25,
    IdEmpresa: 1,
    IdSucursal: 2,
    Activo: true,
  },
  {
    Id: 33,
    Nombre: 'Barbijo tricapa x50',
    CodigoBarras: '7791234000338',
    Precio: 3400,
    StockActual: 0,
    StockMinimo: 10,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  {
    Id: 34,
    Nombre: 'Alcohol en gel 500 ml',
    CodigoBarras: '7791234000345',
    Precio: 1950,
    StockActual: 22,
    StockMinimo: 10,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: true,
  },
  // Inactive records stay in the catalogue: the domain soft-deletes nothing, it
  // flips `Activo`, and the screen has to be able to show them.
  {
    Id: 35,
    Nombre: 'Té rojo en saquitos x100',
    CodigoBarras: '7791234000352',
    Precio: 8600,
    StockActual: 33,
    StockMinimo: 8,
    IdEmpresa: 1,
    IdSucursal: 1,
    Activo: false,
  },
  {
    Id: 36,
    Nombre: 'Salsa de soja 500 ml',
    CodigoBarras: '7791234000369',
    Precio: 3900,
    StockActual: 12,
    StockMinimo: 5,
    IdEmpresa: 1,
    IdSucursal: 2,
    Activo: false,
  },
  {
    // No branch: `IdSucursal` is nullable, so the table must survive a null.
    Id: 37,
    Nombre: 'Balanza de cocina 5 kg',
    CodigoBarras: null,
    Precio: 28700,
    StockActual: 5,
    StockMinimo: 2,
    IdEmpresa: 1,
    IdSucursal: null,
    Activo: true,
  },
]

/** @type {Cliente[]} */
export const CLIENTES = [
  {
    Id: 1,
    Nombre: 'Distribuidora del Sur S.R.L.',
    Documento: '30-44556677-2',
    Telefono: '+54 11 4567-8899',
    Email: 'compras@distribuidorasur.com.ar',
    IdEmpresa: 1,
    Activo: true,
  },
  {
    Id: 2,
    Nombre: 'Almacén El Palmar',
    Documento: '20-33456789-1',
    Telefono: '03492 445566',
    Email: null,
    IdEmpresa: 1,
    Activo: true,
  },
  {
    Id: 3,
    Nombre: 'Supermercados Norte S.A.',
    Documento: '30-70987654-3',
    Telefono: '+54 11 4123-7788',
    Email: 'compras@supernorte.com.ar',
    IdEmpresa: 1,
    Activo: true,
  },
  {
    Id: 4,
    Nombre: 'Kiosco La Esquina',
    Documento: null,
    Telefono: '+54 11 5234-1122',
    Email: null,
    IdEmpresa: 1,
    Activo: true,
  },
  {
    Id: 5,
    Nombre: 'Ferretería El Tornillo S.R.L.',
    Documento: '30-65432109-8',
    Telefono: '+54 11 4987-2211',
    Email: 'ventas@eltornillo.com.ar',
    IdEmpresa: 1,
    Activo: true,
  },
  {
    Id: 6,
    Nombre: 'Panadería La Masa',
    Documento: '23-30112233-5',
    Telefono: '03415 423456',
    Email: 'pedidos@lamasa.com.ar',
    IdEmpresa: 1,
    Activo: true,
  },
  {
    Id: 7,
    Nombre: 'Hotel Camino Real S.A.',
    Documento: '30-99887766-5',
    Telefono: '+54 11 4771-9090',
    Email: 'compras@caminoreal.com.ar',
    IdEmpresa: 1,
    Activo: false,
  },
  {
    Id: 8,
    Nombre: 'Librería El Libro',
    Documento: '20-44556677-9',
    Telefono: '+54 11 4788-3344',
    Email: 'elLibro@correo.com.ar',
    IdEmpresa: 1,
    Activo: true,
  },
]

/** @type {Usuario[]} */
export const USUARIOS = [
  { Id: 3, Nombre: 'María González' },
  { Id: 7, Nombre: 'Diego Fernández' },
  { Id: 12, Nombre: 'Lucía Bianchi' },
]

/** @type {Venta[]} */
export const VENTAS = [
  {
    Id: 1042,
    Total: 184250.0,
    Descuento: 3200.0,
    Fecha: '2026-09-30T14:32:00Z',
    IdEmpresa: 1,
    IdSucursal: 1,
    IdUsuario: 7,
    Anulada: false,
  },
  {
    Id: 1041,
    Total: 96780.5,
    Descuento: 1500.0,
    Fecha: '2026-09-30T11:05:00Z',
    IdEmpresa: 1,
    IdSucursal: 2,
    IdUsuario: 7,
    Anulada: false,
  },
  {
    Id: 1040,
    Total: 321400.0,
    Descuento: 0,
    Fecha: '2026-09-30T09:48:00Z',
    IdEmpresa: 1,
    IdSucursal: 1,
    IdUsuario: 3,
    Anulada: false,
  },
  {
    Id: 1039,
    Total: 45900.0,
    Descuento: 900.0,
    Fecha: '2026-09-30T08:12:00Z',
    IdEmpresa: 1,
    IdSucursal: 3,
    IdUsuario: 3,
    Anulada: false,
  },
  {
    Id: 1038,
    Total: 128940.75,
    Descuento: 2460.0,
    Fecha: '2026-09-29T18:22:00Z',
    IdEmpresa: 1,
    IdSucursal: 1,
    IdUsuario: 7,
    Anulada: false,
  },
  {
    // Anulled: the badge tone and the strikethrough-ish total are two different
    // signals, and the text is what carries the meaning.
    Id: 1037,
    Total: 67230.0,
    Descuento: 0,
    Fecha: '2026-09-29T16:05:00Z',
    IdEmpresa: 1,
    IdSucursal: 2,
    IdUsuario: 12,
    Anulada: true,
  },
  {
    Id: 1036,
    Total: 215670.4,
    Descuento: 4300.0,
    Fecha: '2026-09-29T14:40:00Z',
    IdEmpresa: 1,
    IdSucursal: 1,
    IdUsuario: 3,
    Anulada: false,
  },
  {
    Id: 1035,
    Total: 88900.0,
    Descuento: 1200.0,
    Fecha: '2026-09-29T11:33:00Z',
    IdEmpresa: 1,
    IdSucursal: 4,
    IdUsuario: 7,
    Anulada: false,
  },
  {
    Id: 1034,
    Total: 34210.0,
    Descuento: 0,
    Fecha: '2026-09-29T10:02:00Z',
    IdEmpresa: 1,
    IdSucursal: 3,
    IdUsuario: 12,
    Anulada: true,
  },
  {
    Id: 1033,
    Total: 156300.0,
    Descuento: 2800.0,
    Fecha: '2026-09-28T17:15:00Z',
    IdEmpresa: 1,
    IdSucursal: 2,
    IdUsuario: 3,
    Anulada: false,
  },
]

/**
 * Daily sales for the last seven days, oldest first.
 *
 * Fixed dates, not `Date.now()`: a mock whose numbers move every time the page
 * reloads cannot be screenshot-compared or eyeballed against a known state.
 *
 * @type {{ fecha: string, total: number }[]}
 */
export const VENTAS_POR_DIA = [
  { fecha: '2026-09-24T00:00:00Z', total: 198400 },
  { fecha: '2026-09-25T00:00:00Z', total: 241750 },
  { fecha: '2026-09-26T00:00:00Z', total: 86320 },
  { fecha: '2026-09-27T00:00:00Z', total: 54210 },
  { fecha: '2026-09-28T00:00:00Z', total: 176930 },
  { fecha: '2026-09-29T00:00:00Z', total: 262480 },
  { fecha: '2026-09-30T00:00:00Z', total: 289150 },
]

/**
 * Sales indicators that are not derivable from the other fixtures: a month
 * cannot be summed from seven days of data.
 *
 * @type {{ ventasDelMes: number, variacionVsMesAnterior: number, ticketPromedio: number }}
 */
export const INDICADORES_VENTAS = {
  ventasDelMes: 18427650,
  // Fraction, not percent: 0.1243 is "+12,4%".
  variacionVsMesAnterior: 0.1243,
  ticketPromedio: 96350,
}