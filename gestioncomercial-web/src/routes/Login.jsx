/**
 * Login -- T4.
 *
 * Full-screen by design: a signed-out user has no navigation, so this route
 * renders outside `AppLayout` (see `App.jsx`). Composition only -- the frame is
 * `Card`, the fields are `TextField`/`CheckboxField`, the action is `Button`.
 * Nothing here re-styles a primitive.
 *
 * Validation model, in the order a user actually experiences it:
 *
 *  1. Submit with an invalid field -> nothing is sent. Every error appears BOTH
 *     under its field (through `TextField`'s `error`, which wires `aria-invalid`
 *     and `aria-describedby`) AND as an entry in the summary above.
 *  2. Focus moves to the first field that failed, in tab order, so the keyboard
 *     user lands on the thing they have to fix first.
 *  3. The summary is a focusable region whose entries link to the field they
 *     describe, so a pointer user can jump straight from the list to the field.
 *  4. An authentication failure is NOT a field error. The fields were filled in
 *     correctly; the credential was rejected. It is announced in a polite live
 *     region and invalidates nothing, because forcing the user to re-read a list
 *     of complaints about fields they filled in fine is a bug, not rigor.
 */
import { AlertCircle, Info, LockKeyhole } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoG2 from '../assets/LogoG2_definitivo.png'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import CheckboxField from '../components/CheckboxField.jsx'
import TextField from '../components/TextField.jsx'
import { CREDENCIALES_DEMO, signIn } from '../data/auth.js'

