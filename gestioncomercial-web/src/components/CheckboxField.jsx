/**
 * CheckboxField -- boolean field with a visible label.
 *
 * Contract: DESIGN.md > Components > CheckboxField.
 * The whole row is the hit target, which gets the control comfortably past the
 * 44px minimum without inflating the visual box. The native input is kept
 * visually present (not `opacity-0`) so it keeps its focus ring and platform
 * rendering; it is only repositioned behind a custom-drawn box.
 */
import { Check } from 'lucide-react'
import { useId } from 'react'

export function CheckboxField({
  label,
  checked,
  onChange,
  hint,
  error,
  disabled = false,
  className = '',
  id: idProp,
  ...rest
}) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ')

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className={[
          'flex min-h-11 cursor-pointer items-center gap-3 rounded-md py-1',
          'transition-colors duration-[var(--gc-duration-fast)]',
          disabled ? 'cursor-not-allowed' : 'hover:bg-surface-hover',
        ].join(' ')}
      >
        <span className="relative flex size-5 shrink-0 items-center justify-center">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy || undefined}
            className="peer absolute inset-0 size-full cursor-inherit appearance-none rounded-sm border border-line-control bg-surface shadow-xs checked:border-accent-strong checked:bg-accent-strong disabled:cursor-not-allowed disabled:border-disabled-line disabled:bg-disabled-bg aria-[invalid=true]:border-danger"
            {...rest}
          />
          <Check
            aria-hidden="true"
            className="pointer-events-none relative size-3.5 text-ink-inverse opacity-0 peer-checked:opacity-100 peer-disabled:opacity-0"
            strokeWidth={3}
          />
        </span>

        <span className="text-body text-ink">{label}</span>
      </label>

      {(hint || error) && (
        <p
          id={error ? errorId : hintId}
          className={`pl-14 text-caption ${error ? 'text-danger-ink' : 'text-ink-subtle'}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}

export default CheckboxField
