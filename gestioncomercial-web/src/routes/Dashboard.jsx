/**
 * Dashboard -- T5.
 *
 * KPI tiles, one chart, one activity table. Everything is composed from the
 * primitives in `src/components/`; no rule below re-styles one.
 *
 * Load strategy: three independent reads through `useResource`, one per region.
 * A shared spinner would mean a slow activity table blocks the KPIs that are
 * already on screen, which is worse than showing the numbers earlier.
 */
import { AlertCircle, Boxes, PackageSearch, TrendingUp, Wallet } from 'lucide-react'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import DataTable from '../components/DataTable.jsx'
import EmptyState from '../components/EmptyState.jsx'
import PagePlaceholder from '../components/PagePlaceholder.jsx'
import Skeleton from '../components/Skeleton.jsx'
import {
  getAlertasStock,
  getIndicadores,
  getSerieVentas,
  getVentasRecientes,
} from '../data/dashboard.js'
import { formatCurrencyWhole, formatDateTime, formatInteger, formatPercent } from '../utils/format.js'
import ErrorPanel from './ErrorPanel.jsx'
import { KpiTile, KpiTileSkeleton } from './KpiTile.jsx'
import SalesTrendChart from './SalesTrendChart.jsx'
import StockBadge from './StockBadge.jsx'
import { useResource } from './useResource.js'

const COLUMNAS_ACTIVIDAD = [
  {
    key: 'fecha',
    header: 'Fecha y hora',
    // Date and time are figures too: two-digit parts that must not jitter.
    mono: true,
    render: (fila) => formatDateTime(fila.venta.Fecha),
  },
  { key: 'sucursal', header: 'Sucursal' },
  { key: 'usuario', header: 'Usuario' },
  {
    key: 'total',
    header: 'Total',
    numeric: true,
    render: (fila) => formatCurrencyWhole(fila.venta.Total),
  },
  {
    key: 'estado',
    header: 'Estado',
    render: (fila) =>
      fila.venta.Anulada ? (
        <Badge tone="neutral">Anulada</Badge>
      ) : (
        <Badge tone="accent">Confirmada</Badge>
      ),
  },
]

function IndicadoresGrid({ estado }) {
  if (estado.cargando) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <KpiTileSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (estado.error) {
    return <ErrorPanel description={estado.error} onRetry={estado.recargar} />
  }

  const k = estado.datos

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiTile
        icon={TrendingUp}
        label="Ventas del mes"
        value={formatCurrencyWhole(k.ventasDelMes)}
        hint={`${formatPercent(k.variacionVsMesAnterior)} vs. mes anterior`}
        tone={k.variacionVsMesAnterior >= 0 ? 'up' : 'down'}
      />
      <KpiTile
        icon={Wallet}
        label="Ventas de hoy"
        value={formatCurrencyWhole(k.ventasHoy)}
        hint={`Ticket promedio ${formatCurrencyWhole(k.ticketPromedio)}`}
      />
      <KpiTile
        icon={Boxes}
        label="Unidades en stock"
        value={formatInteger(k.stockTotal)}
        hint={`${formatInteger(k.productosActivos)} productos activos`}
      />
      <KpiTile
        icon={AlertCircle}
        label="Productos con stock bajo"
        value={formatInteger(k.productosStockBajo)}
        hint={`${formatInteger(k.productosAgotados)} agotados · ${formatInteger(k.clientesActivos)} clientes activos`}
        tone={k.productosAgotados > 0 ? 'down' : 'neutral'}
      />
    </div>
  )
}

function TrendCard({ estado }) {
  return (
    <Card
      className="xl:col-span-2"
      title="Tendencia de ventas"
      description="Totales diarios de los últimos siete días."
    >
      {estado.cargando && (
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col gap-3"
        >
          <span className="sr-only">Cargando la tendencia de ventas…</span>
          <Skeleton variant="block" />
          <Skeleton variant="row" />
        </div>
      )}

      {estado.error && (
        <ErrorPanel description={estado.error} onRetry={estado.recargar} />
      )}

      {!estado.cargando && !estado.error && <SalesTrendChart puntos={estado.datos} />}
    </Card>
  )
}

function AlertasCard({ estado }) {
  return (
    <Card
      title="Alertas de stock"
      description="Productos agotados o en su mínimo."
      actions={
        <Button variant="ghost" size="sm" onClick={estado.recargar}>
          Actualizar
        </Button>
      }
    >
      {estado.cargando && (
        <div className="flex flex-col gap-3">
          <span className="sr-only">Cargando las alertas de stock…</span>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} variant="row" />
          ))}
        </div>
      )}

      {estado.error && <ErrorPanel description={estado.error} onRetry={estado.recargar} />}

      {!estado.cargando && !estado.error && estado.datos.length === 0 && (
        <EmptyState
          icon={<PackageSearch className="size-5" />}
          title="Sin alertas de stock"
          description="Ningún producto activo está por debajo de su stock mínimo."
        />
      )}

      {!estado.cargando && !estado.error && estado.datos.length > 0 && (
        <ul className="-my-1 divide-y divide-line">
          {estado.datos.map(({ producto, sucursal }) => (
            <li key={producto.Id} className="flex items-center gap-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-body text-ink">{producto.Nombre}</p>
                <p className="truncate text-caption text-ink-subtle">
                  {sucursal} · mínimo{' '}
                  <span data-tabular className="font-mono text-mono-sm">
                    {formatInteger(producto.StockMinimo)}
                  </span>
                </p>
              </div>

              <StockBadge producto={producto} />

              <span
                data-tabular
                className="w-14 shrink-0 text-right font-mono text-mono text-ink-muted"
              >
                {formatInteger(producto.StockActual)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function ActividadCard({ estado }) {
  const vacio = !estado.cargando && !estado.error && estado.datos.length === 0

  return (
    <Card
      title="Actividad reciente"
      description="Últimas ventas registradas en todas las sucursales."
      padded={false}
    >
      {estado.error && (
        <ErrorPanel description={estado.error} onRetry={estado.recargar} />
      )}

      {!estado.error && (
        <DataTable
          columns={COLUMNAS_ACTIVIDAD}
          rows={estado.datos ?? []}
          rowKey={(fila) => fila.venta.Id}
          caption="Actividad reciente: ventas registradas"
          captionExtra="Fecha, sucursal, usuario, total y estado de cada venta."
          density="compact"
          loading={estado.cargando}
          skeletonRows={5}
          // Gated on `vacio` rather than handed straight to `empty`: an empty
          // row set is also what a failed load looks like, and telling the user
          // "todavía no hay ventas" when the request failed is a lie.
          empty={
            vacio ? (
              <EmptyState
                icon={<Wallet className="size-5" />}
                title="Todavía no hay ventas registradas"
                description="Cuando se registre la primera venta, aparecerá en esta tabla."
              />
            ) : null
          }
        />
      )}
    </Card>
  )
}

export function Dashboard() {
  const indicadores = useResource(() => getIndicadores(), [])
  const serie = useResource(() => getSerieVentas(), [])
  const actividad = useResource(() => getVentasRecientes(8), [])
  const alertas = useResource(() => getAlertasStock(6), [])

  return (
    <PagePlaceholder
      title="Panel"
      description="Indicadores de stock, clientes y ventas."
    >
      <IndicadoresGrid estado={indicadores} />

      <div className="grid gap-4 xl:grid-cols-3">
        <TrendCard estado={serie} />
        <AlertasCard estado={alertas} />
      </div>

      <ActividadCard estado={actividad} />
    </PagePlaceholder>
  )
}

export default Dashboard