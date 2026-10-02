// WCAG 2.1 contrast audit over the COMPILED CSS.
//
// index.css uses `@theme inline`, so `text-ink` does not become `var(--color-ink)`
// -- it is compiled straight to `var(--gc-r-ink)`. Measuring the `--color-*`
// names would therefore measure variables that never reach the browser. This
// script reads the emitted utility rules, follows them to the raw token they
// actually reference, and computes the ratio in both colour schemes.
//
// Usage: node contrast-audit.mjs <dir-with-built-css>

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
const file = join(dir, readdirSync(dir).find((f) => f.endsWith('.css')))
const css = readFileSync(file, 'utf8')

function props(body) {
  const out = {}
  for (const m of body.matchAll(/(--[\w-]+):\s*([^;}]+)/g)) out[m[1]] = m[2].trim()
  return out
}

const light = { ...props(css.match(/:root\{([^}]*)\}/)[1]) }
const darkBlock = css.match(/@media\s*\(prefers-color-scheme:dark\)\s*\{\s*:root\s*\{([^}]*)\}/)
if (!darkBlock) throw new Error('no prefers-color-scheme:dark block found')
const dark = { ...light, ...props(darkBlock[1]) }

/**
 * Resolve a utility class to the raw token it paints with, e.g.
 * `text-ink-muted` -> `--gc-r-ink-muted`. Handles `hover:`/`focus:` prefixes.
 * A utility that paints with a literal hex is returned as that literal: there is
 * exactly one of them (`text-ink-on-overlay`) and it is deliberate.
 */
