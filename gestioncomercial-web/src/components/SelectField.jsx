/**
 * SelectField -- native select with a visible label.
 *
 * Contract: DESIGN.md > Components > SelectField.
 * Native element on purpose: it gets platform keyboard behaviour, the mobile
 * wheel picker, and correct screen-reader semantics for free. A custom listbox
 * would have to re-implement all three.
 */
import { ChevronDown } from 'lucide-react'
import { useId } from 'react'

const CONTROL_BASE =
  'w-full appearance-none rounded-md border bg-surface text-ink shadow-xs ' +
  'transition-colors duration-[var(--gc-duration-fast)] ease-[var(--gc-ease-ui)] ' +
  'disabled:cursor-not-allowed disabled:border-disabled-line ' +
  'disabled:bg-disabled-bg disabled:text-disabled-ink disabled:shadow-none'

const CONTROL_STATE =
  'border-line-control hover:border-line-control-hover ' +
  'aria-[invalid=true]:border-danger aria-[invalid=true]:hover:border-danger'

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  hint,
  error,
  disabled = false,
  required = false,
  className = '',
  id: idProp,
  // React 19 passes `ref` as an ordinary prop to function components. Mirrors
  // `TextField` and `Button`: a screen owns focus movement, not the primitive.
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

      <div className="relative">
        <select
          id={id}
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={[CONTROL_BASE, CONTROL_STATE, 'h-10 py-0 pl-3 pr-9 text-body'].join(
            ' ',
          )}
          {...rest}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-subtle"
        />
      </div>

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

export default SelectField
