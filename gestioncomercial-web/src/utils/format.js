/**
 * Locale formatting -- the single place where a number becomes text.
 *
 * Contract: DESIGN.md > Typography (mono + tabular figures for anything that
 * has to align in a column) and the locale requirement for es-AR money.
 *
 * Why a shared module and not `toLocaleString` at each call site: formatting is
 * a product decision, not a convenience. `es-AR` puts the thousands separator on
 * `.` and the decimal on `,`, so `"$" + precio.toFixed(2)` is wrong in three
 * separate ways. Once the `Intl` formatters are constructed once, formatting a
 * price is a pure function and the screens cannot drift apart.
 *
 * The currency symbol is the locale's narrow symbol (`$`) rather than a
 * hardcoded `AR$`: `Intl` renders the peso sign with a non-breaking space, which
 * also keeps the symbol from wrapping away from its amount.
 *
 * No type coercion happens here. Callers pass the domain value as-is.
 */

const LOCALE = 'es-AR'
const CURRENCY = 'ARS'

/** Full precision money: `$ 1.234.567,89`. Cells and totals. */
const money = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Money rounded to the peso: `$ 1.234.567`. KPI tiles. */
const moneyWhole = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

/**
 * Money in compact notation: `$99 k`, `$1 M`.
 *
 * Only for axis/label contexts that cannot fit the full figure. Zero fraction
 * digits is deliberate: the exact amount belongs on the KPI tile and in the
 * chart's accessible description, not crammed into a 44px-wide column.
 */
const moneyCompact = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 0,
})

/** Plain integers with the es-AR grouping: `1.234.567`. */
const integer = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })

/** Signed percentage for period-over-period deltas: `+12,4%`, `-5,1%`. */
const percent = new Intl.NumberFormat(LOCALE, {
  style: 'percent',
  signDisplay: 'always',
  maximumFractionDigits: 1,
})

const dateTime = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'short', timeStyle: 'short' })
const dayMonth = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit' })
const weekdayShort = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' })

/**
 * @param {number} value amount in pesos
 * @returns {string} e.g. `$ 1.234.567,89`
 */
export function formatCurrency(value) {
  return money.format(value)
}

/**
 * @param {number} value amount in pesos
 * @returns {string} e.g. `$ 1.234.567`
 */
export function formatCurrencyWhole(value) {
  return moneyWhole.format(value)
}

/**
 * @param {number} value amount in pesos
 * @returns {string} e.g. `$99 k`
 */
export function formatCurrencyCompact(value) {
  return moneyCompact.format(value)
}

/**
 * @param {number} value
 * @returns {string} e.g. `1.234.567`
 */
export function formatInteger(value) {
  return integer.format(value)
}

/**
 * @param {number} ratio fraction, not percent: `0.124` renders `+12,4%`
 * @returns {string} signed percentage
 */
export function formatPercent(ratio) {
  return percent.format(ratio)
}

/**
 * @param {string} isoDate ISO-8601 instant
 * @returns {string} e.g. `29/9/26, 11:32 a. m.`
 */
export function formatDateTime(isoDate) {
  return dateTime.format(new Date(isoDate))
}

/**
 * @param {string} isoDate ISO-8601 instant
 * @returns {string} e.g. `24/9`
 */
export function formatDayMonth(isoDate) {
  return dayMonth.format(new Date(isoDate))
}

/**
 * @param {string} isoDate ISO-8601 instant
 * @returns {string} e.g. `jue`
 */
export function formatWeekday(isoDate) {
  return weekdayShort.format(new Date(isoDate))
}