/** Copy in Spanish. The entity messages in `Producto.cs` set the precedent. */
const ERRORES = {
  emailVacio: 'Ingresá tu usuario o correo electrónico.',
  emailInvalido: 'El correo electrónico no tiene un formato válido.',
  passwordVacia: 'Ingresá tu contraseña.',
  passwordCorta: 'La contraseña debe tener al menos 8 caracteres.',
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * @param {{ email: string, password: string }} values
 * @returns {Record<'email' | 'password', string>} only the fields that failed
 */
function validar({ email, password }) {
  const errores = {}

  if (!email.trim()) {
    errores.email = ERRORES.emailVacio
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errores.email = ERRORES.emailInvalido
  }

  if (!password) {
    errores.password = ERRORES.passwordVacia
  } else if (password.length < 8) {
    errores.password = ERRORES.passwordCorta
  }

  return errores
}

export function Login() {
  const navegar = useNavigate()
  const uid = useId()

  const emailId = `${uid}-email`
  const passwordId = `${uid}-password`
  const recordarId = `${uid}-recordar`
  const resumenId = `${uid}-resumen`
  const resumenTituloId = `${uid}-resumen-titulo`

  const emailRef = useRef(null)
  const passwordRef = useRef(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [recordar, setRecordar] = useState(false)
  const [errores, setErrores] = useState({})
  const [authError, setAuthError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Rendered in tab order so the summary lists them the same way the form does.
  const entradas = [
    errores.email && { campo: 'email', mensaje: errores.email },
    errores.password && { campo: 'password', mensaje: errores.password },
  ].filter(Boolean)

  const irA = (campo) => (campo === 'email' ? emailRef : passwordRef).current?.focus()

  async function onSubmit(event) {
    event.preventDefault()

    const encontrados = validar({ email, password })
    setErrores(encontrados)

    if (encontrados.email || encontrados.password) {
      irA(encontrados.email ? 'email' : 'password')
      return
    }

    setEnviando(true)
    setAuthError('')

    try {
      await signIn({ email, password })
      navegar('/dashboard', { replace: true })
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    // `my-auto` on the child, not `justify-center` on the parent: when the form
    // is taller than a 375x667 viewport, auto margins keep the top of the card
    // reachable instead of pushing it off-screen where it cannot be scrolled to.
    <div className="flex min-h-dvh flex-col bg-canvas p-4 sm:p-6 relative overflow-hidden">
      {/* Fondo visual: logo G2 con opacidad baja + gradiente oscuro --> legible --> */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[-1] bg-cover bg-center opacity-[0.06] blur-[2px]"
        style={{ backgroundImage: 'url("/LogoG2_definitivo.png")' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[-1] bg-gradient-to-b from-canvas/90 via-canvas/60 to-canvas"
      />
      <div className="my-auto mx-auto w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <img
            src={logoG2}
            alt="Logo de Gestión Comercial"
            className="h-10 w-auto"
            loading="eager"
            decoding="async"
          />
          <h1 className="text-title text-ink">Gestión Comercial</h1>
          <p className="text-body text-ink-muted">
            Ingresá con tu usuario para acceder al sistema.
          </p>
        </div>

        <Card>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            {/*
              Error summary. `role="group"` rather than `role="alert"`: every
              message is already announced through its own field via
              `aria-describedby`, and an alert here would read all of them twice.
            */}
            <div
              id={resumenId}
              tabIndex={-1}
              role="group"
              aria-labelledby={resumenTituloId}
              className={[
                'rounded-md border border-danger bg-danger-subtle p-3',
                entradas.length === 0 && 'hidden',
              ].join(' ')}
            >
              <p
                id={resumenTituloId}
                className="flex items-center gap-2 text-label text-danger-ink"
              >
                <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
                {entradas.length === 1
                  ? 'Hay 1 error para corregir'
                  : `Hay ${entradas.length} errores para corregir`}
              </p>

              <ul className="mt-1.5 ml-6 list-disc space-y-1">
                {entradas.map(({ campo, mensaje }) => (
                  <li key={campo}>
                    <a
                      href={`#${campo === 'email' ? emailId : passwordId}`}
                      onClick={(event) => {
                        event.preventDefault()
                        irA(campo)
                      }}
                      className="text-caption text-danger-ink underline underline-offset-2 hover:underline"
                    >
                      {mensaje}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <TextField
              id={emailId}
              ref={emailRef}
              label="Usuario o correo electrónico"
              type="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={errores.email}
              required
              autoComplete="username"
              disabled={enviando}
              placeholder="nombre@empresa.com.ar"
            />

            <TextField
              id={passwordId}
              ref={passwordRef}
              label="Contraseña"
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={errores.password}
              required
              autoComplete="current-password"
              disabled={enviando}
            />

            <CheckboxField
              id={recordarId}
              name="recordar"
              label="Recordar mi sesión en este equipo"
              checked={recordar}
              onChange={(event) => setRecordar(event.target.checked)}
              disabled={enviando}
            />

            {/*
              Authentication failure. The region is always in the DOM and always
              carries the live-region role; only its content changes. Hiding the
              element and re-showing it makes the announcement depend on the
              screen reader re-attaching the region, which is not reliable.

              Polite, not assertive: the user pressed the button and is already
              waiting, so interrupting whatever they may be reading is not
              warranted.
            */}
            <p
              role="status"
              aria-live="polite"
              className={[
                'flex items-start gap-2 rounded-md text-caption',
                authError
                  ? 'border border-danger bg-danger-subtle p-3 text-danger-ink'
                  : '',
              ].join(' ')}
            >
              {authError && (
                <>
                  <AlertCircle aria-hidden="true" className="mt-px size-4 shrink-0" />
                  {authError}
                </>
              )}
            </p>

            <Button type="submit" size="lg" loading={enviando} className="w-full">
              <LockKeyhole aria-hidden="true" className="size-4 shrink-0" />
              {enviando ? 'Verificando…' : 'Ingresar'}
            </Button>
          </form>
        </Card>

        {/*
          Demo credentials. The backend is a mock with no identity provider
          behind it; without this note the success path is unreachable and the
          screen can only ever be reviewed in its failure state.
        */}
        <p className="mt-4 flex items-start gap-2 rounded-md border border-line bg-surface p-3 text-caption text-ink-muted">
          <Info aria-hidden="true" className="mt-px size-4 shrink-0 text-info-ink" />
          <span>
            Entorno de demostración. Usuario{' '}
            <code className="font-mono text-mono-sm text-ink">
              {CREDENCIALES_DEMO.email}
            </code>{' '}
            y contraseña{' '}
            <code className="font-mono text-mono-sm text-ink">
              {CREDENCIALES_DEMO.password}
            </code>
            .
          </span>
        </p>
      </div>
    </div>
  )
}

export default Login