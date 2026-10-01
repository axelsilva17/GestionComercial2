# GestionComercial Design System

**Version:** 1.0.0 (T1/T2 contract)  
**Last updated:** 2026-09-30  
**Status:** Source of truth. The executable form of these tokens lives in `gestioncomercial-web/src/index.css`.

This document is the human-readable contract. `src/components/` must compose against it; if a primitive cannot satisfy a requirement without breaking a rule, update this document first and the code second. Nothing in this document is aspirational: the primitives that exist are documented, and anything undocumented does not exist.

## Language

- UI copy: **Spanish** (matches the domain messages in `GestionComercial.Domain/Entidades/*.cs`).  
- Code, identifiers, comments, PR titles: **English**.  
- Nothing in the visual copy may use emoji.

## Foundations

### Color roles

Color is never used as the only signal. Every semantic color has a companion label or icon. Hex values are provided here for verification only; components reference the token name (`var(--color-*)`).

Ratios below are **computed from these exact hex values** with the WCAG 2.1 relative-luminance formula, not estimated. The full verification output is in [Verification evidence](#verification-evidence).

| Role | Token | Light | Dark | Usage | Verified contrast |
| --- | --- | --- | --- | --- | --- |
| Canvas | `--color-canvas` | `#F8FAFC` | `#0B1120` | Base background. No elevation, no border. | — |
| Surface | `--color-surface` | `#FFFFFF` | `#131E31` | Cards, dialogs, tables. The only surface that carries elevation. | — |
| Surface (sunken) | `--color-surface-sunken` | `#F1F5F9` | `#0F1929` | Table headers, dialog footers. | — |
| Surface (hover) | `--color-surface-hover` | `#F8FAFC` | `#1B2739` | Hover on rows and toolbars. | — |
| Overlay (scrim) | `--color-overlay` | `rgba(15,23,42,.48)` | `rgba(2,6,16,.66)` | Focus lock behind a modal. | — |
| Ink (primary) | `--color-ink` | `#0F172A` | `#E7EDF5` | Primary body text. | 17.06 / 17.85 / 16.30 on canvas / surface / sunken |
| Ink (muted) | `--color-ink-muted` | `#334155` | `#CBD5E1` | Secondary text, field labels, table headers. | 9.90 / 10.35 / 9.45 |
| Ink (subtle) | `--color-ink-subtle` | `#475569` | `#A3B1C4` | Hints, placeholders, helper text. | 7.24 / 7.58 / 6.92 |
| Ink (inverse) | `--color-ink-inverse` | `#FFFFFF` | `#0B1120` | Text on `primary`, `accent-strong`, `danger`. | See each fill below |
| Ink (on overlay) | `--color-ink-on-overlay` | `#FFFFFF` | `#FFFFFF` | Icon buttons floating over a scrim. Theme-invariant by design. | — |
| Line | `--color-line` | `#E6E8EA` | `#24324A` | Decorative hairlines: card borders, table row rules. No state. | — |
| Line (strong) | `--color-line-strong` | `#CBD5E1` | `#35455F` | Table header bottom rule, `secondary` button border. | — |
| **Line (control)** | `--color-line-control` | `#64748B` | `#7D8CA0` | **Boundary of an input, select, or checkbox.** | 4.76 on surface, 4.55 on canvas (min 3) |
| Line (control hover) | `--color-line-control-hover` | `#475569` | `#94A3B8` | Field border on hover. | 7.58 on surface |
| Primary | `--color-primary` | `#334155` | `#E2E8F0` | Neutral chrome. Inverts in dark mode: solid fill carries dark text. | 10.35 with inverse ink |
| Primary (hover / active) | `--color-primary-hover` / `active` | `#1E293B` / `#0F172A` | `#F1F5F9` / `#F8FAFC` | — | — |
| Primary (subtle) | `--color-primary-subtle` | `#F1F5F9` | `#1B2739` | Badge and Skeleton fill. Foreground: `--color-primary-subtle-ink`. | 13.35 with subtle-ink |
| Accent | `--color-accent` | `#059669` | `#34D399` | Stock/positive *signal*: chart series, status dot, badge fill. | 3.77 with white — **non-text only** |
| Accent (strong) | `--color-accent-strong` | `#047857` | `#6EE7B7` | **Primary CTA fill** and the global focus ring. | 5.48 with inverse ink |
| Accent (strong hover / active) | `--color-accent-strong-hover` / `active` | `#065F46` / `#064E3B` | `#A7F3D0` / `#D1FAE5` | — | 7.68 / 9.72 with inverse ink (dark: 14.68 / 16.60) |
| Accent (ink / subtle) | `--color-accent-ink` / `subtle` | `#065F46` / `#ECFDF5` | `#A7F3D0` / `#06342A` | Success text, success badge. | 7.68 on surface; 7.29 on subtle |
| Danger | `--color-danger` | `#DC2626` | `#F87171` | Destructive fill. | 4.83 with inverse ink |
| Danger (ink / subtle) | `--color-danger-ink` / `subtle` | `#B91C1C` / `#FEF2F2` | `#FECACA` / `#3B1416` | Error text, error badge. | 6.47 on surface; 5.91 on subtle |
| Warning (ink / subtle) | `--color-warning-ink` / `subtle` | `#B45309` / `#FFFBEB` | `#FCD34D` / `#3A2408` | "Stock at minimum". | 4.84 on subtle |
| Info (ink / subtle) | `--color-info-ink` / `subtle` | `#0369A1` / `#F0F9FF` | `#7DD3FC` / `#082F49` | Informational. | 5.57 on subtle |
| Focus | `--color-focus` | `#047857` | `#34D399` | Global focus ring. | 5.48 on surface, 5.24 on canvas, 5.01 on sunken (min 3) |
| Disabled | `--color-disabled-bg` / `ink` / `line` | `#F1F5F9` / `#475569` / `#CBD5E1` | `#1B2739` / `#7D8CA0` / `#35455F` | Non-interactive controls. Never reused for interactive. | 6.92 |

#### Two decisions that deviate from the original direction, and why

Both were forced by measurement, not preference. The original values are kept where they still pass.

1. **`accent` `#059669` cannot be the CTA fill.** White on `#059669` is **3.77:1** — it fails WCAG 1.4.3 for normal text. `#059669` is kept as `--color-accent` for non-text signal use (chart series, status dots, ≥3:1 contexts). The CTA fill is `--color-accent-strong` = `#047857`, one step darker on the same hue, at **5.48:1**. Visually indistinguishable at a glance; the difference only shows up in a contrast audit.

2. **A `#E6E8EA` hairline cannot be a control boundary.** It measures **1.48:1** against a white input fill, far below the 3:1 that WCAG 1.4.11 requires for the boundary that identifies a control. Rather than fatten every field border to a heavy gray, the two concerns were split: `--color-line` stays `#E6E8EA` for decorative hairlines (which carry no state and are exempt), and a new `--color-line-control` = `#64748B` (**4.76:1**) owns field boundaries.

A third, smaller consequence: the original `--color-ink-muted` `#475569` / `--color-ink-subtle` `#64748B` pair was reassigned one step darker (`#334155` / `#475569`). `#64748B` is only **4.34:1** on the sunken table-header fill, so as a text tier it could not be relied on everywhere the tier appears. The whole three-tier text ramp now clears 4.5:1 on canvas, surface, and sunken in both schemes.


### Typography

Fonts are loaded in `index.html`:

- **Fira Sans**: body, UI, labels (weight 400/500/600/700).  
- **Fira Code**: monospaced numerals and codes (weight 400/500/600). Required for prices/stock/codes.

All steps include their own `line-height`, `letter-spacing` and `font-weight` in the theme tokens; `text-*` utilities must not need extra classes to satisfy the scale.

| Step | Token class | Size (rem/px) | Line height | Letter spacing | Weight | Usage |
| --- | --- | --- | --- | --- | --- | --- |
| Display | `text-display` | 2.0rem (32px) | 2.5rem (40px) | -0.02em | 600 | Page title (h1). |
| Title | `text-title` | 1.375rem (22px) | 1.875rem (30px) | -0.01em | 600 | Section title (h2 in cards). |
| Heading | `text-heading` | 1.0625rem (17px) | 1.5rem (24px) | 0em | 600 | Card header, subsection. |
| Body | `text-body` | 0.9375rem (15px) | 1.5rem (24px) | 0em | 400 | Default. |
| Label | `text-label` | 0.8125rem (13px) | 1.125rem (18px) | 0em | 500 | Buttons, inputs, nav. |
| Caption | `text-caption` | 0.75rem (12px) | 1rem (16px) | 0em | 400 | Hints, errors, badges. |
| Mono | `text-mono` | 0.8125rem (13px) | 1.25rem (20px) | 0em | 400 | Prices, stock, codes. |
| Mono-sm | `text-mono-sm` | 0.75rem (12px) | 1rem (16px) | 0em | 400 | Totals in compact rows. |

Tabular figures: cells with `column.numeric` get `font-mono text-mono tracking-tight` and the DOM element has `data-tabular` (the global rule enables `tabular-nums slashed-zero`). Column alignment must be `right` when numeric.

### Spacing

Base unit `0.25rem` (4px). The theme uses `--spacing: 0.25rem`. Use multiples by utility name (`p-2 = 8px`, `gap-3 = 12px`, `p-5 = 20px`).

Density: `--density-row-default: 2.75rem` (44px painted height), `--density-row-compact: 2.25rem` (36px). `DataTable` applies these to `td/th` via `rowHeight` and always aligns vertically to `align-middle`.

### Radius

| Name | Value | Usage |
| --- | --- | --- |
| `radius-sm` | 0.25rem (4px) | Badges, inputs inside tight groups. |
| `radius-md` | 0.375rem (6px) | Inputs, buttons, controls. |
| `radius-lg` | 0.5rem (8px) | Cards, dialogs. |

### Elevation

Four steps, flat and deliberate. No multi-layer blur stacks.

| Shadow | CSS token | Usage |
| --- | --- | --- |
| none | `--shadow-none` | Toolbars flush with surface. |
| xs | `0 1px 2px 0 rgb(15 23 42 / 0.05)` | Inputs, buttons resting. |
| sm | `0 1px 3px 0 rgb(15 23 42 / 0.08)` | Hovered inputs, lists. |
| md | `0 4px 12px -2px rgb(15 23 42 / 0.1)` | Toasts, dropdowns. |
| lg | `0 12px 32px -8px rgb(15 23 42 / 0.18)` | Dialogs. |

### Motion & Z-index

| Duration | Value | Usage |
| --- | --- | --- |
| `--gc-duration-fast` | 120ms | Hover/active, button transitions. |
| `--gc-duration-base` | 180ms | Toast in, drawer in. |

Easing: `--gc-ease-ui: cubic-bezier(0.2,0,0,1)`.

Z-index: header `30`, sticky `20`, dropdown `40`, dialog `50`, toast `60`.

Reduced motion: `@media (prefers-reduced-motion: reduce)` in `index.css` neutralises all animations/transitions and `scroll-behavior`. Interactive utilities that animate must be `motion-safe:`. `Skeleton` uses `motion-safe:animate-pulse`.

## Layout

- **App shell**: persistent sidebar (`w-60`) at `lg+`. Below `lg`, sidebar becomes an overlay drawer (`max-w-[85vw]`). Drawer closes on `Escape`, on click outside (scrim), and on navigation. Focus returns to the trigger.
- **Header**: `h-14`, sticky, `bg-surface`, `border-b border-line`, `z-[var(--gc-z-header)]`.
- **Main**: `p-4 sm:p-6`, content container `max-w-7xl mx-auto` per page frame.
- **Responsive breakpoints**: 375 / 768 / 1024 / 1440. Tables degrade to stacked cards below 768 (implemented when a table is present; no table is rendered in T3).
- **No horizontal scroll** as a goal at the stated breakpoints. Never let a numeric column force overflow by breaking tabular alignment.

## Component contracts

### Button

Props (TypeScript intent for clarity): `variant`, `size`, `type`, `loading`, `disabled`, `iconOnly`, `className`, `ref`.

| Variant | Background | Border | Text | State |
| --- | --- | --- | --- | --- |
| `primary` | `bg-accent-strong` | `border-transparent` | `text-ink-inverse` | hover `accent-strong-hover`, active `accent-strong-active` |
| `secondary` | `bg-surface` | `border-line-strong` | `text-ink` | hover `surface-hover`, active `surface-sunken` |
| `ghost` | `bg-transparent` | `border-transparent` | `text-ink-muted` | hover `surface-hover` + text `ink`, active `surface-sunken` |
| `danger` | `bg-danger` | `border-transparent` | `text-ink-inverse` | hover `danger-hover` |
| `link` | `bg-transparent` | `border-transparent` | `text-accent-ink` | hover underline, active `accent-strong` |

Sizes: `sm` h-9 px-3 text-label; `md` h-10 px-4 text-body; `lg` h-11 px-5 text-body.  
Icon-only: square `size-9/10/11`; hit area expands by `-m-2` pseudo-element to >=44px minimum without changing painted box.  
Rules: `iconOnly` => must provide `aria-label` or `aria-labelledby`. `loading` => `disabled`, `aria-busy`, renders `Loader2` (spin, `motion-reduce:animate-none`), keeps width stable. Focus ring comes from base layer.

### TextField

Visible label always. Placeholder is not a label.  
States: default `border-line-control`, hover `border-line-control-hover`, error `aria-[invalid=true]:border-danger`, disabled `disabled-bg/ink/line`.  
Accessibility: `aria-invalid`, `aria-describedby` points to `hint` **or** `error` (never both are rendered). Required is marked with `*` and the asterisk is `aria-hidden="true"` — the `required` attribute carries the semantics.  
Optional: `mono` applies `font-mono text-mono tracking-tight`, for codes and prices.  
`ref` is forwarded to the native `<input>`, so a screen can move focus to the first field that failed validation instead of scrolling to it and hoping.

### SelectField

Native `<select>` with `appearance-none` and a decorative `ChevronDown`. Same label / hint / error / `ref` contract as `TextField`. Native on purpose: it inherits the platform keyboard model, the mobile wheel picker, and correct screen-reader semantics.

### CheckboxField

The whole row is the hit target (`min-h-11` = 44px), which gets the control past the touch minimum without inflating the visual box. The native input stays painted (not `opacity-0`) so it keeps its own focus ring and platform rendering; only a `Check` glyph is layered over it via `peer`. Hint and error render below, aligned to the label column.

### Card

Border `border-line`, background `surface`, shadow `xs`. Header: title `text-heading`, description `text-caption text-ink-subtle`, optional actions right. Footer optional. `padded` default true. No nested cards.

### Badge

Non-interactive. Tones: `neutral`, `accent`, `warning`, `danger`, `info`. Classes pair background+foreground (subtle bg + ink). Colour never sole signal.

### Skeleton

`aria-hidden="true"`. Paired with a live region announcing load. `motion-safe:animate-pulse`. Variants: `text`, `title`, `block`, `row`, `circle`.

### EmptyState

Normal outcome (not failure). Icon in pill `bg-primary-subtle text-ink-subtle`. Title `text-heading`, description `text-body text-ink-muted`. Optional action.

### DataTable

Required: `columns`, `rows`, `rowKey`, `caption`. Optional: `captionExtra` (appended to caption text for screen-reader context), `density` (`default|compact`), `stickyHeader`, `loading`, `skeletonRows`, `empty`, `onRowClick`.  
Columns: `{ key, header, width?, align?, numeric?, mono?, render?, headerClassName?, cellClassName? }`.  
`numeric` => align `right`, font mono, `data-tabular`. `numeric` **forces** right alignment; `align` cannot override it, because the rule is a property of the column and not of the caller's memory.  
`mono` => font mono + `data-tabular`, left-aligned unless `align` says otherwise. Codes keep their own alignment but still get fixed-width digits.  
`headerClassName` / `cellClassName` are applied to the header cell, the data cell **and the skeleton cell** for that column, so a column that is hidden below a breakpoint is hidden in every state and the loading layout keeps the loaded layout's shape.  
Sticky header requires bounded height (`max-h-[70vh] overflow-y-auto`) when enabled (implementation detail: prevents sticky from losing context). Row click is keyboard-accessible (Enter/Space). Empty state rendered only when `!loading && rows.length===0`.

### PagePlaceholder

Screen frame: title, optional description, optional `actions` slot, body. `actions` sits beside the title from `sm` up and below it on narrow viewports, so a primary CTA is never squeezed into a 375px column. The page-level action belongs to the frame, not to the screen body — that is why it is a prop here and not a hand-placed button in each screen.

### Dialog

Focus lifecycle owned: on open focus moves to first focusable or panel; Tab/Shift+Tab trapped; Escape closes; on close focus returns to opener; `document.body.overflow` locked. Scrim decorative (no nameless clickable region exposed to AT). ARIA: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby` when description exists. Sizes `sm|max-w-md`, `md|max-w-xl`, `lg|max-w-3xl`. Footer right-aligned.

### Toast

Transient. Region `role="region" aria-label="Notificaciones" aria-live="polite"`. Stack bottom-right on `sm+`, centered bottom on mobile. Tones: `info`, `accent` (success), `warning`, `danger` (persists until dismissed; others auto-dismiss by duration). Each has icon+label; dismiss button labelled "Descartar notificación". Animation `toast-in`, `motion-safe`.

## Screen-level compositions (T4–T6)

These are **not** primitives. They live in `src/routes/`, they are composed from
primitives only, and they add no colour, radius, elevation or duration of their
own. They are documented here because their shape is a decision worth reusing,
not an accident.

| Module | What it is | Contract |
| --- | --- | --- |
| `useResource(loader, deps)` | `{ cargando, datos, error, recargar }` | One in-flight read. `recargar()` returns the promise, so a mutation can await the refresh it caused instead of leaving stale rows on screen. |
| `ErrorPanel` | Failed read, with retry | Replaces the body region that failed. Never used for a failed mutation — that is a toast. |
| `StockBadge` | `Agotado` / `Stock bajo` / `Disponible` | The threshold is the domain's: `<= StockMinimo` is low, `=== 0` is out. One definition, because the Productos table and the Dashboard alerts both render it. |
| `KpiTile` | One dashboard metric | Label + tabular value + hint. A tile is never clickable: there is no destination, so a clickable KPI is a lie about the interaction. |
| `EncabezadoOrdenable` | Sortable table header | A native `<button>`, not a `Button`: it must fill the `<th>` exactly, and `Button` ships its own `h-9 px-3` box that would fight the cell. It still gets the global focus ring and the same `-m-2` hit-area expansion. |
| `SalesTrendChart` | The one chart, as bars | HTML/CSS only. Every bar is labelled with its value; `role="img"` carries the whole series as `aria-label`. One chart per screen. |

### Responsive table rule

A dense table degrades to **stacked cards below `md`**, not to a horizontally
scrolling table. Reading a price by scrolling a phone sideways is worse than
dropping columns. Both render paths read the same memoised rows so they cannot
drift apart, and from `md` up the lowest-value columns are hidden with
`cellClassName` (`hidden lg:table-cell`) rather than dropped in JS, so the
skeleton rows agree with the real ones.

### Pagination and sorting live in the screen

The data module returns a collection; how it is ordered, paged and filtered is UI
state. Sorting is `localeCompare(_, 'es')` for text so `Ánfora` sorts with `A`. The
page offset is clamped during render (`min(pagina, totalPaginas)`) so a delete
that shrinks the list cannot leave the user on an empty page 4, and the offset is
*reset* in the events that invalidate it — a new query, a new sort — rather than
in an effect.

## Data table rules (explicit)

- Row height: `default 44px`, `compact 36px`. Applied to both `th` and `td`.
- Numeric alignment: `right` for `column.numeric`. Use `font-mono text-mono tracking-tight` and `data-tabular`.
- Header sticky: only when `stickyHeader=true` and container has `max-h-[70vh] overflow-y-auto` (x+y scroll). Background `surface-sunken`, border bottom `line-strong`.
- Density mode: `density` prop selects height; never mix densities in the same table.
- Caption: required. If no visible caption, still provide `caption` for SR and optionally `captionExtra`.
- Row click: keyboard-accessible. No clickable divs masquerading as rows.

## Accessibility contract (verifiable)

Each rule below is checkable by inspecting the DOM or by computing a ratio. None of them are aspirations.

| # | Rule | How it is verified |
| --- | --- | --- |
| 1 | Every text input, select, and checkbox has a visible `<label>`. | `querySelectorAll('input:not([aria-label]):not([id])')` finds no unlabeled field; a placeholder is never the label. |
| 2 | On error, the field carries `aria-invalid="true"` and `aria-describedby` pointing at the message element. | The `errorId` referenced by `aria-describedby` exists in the DOM and contains the message text. |
| 3 | Focus ring: 2px solid `--color-focus`, 2px offset, on every focusable element. | Single global `:focus-visible` rule in `index.css` base layer. Measured ≥3:1 against canvas (5.24), surface (5.48), and sunken (5.01). |
| 4 | Icon-only controls expose an accessible name. | `Button` throws at render when `iconOnly` is set without `aria-label`/`aria-labelledby`. |
| 5 | Decorative icons are hidden from the accessibility tree. | Every decorative `<svg>` has `aria-hidden="true"`. |
| 6 | Normal body text measures ≥4.5:1 against its actual background. | Every text pair is measured by `npm run audit:contrast` against the compiled stylesheet, in both schemes. 22 pairs per scheme, all pass. |
| 7 | Control boundaries measure ≥3:1 against the control's own fill. | `--color-line-control` = 4.76:1 on surface. No field uses `--color-line`. |
| 8 | Interactive hit area ≥44×44 CSS px. | `Button` icon-only paints 36/40/44px and expands the hit area with a transparent `-m-2` pseudo element; `CheckboxField` row is `min-h-11` (44px); `NavLink` is `min-h-11`. |
| 9 | `prefers-reduced-motion: reduce` neutralises all motion. | Global media query in the base layer zeroes durations; animated utilities are additionally gated behind `motion-safe:`. |
| 10 | Dialogs are modal and manage focus. | `role="dialog"`, `aria-modal="true"`, focus moved in on open, Tab trapped, Escape closes, focus restored on close, body scroll locked. |
| 11 | Transient messages are announced without stealing focus. | Region is `role="region" aria-label="Notificaciones" aria-live="polite"`. |
| 12 | Data tables are identifiable and navigable. | `<caption>` is required by the `DataTable` contract; headers use `scope="col"`; clickable rows respond to Enter and Space. |
| 13 | Language is declared. | `<html lang="es">`. |
| 14 | Status is never conveyed by color alone. | Every `Badge` tone is paired with text; every `Toast` tone carries a distinct icon and a title. |

## Anti-patterns (explicit prohibitions)

- **Raw values in components**: no `#RRGGBB`, `rgb(...)`, or literal `ms`/`s` durations in `src/components/` or `src/routes/`. Use tokens. (`style={{ width }}` on a table `<th>` from a caller-supplied `column.width` is the one allowed exception, and it is a layout width, not a theme value.)
- **Raw values in the token file**: allowed only inside the `:root` blocks of `src/index.css`, and only for the one theme-invariant `--color-ink-on-overlay`.
- **Inline styles for themeable properties**: use classes that reference tokens.
- **Emoji as icons**: never. Lucide SVG only.
- **A second styling system**: Bootstrap is removed. No MUI, Chakra, shadcn/ui, or AntD.
- **`dark:` variant classes**: components never write them. Theming happens through the raw-palette override plus `@theme inline`; a single `prefers-color-scheme` block re-themes everything.
- **Nested cards**: a card inside a card means the inner one is a section, not a card.
- **Color as the only signal**: badges and statuses are paired with text or an icon.
- **Placeholder as label**: forbidden.
- **Unlabeled icon-only control**: caught at render time by `Button`. Do not silence it.
- **Removing the focus ring**: only the `:focus:not(:focus-visible)` reset exists. Never `outline: none` unconditionally, never `focus:outline-none`.
- **`<div onClick>` as a control**: use `<button>`, or `<a>` where the action is navigation. Keyboard support comes free.
- **A dialog without focus management**: never a plain `fixed` panel.
- **Numeric columns that are not right-aligned with tabular figures**: that is a defect, not a preference.
- **Sticky header without a bounded scroll container**: `DataTable` enforces it internally; do not hand-roll a sticky `<thead>`.
- **Translucent decorative surfaces**: glassmorphism is rejected — translucency destroys contrast in dense tables.
- **Decorative gradients, glows, or multi-layer shadow stacks**: elevation is the four steps above, nothing else.
- **Inventing a value a token already covers.** If a needed value has no token, add the token here first.

## Implementation notes

- Tailwind v4, CSS-first: `@import "tailwindcss"`, `:root` raw, `@theme inline` maps to semantic `--color-*`, `@theme` scheme-invariant (type/radius/elevation/motion/z). `@layer base` owns global defaults and reduced-motion.
- Vite plugin: `@tailwindcss/vite` wired in `vite.config.js`. No `postcss.config`, no `tailwind.config.js`.
- Router: `react-router-dom@7`. `/login` full-screen (no shell). Others in `AppLayout`.
- Icons: `lucide-react` (SVG inline). None present in public.
- Language attribute: `html lang="es"`.
- No TypeScript introduced (project remains JSX). Types are expressed in comments where useful.

## Contract enforcement

`DESIGN.md` is the source of truth. If implementing a screen reveals a gap:
1. Correct this document (update the contract).  
2. Update the primitives if necessary.  
3. Never work around the contract by restyling ad-hoc.

Every primitive named above exists in `gestioncomercial-web/src/components/` as of T3: `AppLayout`, `Badge`, `Button`, `Card`, `CheckboxField`, `DataTable`, `Dialog`, `EmptyState`, `PagePlaceholder`, `SelectField`, `Skeleton`, `TextField`, `Toast`, `ToastProvider`, `useToast`. `AppLayout` and `PagePlaceholder` are the two layout primitives; the rest are the component contracts above. Nothing else is exported from that directory, so the two-way documentation requirement holds.

## Verification evidence

### Contrast

Contrast is **measured from the compiled stylesheet, not asserted**. `src/index.css`
uses `@theme inline`, so `text-ink` does not compile to `var(--color-ink)` — it
compiles straight to `var(--gc-r-ink)`. Measuring the `--color-*` names would
therefore measure variables that never reach the browser.

`npm run audit:contrast` builds the app and runs
`gestioncomercial-web/scripts/contrast-audit.mjs` over `dist/assets/*.css`. It
reads each utility rule as emitted, follows it to the raw token it actually
paints with, resolves that token in **both** schemes, and applies the WCAG 2.1
relative-luminance formula. It is committed so the claim is re-runnable rather
than self-reported.

Every foreground/background pair that T4–T6 ship, in both schemes:

| Group | Light | Dark |
| --- | --- | --- |
| Text pairs, min 4.5:1 (1.4.3) | 22 / 22 pass | 22 / 22 pass |
| Non-text pairs, min 3:1 (1.4.11) | 9 / 9 pass | 9 / 9 pass |
| Lowest text pair | `warning-ink` on `warning-subtle` 4.84:1 | `accent-strong` link on `surface` 5.48:1 |
| Lowest non-text pair | chart bar `accent` on `surface` 3.77:1 | `line-control` on `surface` 4.87:1 |

Two groups are reported but **not** counted as failures, and the distinction is
deliberate rather than convenient:

- **Decorative separators** — `line` and `line-strong` measure 1.23:1 / 1.36:1
  (light) and 1.30:1 / 1.82:1 (dark) against their own fill. They are card
  outlines and table rules: they convey nothing the surrounding layout does not
  already convey, so SC 1.4.11 does not apply. Control boundaries
  (`line-control` 4.76:1) and the focus ring (5.01:1) *are* required to hit 3:1,
  and do.
- **Disabled controls** — `disabled-ink` on `disabled-bg` measures 6.92:1 (light)
  and 4.39:1 (dark). SC 1.4.3 explicitly exempts inactive components. The dark
  value is under 4.5:1 and is recorded here rather than hidden, because the day
  someone styles an *enabled* control with that pair it stops being exempt.

An earlier draft of this document asserted ratios for the original token values;
three of them were wrong. `#64748B` as `ink-subtle` measured 4.34:1 on the sunken
fill, `#E6E8EA` as a control border measured 1.48:1 on white, and `#64748B` as
`disabled-ink` measured 4.34:1. All three drove the token changes recorded above.
The numbers in this document are the recomputed ones.

### Build and lint

Both are green; see the task report for the literal output. The build is the proof
that Tailwind is genuinely active: the emitted stylesheet is asserted to contain
the token hex values, so a build that succeeded with Tailwind unconfigured could
not pass that check.

### Data shapes

Fixtures mirror `GestionComercial.Domain/Entidades/*.cs` property for property, in
PascalCase, declared as JSDoc typedefs. That is deliberate and it is a known
divergence from the wire: ASP.NET Core's *default* JSON naming policy is camelCase,
so the API swap will need either a naming policy of "none" on the server or a
casing adapter inside `src/data/products.js`. Keeping that decision in the data
module is what makes it a single-file change.

---

## SEO — System contract (frontend-seo skill reference)

Source: `frontend-seo` skill (`skillsdirectory.com/skills/sickn33-frontend-seo-agentic-awesome-skills`). Applied to Vite/React frontend with Spanish UI copy and token-based design.

### One constants module

`src/services/seo/constants.js` defines site identity: site name (`GestionComercial`), base URL (derived from `VITE_PUBLIC_URL` or `window.location.origin`), default description, default OG image (`public/og-default.jpg`), Spanish language tag (`lang="es"`), and the brand color (`#047857`) for OG accent.

Every route derives absolute canonical URLs from this single base; no string concatenation in components.

### Per-route metadata (derived, never copy-pasted)

Each route (`/login`, `/dashboard`, `/productos`) exports a `routeMeta()` function that returns:

- `title` (≤ 60 chars, includes site name for non-home routes)
- `description` (≤ 160 chars)
- `canonical`
- `og:title`, `og:description`, `og:image` (route-specific screenshot if available)
- `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`
- `jsonLd` (typed JSON-LD derived from page content; used for `Dashboard` KPI summary and `Productos` table structure)

Components consume `routeMeta()` through a single `useRouteMeta()` hook; no `<meta>` tags are written by hand in JSX.

### Sitemap and robots

`public/sitemap.xml` and `public/robots.txt` are generated at build time from the route manifest (`src/routes/routes.js`), not maintained by hand. Both reference the same canonical URLs as `constants.js`. `robots.txt` allows indexing of `/`, `/dashboard`, `/productos`; disallows `/login` (no search value) and any future admin routes.

### Language and accessibility signals

`<html lang="es">` is set globally in `src/index.html` and verified by build audit. Every image served through the `img` component carries `alt`; the `Dashboard` chart has an accessible table fallback (`aria-describedby` linking to the data table); and the `Productos` dense table includes `scope="col"` on headers per the design contract in `DESIGN.md`.

### Integration with design tokens

SEO meta does not introduce new colors or fonts. The OG image (`public/og-default.jpg`) uses the `accent-strong` (`#047857`) fill, `surface` (`#FFFFFF`) background, and `ink` (`#0F172A`) text — exactly the token names in `DESIGN.md`. The sitemap generator and robots rules are framework-agnostic: they read the Vite route manifest, not the component tree, so they survive the API swap (single-file change in the data module) unchanged.

### Verification

`npm run build` asserts that `public/sitemap.xml` exists and that `src/services/seo/constants.js` exports a valid base URL string. `npm run lint` reports if any component writes raw `<meta>` tags (prohibited). The `AGENTS.md` (project agents) names `frontend-design-system.md` as the design contract source; any deviation from token rules must be corrected in both files (document + code) before the T8 responsive verification can be considered complete.
