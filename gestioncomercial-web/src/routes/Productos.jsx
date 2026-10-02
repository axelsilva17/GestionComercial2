/**
 * Productos -- T6.
 *
 * The densest screen of the three, and the one that actually exercises every
 * rule in `DESIGN.md` about tables. Composition only: `DataTable`, `Dialog`,
 * `TextField`, `SelectField`, `CheckboxField`, `Button`, `EmptyState` and
 * `Skeleton` are primitives. Nothing here writes a raw hex, a raw duration, or a
 * property that overrides the token set.
 *
 * Four distinctions that are easy to blur, and therefore expensive to get wrong
 * later:
 *
 *  1. "Vacio" (the store has no records) is a different message from "Sin
 *     resultados" (records exist, the filter hides all of them). The screen
 *     tracks both and only confuses them if one boolean drives both.
 *  2. A failed load is an `ErrorPanel` in the body with a retry; a failed
 *     mutation is a toast. They are different surfaces on purpose: one replaces
 *     the content the user was reading, the other does not.
 *  3. Sorting and searching live in the screen, not in the data module. The
 *     module returns the collection; deciding how to present it is UI state.
 *  4. Below `md` the table is replaced by stacked cards. Not "a horizontally
 *     scrolling table on a phone" -- an unreadable one. The two render paths
 *     read the same memoised rows, so they cannot drift apart.
 *
 * The form dialog and the delete confirmation keep separate state. Sharing one
 * `editando` object between them meant a reset in one dialog silently wiped the
 * other's target.
 */
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  CirclePlus,
  Package,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react'
import { useCallback, useId, useMemo, useState } from 'react'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import CheckboxField from '../components/CheckboxField.jsx'
import DataTable from '../components/DataTable.jsx'
import Dialog from '../components/Dialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PagePlaceholder from '../components/PagePlaceholder.jsx'
import SelectField from '../components/SelectField.jsx'
import Skeleton from '../components/Skeleton.jsx'
import TextField from '../components/TextField.jsx'
import { useToast } from '../components/useToast.js'
import {
  createProduct,
  deleteProduct,
  listProducts,
  listSucursales,
  updateProduct,
} from '../data/products.js'
import { formatCurrency, formatInteger } from '../utils/format.js'
import ErrorPanel from './ErrorPanel.jsx'
import StockBadge from './StockBadge.jsx'
import { useResource } from './useResource.js'

/** Rows per page. Part of the screen's presentation state, not the data layer. */
const TAMANO_PAGINA = 10

/**
 * Business limits, not design tokens: they come from `Producto.cs` and from what
 * the domain is willing to store, not from the theme. `Precio`/`StockActual`/
 * `StockMinimo` caps keep absurd input out of the store; the entity itself only
 * bounds `Nombre` (100) and `CodigoBarras` (50).
 */
const MAX_PRECIO = 9_999_999
const MAX_STOCK = 100_000
const CODIGO_PATTERN = /^[0-9A-Za-z-]+$/

/** Locale-aware comparison, so "Ánfora" sorts with "A" and not after "Z". */
const ORDENADORES = {
  nombre: (a, b) => a.Nombre.localeCompare(b.Nombre, 'es'),
  codigoBarras: (a, b) => (a.CodigoBarras ?? '').localeCompare(b.CodigoBarras ?? '', 'es'),
  precio: (a, b) => a.Precio - b.Precio,
  stockActual: (a, b) => a.StockActual - b.StockActual,
  stockMinimo: (a, b) => a.StockMinimo - b.StockMinimo,
  sucursalNombre: (a, b) => a.sucursalNombre.localeCompare(b.sucursalNombre, 'es'),
}

function formVacio() {
  return {
    Id: null,
    Nombre: '',
    CodigoBarras: '',
    Precio: '',
    StockActual: '',
    StockMinimo: '',
    IdSucursal: '',
    Activo: true,
  }
}

