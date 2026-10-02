/**
 * KpiTile -- one headline number.
 *
 * The split between the sans and the mono face is the whole design decision here:
 * the label is prose and stays in Fira Sans, the value is a figure that has to be
 * scanned against its neighbour and goes in Fira Code with tabular figures. A
 * KPI row set entirely in mono reads as a terminal, and the labels stop being
 * readable as words.
 *
 * Colour on the hint is decoration on top of text that already carries the
 * meaning: `+12,4%` says up regardless of how it is tinted.
 */
import Skeleton from '../components/Skeleton.jsx'
import { CARD_SURFACE } from '../components/Card.jsx'

/**
 * @param {object} props
 * @param {string} props.label what the number measures
 * @param {string} props.value preformatted by `src/utils/format.js`
 * @param {string} props.hint comparison or context line
 * @param {'neutral' | 'up' | 'down'} props.tone hint colour only
 * @param {import('react').ComponentType<{ className?: string }>} props.icon
 */
export function KpiTile({ label, value, hint, tone = 'neutral', icon: Icon }) {
  const toneClasses = {
    neutral: 'text-ink-subtle',
    up: 'text-accent-ink',
    down: 'text-danger-ink',
  }

  return (
    <div className={`${CARD_SURFACE} p-5`}>
      <p className="flex items-center gap-2 text-caption text-ink-muted">
        {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" />}
        {label}
      </p>

      {/* `data-tabular` is what makes the figures share a column width, so a
          narrow number does not shift the one below it. */}
      <p
        data-tabular
        className="mt-1 font-mono text-title tracking-tight text-ink"
      >
        {value}
      </p>

      <p className={`mt-1 text-caption ${toneClasses[tone]}`}>{hint}</p>
    </div>
  )
}

/** Same footprint, placeholder content. Painted in `primary-subtle`. */
export function KpiTileSkeleton() {
  return (
    <div className={`${CARD_SURFACE} p-5`}>
      <Skeleton variant="text" className="w-28" />
      <Skeleton variant="title" className="mt-2 w-36" />
      <Skeleton variant="text" className="mt-2 w-24" />
    </div>
  )
}

export default KpiTile