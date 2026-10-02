/**
 * TextField -- single-line text entry with a visible label.
 *
 * Contract: DESIGN.md > Components > TextField.
 * The label is always rendered: a placeholder is not a label. Error and hint are
 * wired through `aria-describedby` and announced with the field, never only
 * coloured.
 */
import { useId } from 'react'

const CONTROL_BASE =
  'w-full rounded-md border bg-surface text-ink shadow-xs ' +
  'placeholder:text-ink-subtle ' +
  'transition-colors duration-[var(--gc-duration-fast)] ease-[var(--gc-ease-ui)] ' +
  'disabled:cursor-not-allowed disabled:border-disabled-line ' +
  'disabled:bg-disabled-bg disabled:text-disabled-ink disabled:shadow-none'

const CONTROL_STATE =
  'border-line-control hover:border-line-control-hover ' +
  'aria-[invalid=true]:border-danger aria-[invalid=true]:hover:border-danger'

export function TextField({
  label,
  value,
  onChange,
  onBlur,
  type = 'text',
  hint,
  error,
  disabled = false,
  required = false,
  readOnly = false,
  mono = false,
  placeholder,
  autoComplete,
  className = '',
  id: idProp,
  // React 19 passes `ref` as an ordinary prop to function components; taking it
  // explicitly (as `Button` does) is what lets a screen move focus to the first
  // field that failed validation.
  ref,
  ...rest
}) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ')

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-label text-ink-muted">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        ref={ref}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className={[
          CONTROL_BASE,
          CONTROL_STATE,
          'h-10 px-3 text-body',
          mono && 'font-mono text-mono tracking-tight',
        ].join(' ')}
        {...rest}
      />

      {hint && !error && (
        <p id={hintId} className="text-caption text-ink-subtle">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-caption text-danger-ink">
          {error}
        </p>
      )}
    </div>
  )
}

export default TextField
