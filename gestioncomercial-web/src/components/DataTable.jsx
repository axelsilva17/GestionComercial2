/**
 * DataTable -- dense record table.
 *
 * Contract: DESIGN.md > Data tables.
 *
 * The columns config is the whole contract. Alignment, tabular numerals, and
 * mono rendering are decided per column, once, and every row inherits them --
 * a screen cannot opt a single cell into left-aligning a price.
 *
 * Accessibility: a table without a caption is a table a screen-reader user
 * cannot identify, so `caption` is required. Row counts and sort state are
 * announced through the caption slot's `captionExtra` argument.
 */
import Skeleton from './Skeleton.jsx'

const DENSITY = {
  default: 'h-11',
  compact: 'h-9',
}

const CELL_ALIGN = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}

/**
 * A numeric column is right-aligned whether or not the caller said so.
 * DESIGN.md states the rule as a property of the column, not of the caller's
 * memory: "Numeric alignment: `right` for `column.numeric`". Allowing
 * `column.align` to override it would let a price drift to the left, which is
 * the exact defect the rule exists to prevent.
 */
function alignFor(column) {
  if (column.numeric) return 'right'
  return column.align ?? 'left'
}

export function DataTable({
  columns,
  rows,
  rowKey,
  caption,
  captionExtra,
  density = 'default',
  stickyHeader = false,
  loading = false,
  skeletonRows = 6,
  empty = null,
  onRowClick,
  className = '',
}) {
  const rowHeight = DENSITY[density] ?? DENSITY.default

  return (
    <div
      className={[
        'overflow-x-auto',
        // Sticky headers only work inside a two-axis scroll container with a
        // bounded height. `overflow-x` alone would compute `overflow-y: auto`
        // on an unbounded box, which silently kills `position: sticky`.
        stickyHeader ? 'max-h-[70vh] overflow-y-auto' : 'overflow-y-visible',
        className,
      ].join(' ')}
    >
      <table className="w-full border-collapse text-body">
        <caption className="sr-only">
          {caption}
          {captionExtra && <span> {captionExtra}</span>}
        </caption>

        <thead
          className={[
            stickyHeader ? 'sticky top-0 z-[var(--gc-z-sticky)]' : '',
            'bg-surface-sunken',
          ].join(' ')}
        >
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                style={column.width ? { width: column.width } : undefined}
                className={[
                  'border-b border-line-strong px-3 align-middle text-label font-semibold whitespace-nowrap text-ink-muted',
                  CELL_ALIGN[alignFor(column)],
                  rowHeight,
                  column.headerClassName,
                ].join(' ')}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading &&
            Array.from({ length: skeletonRows }, (_, index) => (
              <tr key={`skeleton-${index}`} className="border-b border-line">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    // The skeleton has to reproduce the column's visibility and
                    // alignment rules, otherwise the loading layout is wider and
                    // shaped differently from the layout it is standing in for.
                    className={[
                      'px-3 align-middle',
                      rowHeight,
                      CELL_ALIGN[alignFor(column)],
                      column.cellClassName,
                    ].join(' ')}
                  >
                    <Skeleton
                      variant="text"
                      className={column.numeric ? 'ml-auto w-16' : 'w-32'}
                    />
                  </td>
                ))}
              </tr>
            ))}

          {!loading &&
            rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          onRowClick(row)
                        }
                      }
                    : undefined
                }
                className={[
                  'border-b border-line last:border-b-0',
                  onRowClick &&
                    'cursor-pointer transition-colors duration-[var(--gc-duration-fast)] hover:bg-surface-hover',
                ].join(' ')}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={[
                      'px-3 align-middle text-ink',
                      rowHeight,
                      CELL_ALIGN[alignFor(column)],
                      // Tabular figures + mono is what makes a price column read
                      // as a column instead of a ragged edge. The global
                      // `[data-tabular]` rule in index.css owns the figures.
                      // `numeric` implies both; `mono` alone is for codes, which
                      // stay left-aligned but still need fixed-width digits.
                      (column.numeric || column.mono) &&
                        'font-mono text-mono tracking-tight',
                      column.cellClassName,
                    ].join(' ')}
                    data-tabular={column.numeric || column.mono ? '' : undefined}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>

      {!loading && rows.length === 0 && empty}
    </div>
  )
}

export default DataTable
