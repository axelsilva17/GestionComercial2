/**
 * SalesTrendChart -- the single chart type in the product.
 *
 * A vertical bar chart, hand-built in HTML. Three reasons, in order of weight:
 *
 *  1. No new dependency. `recharts`/`chart.js` are not installed and adding one
 *     to draw seven rectangles would be a poor trade.
 *  2. HTML keeps the real type scale. An SVG chart has to pick a font size in
 *     user units, and that unit gets scaled by the viewBox at every breakpoint
 *     until the labels are unreadable on a phone. Here `text-caption` means the
 *     same 12px at 375px as at 1440px.
 *  3. Daily totals are discrete. A line implies interpolation between points;
 *     bars do not.
 *
 * Accessibility, which is the part that decides whether the chart is allowed to
 * exist at all:
 *
 *  - `role="img"` with an `aria-label` that spells out every point, because a
 *    screen reader gets nothing useful from seven anonymous rectangles.
 *  - Every bar carries its value as visible text, so the data is legible
 *    without colour perception, without a tooltip, and without JavaScript.
 *  - The legend states the series and its unit. A single-series chart still has
 *    to say what the numbers are.
 *  - The bar fill is `--color-accent`, the step DESIGN.md reserves for non-text
 *    signal. `#059669` against white measures 3.77:1, which is exactly the
 *    ≥3:1 band 1.4.11 asks of a graphical object -- and it is deliberately NOT
 *    used for the CTA fill, which needs 4.5:1. See DESIGN.md.
 */
import { formatCurrencyCompact, formatCurrencyWhole, formatDayMonth, formatWeekday } from '../utils/format.js'

/**
 * Headroom left above the tallest bar so its value label has somewhere to sit
 * without pushing the column out of the plot. The value-to-height mapping stays
 * linear; it is just scaled to leave room for the label.
 */
const ESPACIO_PARA_ETIQUETA = 0.76

/**
 * @param {object} props
 * @param {{ fecha: string, total: number }[]} props.puntos oldest first
 */
export function SalesTrendChart({ puntos }) {
  if (puntos.length === 0) return null

  const maximo = Math.max(...puntos.map((punto) => punto.total))
  const total = puntos.reduce((suma, punto) => suma + punto.total, 0)

  const descripcion = puntos
    .map(
      (punto) =>
        `${formatWeekday(punto.fecha)} ${formatDayMonth(punto.fecha)}: ${formatCurrencyWhole(punto.total)}`,
    )
    .join('. ')

  return (
    <figure className="m-0 flex flex-col gap-3">
      {/*
        Legend. Required even with a single series: it is what tells the reader
        that the bars mean pesos per day, which no axis label states.
      */}
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="flex items-center gap-2 text-caption text-ink-muted">
          <span aria-hidden="true" className="size-2.5 rounded-sm bg-accent" />
          Ventas por día (ARS)
        </span>
        <span className="text-caption text-ink-subtle">
          Total del período:{' '}
          <span data-tabular className="font-mono text-ink">
            {formatCurrencyWhole(total)}
          </span>
        </span>
      </figcaption>

      {/* Baseline: the rule the bars stand on, then the category axis under it. */}
      <div className="flex flex-col">
        <div
          role="img"
          aria-label={`Ventas de los últimos ${puntos.length} días. ${descripcion}`}
          className="flex h-48 items-end gap-2 border-b border-line-strong"
        >
          {puntos.map((punto) => (
            <div key={punto.fecha} className="flex h-full flex-1 flex-col justify-end gap-1">
              {/* Visible value: the chart stays readable in monochrome. */}
              <span
                data-tabular
                className="text-center font-mono text-caption whitespace-nowrap text-ink-muted"
              >
                {formatCurrencyCompact(punto.total)}
              </span>

              <div
                title={`${formatDayMonth(punto.fecha)}: ${formatCurrencyWhole(punto.total)}`}
                style={{ height: `${(punto.total / maximo) * ESPACIO_PARA_ETIQUETA * 100}%` }}
                className="w-full rounded-t-sm bg-accent hover:bg-accent-strong motion-safe:transition-colors motion-safe:duration-[var(--gc-duration-fast)]"
              />
            </div>
          ))}
        </div>

        {/* Category axis. Same flex split as the plot, so labels line up. */}
        <div className="flex gap-2 pt-2" aria-hidden="true">
          {puntos.map((punto) => (
            <span key={punto.fecha} className="flex-1 text-center text-caption text-ink-subtle">
              {formatWeekday(punto.fecha)}
            </span>
          ))}
        </div>
      </div>
    </figure>
  )
}

export default SalesTrendChart