function aEntero(valor) {
  const n = Number(valor)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

function validar(form, existentes) {
  const errores = {}

  const nombre = form.Nombre.trim()
  if (!nombre) errores.Nombre = 'Ingresá el nombre del producto.'
  else if (nombre.length > 100) errores.Nombre = 'Máximo 100 caracteres.'

  const codigo = form.CodigoBarras.trim()
  if (codigo.length > 50) errores.CodigoBarras = 'Máximo 50 caracteres.'
  else if (codigo && !CODIGO_PATTERN.test(codigo)) {
    errores.CodigoBarras = 'Solo letras, números y guiones.'
  } else if (codigo && existentes.some((p) => p.Id !== form.Id && p.CodigoBarras === codigo)) {
    errores.CodigoBarras = 'Ya existe un producto con ese código de barras.'
  }

  const precio = Number(form.Precio)
  if (form.Precio === '' || !Number.isFinite(precio)) errores.Precio = 'Ingresá el precio.'
  else if (precio < 0) errores.Precio = 'El precio no puede ser negativo.'
  else if (precio > MAX_PRECIO) errores.Precio = 'El precio supera el máximo permitido.'

  const stock = Number(form.StockActual)
  if (form.StockActual === '' || !Number.isInteger(stock)) {
    errores.StockActual = 'Ingresá un número entero.'
  } else if (stock < 0) errores.StockActual = 'El stock no puede ser negativo.'
  else if (stock > MAX_STOCK) errores.StockActual = 'El stock supera el máximo permitido.'

  const minimo = Number(form.StockMinimo)
  if (form.StockMinimo === '' || !Number.isInteger(minimo)) {
    errores.StockMinimo = 'Ingresá un número entero.'
  } else if (minimo < 0) errores.StockMinimo = 'El stock mínimo no puede ser negativo.'

  if (!form.IdSucursal) errores.IdSucursal = 'Selecciona una sucursal.'

  return errores
}

/**
 * Sortable column header.
 *
 * A native `<button>`, deliberately, not a `Button` primitive: this control has
 * to fill the `<th>` exactly, and `Button` ships its own height and padding
 * (`h-9 px-3`) that would fight the cell's own box. Re-implementing an action
 * button is the anti-pattern; this is a table-header affordance, and it inherits
 * the global `:focus-visible` ring plus an expanded hit area in the same spirit as
 * `Button`.
 */
function EncabezadoOrdenable({ etiqueta, columnKey, orden, onOrdenar, className = '' }) {
  const activa = orden.columnKey === columnKey
  const ascendente = orden.direccion === 'asc'
  const Flecha = activa ? (ascendente ? ArrowUp : ArrowDown) : ChevronsUpDown

  return (
    <button
      type="button"
      onClick={() => onOrdenar(columnKey)}
      aria-pressed={activa}
      aria-label={
        activa
          ? `${etiqueta}, ordenado de forma ${ascendente ? 'ascendente' : 'descendente'}`
          : `${etiqueta}, sin ordenar`
      }
      className={[
        'relative inline-flex items-center gap-1 text-left',
        'transition-colors duration-[var(--gc-duration-fast)]',
        // Same hit-area expansion `Button` uses for its small size.
        'after:absolute after:-inset-2 after:content-[""]',
        activa ? 'text-ink' : 'hover:text-ink',
        className,
      ].join(' ')}
    >
      {etiqueta}
      <Flecha aria-hidden="true" className="size-3.5 shrink-0" />
    </button>
  )
}

/** One stacked card per product: the < md rendering of the same rows. */
function CardProducto({ producto, onEditar, onBorrar }) {
  return (
    <li className="flex flex-col gap-3 border-b border-line p-4 last:border-b-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-body font-medium text-ink" title={producto.Nombre}>
            {producto.Nombre}
          </p>
          <p className="mt-0.5 font-mono text-caption tracking-tight text-ink-muted" data-tabular>
            {producto.CodigoBarras ?? 'Sin código de barras'}
          </p>
        </div>
        <StockBadge producto={producto} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <dt className="text-caption text-ink-subtle">Precio</dt>
          <dd className="font-mono text-body tracking-tight text-ink" data-tabular>
            {formatCurrency(producto.Precio)}
          </dd>
        </div>
        <div>
          <dt className="text-caption text-ink-subtle">Sucursal</dt>
          <dd className="truncate text-body text-ink">{producto.sucursalNombre}</dd>
        </div>
        <div>
          <dt className="text-caption text-ink-subtle">Stock</dt>
          <dd className="font-mono text-body tracking-tight text-ink" data-tabular>
            {formatInteger(producto.StockActual)} <span className="text-ink-subtle">(mín. {formatInteger(producto.StockMinimo)})</span>
          </dd>
        </div>
        <div>
          <dt className="text-caption text-ink-subtle">Activo</dt>
          <dd className="text-body text-ink">{producto.Activo ? 'Sí' : 'No'}</dd>
        </div>
      </dl>

      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label={`Editar ${producto.Nombre}`}
          onClick={() => onEditar(producto)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label={`Eliminar ${producto.Nombre}`}
          onClick={() => onBorrar(producto)}
        >
          <Trash2 className="size-4 text-danger-ink" />
        </Button>
      </div>
    </li>
  )
}

export function Productos() {
  const toast = useToast()
  const formId = useId()

  const productosRes = useResource(listProducts, [])
  const sucursalesRes = useResource(listSucursales, [])

  const [query, setQuery] = useState('')
  const [orden, setOrden] = useState({ columnKey: 'nombre', direccion: 'asc' })
  const [pagina, setPagina] = useState(1)

  const [formAbierto, setFormAbierto] = useState(false)
  const [form, setForm] = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  const [borrarAbierto, setBorrarAbierto] = useState(false)
  const [borrandoTarget, setBorrandoTarget] = useState(null)
  const [borrando, setBorrando] = useState(false)

  const sucursales = useMemo(() => sucursalesRes.datos ?? [], [sucursalesRes.datos])

  /** `IdSucursal` is a domain id; the table needs the name. Joined here, once. */
  const productos = useMemo(() => {
    const nombres = new Map(sucursales.map((s) => [s.Id, s.Nombre]))
    return (productosRes.datos ?? []).map((p) => ({
      ...p,
      sucursalNombre: p.IdSucursal === null ? 'Sin sucursal' : (nombres.get(p.IdSucursal) ?? 'Sin sucursal'),
    }))
  }, [productosRes.datos, sucursales])

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? productos.filter((p) =>
          [p.Nombre, p.CodigoBarras ?? '', p.sucursalNombre].some((campo) =>
            campo.toLowerCase().includes(q),
          ),
        )
      : productos

    const comparar = ORDENADORES[orden.columnKey] ?? ORDENADORES.nombre
    const ordenado = [...base].sort(comparar)
    return orden.direccion === 'desc' ? ordenado.reverse() : ordenado
  }, [productos, query, orden])

  // The page is never left dangling: `paginaActual` is clamped to the range the
  // current result set actually has, so a delete that shrinks the list cannot
  // leave the user on an empty page 4. The *offset* reset happens in the events
  // that invalidate it (a new query, a new sort) rather than in an effect.
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / TAMANO_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const desde = filtrados.length === 0 ? 0 : (paginaActual - 1) * TAMANO_PAGINA + 1
  const hasta = Math.min(paginaActual * TAMANO_PAGINA, filtrados.length)
  const visibles = filtrados.slice(desde - 1, hasta)

  const cargando = productosRes.cargando
  const errorCarga = productosRes.error
  const listaVacia = !cargando && !errorCarga && productos.length === 0
  const sinResultados = !cargando && !errorCarga && productos.length > 0 && filtrados.length === 0

  const onOrdenar = useCallback((columnKey) => {
    setOrden((prev) =>
      prev.columnKey === columnKey
        ? { columnKey, direccion: prev.direccion === 'asc' ? 'desc' : 'asc' }
        : { columnKey, direccion: 'asc' },
    )
    // Sorting reorders the result set: going back to page 1 is the only
    // predictable outcome for the user.
    setPagina(1)
  }, [])

  const abrirNuevo = () => {
    setForm(formVacio())
    setErrores({})
    setFormAbierto(true)
  }

  const abrirEditar = (producto) => {
    setForm({
      Id: producto.Id,
      Nombre: producto.Nombre,
      CodigoBarras: producto.CodigoBarras ?? '',
      Precio: String(producto.Precio),
      StockActual: String(producto.StockActual),
      StockMinimo: String(producto.StockMinimo),
      IdSucursal: producto.IdSucursal === null ? '' : String(producto.IdSucursal),
      Activo: producto.Activo,
    })
    setErrores({})
    setFormAbierto(true)
  }

  const abrirBorrar = (producto) => {
    setBorrandoTarget(producto)
    setBorrarAbierto(true)
  }

  const guardar = async (event) => {
    event.preventDefault()

    const encontrados = validar(form, productos)
    setErrores(encontrados)
    if (Object.keys(encontrados).length > 0) return

    setGuardando(true)
    try {
      const draft = {
        Nombre: form.Nombre.trim(),
        CodigoBarras: form.CodigoBarras.trim() || null,
        Precio: Number(form.Precio),
        StockActual: aEntero(form.StockActual),
        StockMinimo: aEntero(form.StockMinimo),
        IdSucursal: form.IdSucursal === '' ? null : Number(form.IdSucursal),
        IdEmpresa: productos[0]?.IdEmpresa ?? 1,
        Activo: form.Activo,
      }

      if (form.Id === null) {
        await createProduct(draft)
        toast.push({ tone: 'accent', title: 'Producto creado', description: draft.Nombre })
      } else {
        await updateProduct(form.Id, draft)
        toast.push({ tone: 'accent', title: 'Producto actualizado', description: draft.Nombre })
      }

      setFormAbierto(false)
      await productosRes.recargar()
    } catch (error) {
      toast.push({
        tone: 'danger',
        title: 'No se pudo guardar el producto',
        description: error.message,
      })
    } finally {
      setGuardando(false)
    }
  }

  const confirmarBorrar = async () => {
    if (!borrandoTarget) return

    setBorrando(true)
    try {
      await deleteProduct(borrandoTarget.Id)
      toast.push({
        tone: 'accent',
        title: 'Producto eliminado',
        description: borrandoTarget.Nombre,
      })
      setBorrarAbierto(false)
      await productosRes.recargar()
    } catch (error) {
      toast.push({
        tone: 'danger',
        title: 'No se pudo eliminar el producto',
        description: error.message,
      })
    } finally {
      setBorrando(false)
    }
  }

  // Column visibility below `xl` is decided with `cellClassName`/`headerClassName`
  // rather than by dropping columns in JS: the skeleton rows and the stacked
  // cards then agree with the table about which fields exist.
  const columnas = useMemo(
    () => [
      {
        key: 'nombre',
        header: <EncabezadoOrdenable etiqueta="Producto" columnKey="nombre" orden={orden} onOrdenar={onOrdenar} />,
        render: (p) => (
          <div className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 truncate" title={p.Nombre}>
              {p.Nombre}
            </span>
            {!p.Activo && <Badge tone="neutral">Inactivo</Badge>}
          </div>
        ),
      },
      {
        key: 'codigoBarras',
        header: <EncabezadoOrdenable etiqueta="Código" columnKey="codigoBarras" orden={orden} onOrdenar={onOrdenar} />,
        mono: true,
        render: (p) => (p.CodigoBarras ? p.CodigoBarras : <span className="text-ink-subtle">—</span>),
      },
      {
        key: 'precio',
        header: <EncabezadoOrdenable etiqueta="Precio" columnKey="precio" orden={orden} onOrdenar={onOrdenar} className="ml-auto" />,
        numeric: true,
        render: (p) => formatCurrency(p.Precio),
      },
      {
        key: 'stockActual',
        header: <EncabezadoOrdenable etiqueta="Stock" columnKey="stockActual" orden={orden} onOrdenar={onOrdenar} className="ml-auto" />,
        numeric: true,
        render: (p) => formatInteger(p.StockActual),
      },
      {
        key: 'stockMinimo',
        header: 'Mínimo',
        numeric: true,
        // Only useful next to Stock, and only when there is room for both.
        headerClassName: 'hidden lg:table-cell',
        cellClassName: 'hidden lg:table-cell',
        render: (p) => formatInteger(p.StockMinimo),
      },
      {
        key: 'sucursalNombre',
        header: <EncabezadoOrdenable etiqueta="Sucursal" columnKey="sucursalNombre" orden={orden} onOrdenar={onOrdenar} />,
        headerClassName: 'hidden xl:table-cell',
        cellClassName: 'hidden xl:table-cell',
        render: (p) => <span className="truncate">{p.sucursalNombre}</span>,
      },
      {
        key: 'estadoStock',
        header: 'Estado',
        render: (p) => <StockBadge producto={p} />,
      },
      {
        key: 'acciones',
        header: <span className="sr-only">Acciones</span>,
        headerClassName: 'w-px',
        render: (p) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Editar ${p.Nombre}`}
              onClick={() => abrirEditar(p)}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={`Eliminar ${p.Nombre}`}
              onClick={() => abrirBorrar(p)}
            >
              <Trash2 className="size-4 text-danger-ink" />
            </Button>
          </div>
        ),
      },
    ],
    [orden, onOrdenar],
  )

  const opcionesSucursal = sucursales.map((s) => ({ value: String(s.Id), label: s.Nombre }))

  const estadoVacio = listaVacia ? (
    <EmptyState
      icon={<Package className="size-5" />}
      title="Todavía no hay productos"
      description="Creá el primer producto para empezar a cargar el catálogo."
      action={
        <Button onClick={abrirNuevo}>
          <CirclePlus aria-hidden="true" className="size-4 shrink-0" />
          Crear producto
        </Button>
      }
    />
  ) : sinResultados ? (
    <EmptyState
      icon={<Search className="size-5" />}
      title="Sin resultados para tu búsqueda"
      description="Probá con otro término o limpiá el filtro para ver todos los productos."
      action={
        <Button variant="secondary" onClick={() => setQuery('')}>
          Limpiar búsqueda
        </Button>
      }
    />
  ) : null

  return (
    <PagePlaceholder
      title="Productos"
      description="Alta, edición y baja del catálogo de productos."
      actions={
        <Button onClick={abrirNuevo} disabled={cargando || Boolean(errorCarga)}>
          <CirclePlus aria-hidden="true" className="size-4 shrink-0" />
          Crear producto
        </Button>
      }
    >
      {errorCarga && (
        <ErrorPanel description={errorCarga} onRetry={productosRes.recargar} />
      )}

      {!errorCarga && (
        <Card
          title="Catálogo de productos"
          description={
            cargando
              ? 'Cargando productos…'
              : 'Buscá por nombre, código de barras o sucursal. Ordená por cualquier columna.'
          }
          padded={false}
        >
          <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-md">
              <TextField
                label="Buscar productos"
                placeholder="Nombre, código de barras o sucursal"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setPagina(1)
                }}
                disabled={cargando}
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={productosRes.recargar}
              disabled={cargando}
              className="self-end"
            >
              Actualizar
            </Button>
          </div>

          {/* Stacked cards below `md`: a dense 8-column table is unreadable on a
              phone, and horizontal scrolling to read a price is worse than
              dropping the columns. */}
          <div className="md:hidden">
            {cargando ? (
              <div className="flex flex-col gap-4 p-4">
                <span className="sr-only">Cargando productos…</span>
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <Skeleton variant="text" className="w-2/3" />
                    <Skeleton variant="text" className="w-1/3" />
                  </div>
                ))}
              </div>
            ) : estadoVacio ? (
              estadoVacio
            ) : (
              <ul>
                {visibles.map((producto) => (
                  <CardProducto
                    key={producto.Id}
                    producto={producto}
                    onEditar={abrirEditar}
                    onBorrar={abrirBorrar}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="hidden md:block">
            <DataTable
              columns={columnas}
              rows={visibles}
              rowKey={(p) => p.Id}
              caption="Catálogo de productos"
              captionExtra="Nombre, código de barras, precio, stock, mínimo, sucursal, estado y acciones."
              density="compact"
              stickyHeader
              loading={cargando}
              skeletonRows={TAMANO_PAGINA}
              empty={estadoVacio}
            />
          </div>

          {!cargando && !estadoVacio && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
              <p className="text-caption text-ink-muted" aria-live="polite">
                Mostrando {desde}–{hasta} de {filtrados.length} productos
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                >
                  Anterior
                </Button>
                <span className="text-caption text-ink-muted">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Dialog
        open={formAbierto}
        onClose={() => setFormAbierto(false)}
        title={form.Id === null ? 'Nuevo producto' : 'Editar producto'}
        description="Los campos obligatorios están marcados con un asterisco."
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormAbierto(false)} disabled={guardando}>
              Cancelar
            </Button>
            {/* Outside the <form> but associated with it, so the dialog's primary
                action and pressing Enter submit the same handler. */}
            <Button type="submit" form={formId} loading={guardando}>
              {form.Id === null ? 'Crear producto' : 'Guardar cambios'}
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={guardar} noValidate className="flex flex-col gap-4">
          <TextField
            label="Nombre"
            required
            value={form.Nombre}
            onChange={(event) => setForm({ ...form, Nombre: event.target.value })}
            error={errores.Nombre}
            disabled={guardando}
          />

          <TextField
            label="Código de barras"
            mono
            value={form.CodigoBarras}
            onChange={(event) => setForm({ ...form, CodigoBarras: event.target.value })}
            error={errores.CodigoBarras}
            hint="Opcional. Solo letras, números y guiones."
            disabled={guardando}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Precio (ARS)"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              mono
              value={form.Precio}
              onChange={(event) => setForm({ ...form, Precio: event.target.value })}
              error={errores.Precio}
              disabled={guardando}
            />
            <TextField
              label="Stock actual"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              mono
              value={form.StockActual}
              onChange={(event) => setForm({ ...form, StockActual: event.target.value })}
              error={errores.StockActual}
              disabled={guardando}
            />
            <TextField
              label="Stock mínimo"
              type="number"
              inputMode="numeric"
              step="1"
              min="0"
              mono
              value={form.StockMinimo}
              onChange={(event) => setForm({ ...form, StockMinimo: event.target.value })}
              error={errores.StockMinimo}
              disabled={guardando}
            />
          </div>

          <SelectField
            label="Sucursal"
            required
            value={form.IdSucursal}
            onChange={(event) => setForm({ ...form, IdSucursal: event.target.value })}
            options={opcionesSucursal}
            placeholder="Seleccioná una sucursal"
            error={errores.IdSucursal}
            disabled={guardando}
          />

          <CheckboxField
            label="Producto activo"
            checked={form.Activo}
            onChange={(event) => setForm({ ...form, Activo: event.target.checked })}
            hint="Los productos inactivos no aparecen en ventas."
            disabled={guardando}
          />
        </form>
      </Dialog>

      <Dialog
        open={borrarAbierto}
        onClose={() => setBorrarAbierto(false)}
        title="Eliminar producto"
        description="Esta acción no se puede deshacer."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBorrarAbierto(false)} disabled={borrando}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarBorrar} loading={borrando}>
              <Trash2 aria-hidden="true" className="size-4 shrink-0" />
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-body text-ink">
          Vas a eliminar{' '}
          <strong className="font-semibold">{borrandoTarget?.Nombre}</strong> del catálogo.
        </p>
        <p className="mt-2 text-caption text-ink-subtle">
          El producto ya no aparecerá en las listas ni podrá venderse.
        </p>
      </Dialog>
    </PagePlaceholder>
  )
}

export default Productos