function tokenFor(utility) {
  // A raw token name may be passed directly (e.g. the focus ring, which is
  // applied by a global :focus-visible rule rather than by a utility class).
  if (utility.startsWith('--')) return utility

  const selector =
    '\\.' +
    utility
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      // Lightning CSS escapes the colon in `hover:bg-x` as `hover\:bg-x`, so the
      // pattern needs a literal backslash before each colon, not a regex escape.
      .replace(/:/g, '\\\\:')
  const m = css.match(new RegExp(`${selector}(?=[,{:])[^{]*\\{([^}]*)\\}`))
  if (!m) throw new Error(`utility .${utility} is not in the compiled CSS`)
  const ref = m[1].match(/var\((--[\w-]+)/)
  if (ref) return ref[1]
  const literal = m[1].match(/#(?:[0-9a-f]{3,8})/i)
  if (literal) return literal[0]
  throw new Error(`.${utility} does not paint with a token var: ${m[1]}`)
}

function toHex(token, scope) {
  let h = token
  if (h.startsWith('--')) {
    h = scope[h]
    if (h === undefined) throw new Error(`token ${token} not defined in this scheme`)
  }
  h = h.trim().replace(/^#/, '')
  if (h.length === 8) h = h.slice(0, 6)
  if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
  if (h.length !== 6) throw new Error(`cannot read ${token} = ${scope[token]}`)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

function luminance([r, g, b]) {
  const ch = (v) => {
    const s = v / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b)
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Every foreground/background pair the three screens actually ship.
 *
 * `kind`:
 *   text      4.5:1 required -- WCAG 2.1 SC 1.4.3 (normal text)
 *   large     3.0:1 required -- SC 1.4.3 (>=24px, or >=18.66px bold)
 *   nontext   3.0:1 required -- SC 1.4.11 (a border, focus ring or chart mark
 *             that is needed to identify a control or convey state)
 *   decor     exempt        -- a purely decorative separator. Card outlines and
 *             table rules do not convey information the surrounding layout does
 *             not already convey; DESIGN.md classes them as decoration. Reported
 *             for information, never counted as a failure.
 *   disabled  exempt        -- SC 1.4.3 explicitly exempts inactive components.
 */
const PAIRS = [
  ['text-ink', 'bg-surface', 'text', 'body copy inside cards'],
  ['text-ink', 'bg-canvas', 'text', 'body copy on the page'],
  ['text-ink', 'bg-surface-sunken', 'text', 'body copy on table headers'],
  ['text-ink-muted', 'bg-surface', 'text', 'secondary copy, card descriptions'],
  ['text-ink-muted', 'bg-canvas', 'text', 'secondary copy on the page'],
  ['text-ink-muted', 'bg-surface-sunken', 'text', 'table header labels, pagination'],
  ['text-ink-subtle', 'bg-surface', 'text', 'hints, captions, empty-cell dash'],
  ['text-ink-subtle', 'bg-surface-sunken', 'text', 'hints on a table header'],
  ['text-accent-ink', 'bg-accent-subtle', 'text', 'accent badge ("Disponible")'],
  ['text-accent-ink', 'bg-surface', 'text', 'inline links'],
  ['text-ink-inverse', 'bg-accent-strong', 'text', 'primary button label (rest)'],
  ['text-ink-inverse', 'hover:bg-accent-strong-hover', 'text', 'primary button label (hover)'],
  ['text-ink-inverse', 'active:bg-accent-strong-active', 'text', 'primary button label (pressed)'],
  ['text-ink-inverse', 'bg-accent-strong', 'text', 'active nav item label, sidebar mark'],
  ['active:text-accent-strong', 'bg-surface', 'text', 'link in the pressed state'],
  ['text-danger-ink', 'bg-danger-subtle', 'text', 'danger badge ("Agotado"), error copy'],
  ['text-danger-ink', 'bg-surface', 'text', 'danger icon in row actions'],
  ['text-warning-ink', 'bg-warning-subtle', 'text', 'warning badge ("Stock bajo")'],
  ['text-warning-ink', 'bg-surface', 'text', 'warning copy on cards'],
  ['text-info-ink', 'bg-info-subtle', 'text', 'info badge'],
  ['text-primary-subtle-ink', 'bg-primary-subtle', 'text', 'neutral badge ("Inactivo")'],
  ['text-ink-on-overlay', 'bg-overlay', 'text', 'text on a modal scrim'],
  ['text-danger', 'bg-surface', 'nontext', 'invalid input border'],
  ['text-danger', 'bg-danger-subtle', 'nontext', 'invalid input border on its own tint'],
  ['border-line-control', 'bg-surface', 'nontext', 'input/select/checkbox border'],
  ['hover:border-line-control-hover', 'bg-surface', 'nontext', 'hovered input border'],
  ['--gc-r-focus', 'bg-surface', 'nontext', 'focus ring against a card'],
  ['--gc-r-focus', 'bg-canvas', 'nontext', 'focus ring against the page'],
  ['--gc-r-focus', 'bg-surface-sunken', 'nontext', 'focus ring against a table header'],
  ['bg-accent', 'bg-surface', 'nontext', 'chart bar against the card'],
  ['bg-accent-strong', 'bg-surface', 'nontext', 'primary button fill vs card'],
  ['border-line', 'bg-surface', 'decor', 'card outline'],
  ['border-line-strong', 'bg-surface-sunken', 'decor', 'table header rule'],
  ['text-disabled-ink', 'bg-disabled-bg', 'disabled', 'disabled control label'],
]

function audit(scope, label) {
  console.log(`\n=== ${label} ===`)
  let failures = 0
  for (const [fgUtil, bgUtil, kind, note] of PAIRS) {
    const threshold = kind === 'nontext' ? 3.0 : 4.5
    const enforced = kind === 'text' || kind === 'nontext' || kind === 'large'
    try {
      const fg = tokenFor(fgUtil)
      const bg = tokenFor(bgUtil)
      const r = ratio(toHex(fg, scope), toHex(bg, scope))
      const pass = r >= threshold - 0.005
      if (enforced && !pass) failures += 1
      const tag = enforced ? (pass ? 'PASS' : 'FAIL') : `n/a (${kind})`
      console.log(
        `  ${tag.padEnd(12)} ${r.toFixed(2).padStart(6)}:1  min ${threshold.toFixed(1)}  ` +
          `${fgUtil} on ${bgUtil}  -- ${note}`,
      )
    } catch (error) {
      failures += 1
      console.log(`  ??           ${fgUtil} on ${bgUtil}: ${error.message}`)
    }
  }
  return failures
}

const failures = audit(light, 'LIGHT') + audit(dark, 'DARK')
console.log(`\n${failures === 0 ? 'ALL PAIRS PASS' : `${failures} FAILING PAIR(S)`}`)
process.exit(failures === 0 ? 0 : 1)