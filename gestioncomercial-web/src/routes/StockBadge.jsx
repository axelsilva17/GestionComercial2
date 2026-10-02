/**
 * StockBadge -- the stock state of a product, as one of three distinct states.
 *
 * Extracted to its own module because the same three states appear in more than
 * one screen (the Productos table and the Dashboard alerts panel), and two
 * copies of a status mapping eventually disagree about where the threshold is.
 *
 * The threshold itself is the domain's: `StockMinimo` is the level at or below
 * which a product needs restocking, so `<= StockMinimo` is "stock bajo" and
 * exactly `0` is "agotado". A product with `StockMinimo === 0` and
 * `StockActual === 0` reads as agotado, which is the right answer.
 *
 * Colour is never the signal: each tone ships a word. DESIGN.md accessibility
 * rule 14.
 */
import Badge from '../components/Badge.jsx'

export function StockBadge({ producto }) {
  if (producto.StockActual === 0) {
    return <Badge tone="danger">Agotado</Badge>
  }

  if (producto.StockActual <= producto.StockMinimo) {
    return <Badge tone="warning">Stock bajo</Badge>
  }

  return <Badge tone="accent">Disponible</Badge>
}

export default StockBadge