/**
 * AppLayout -- authenticated shell: fixed sidebar + sticky header + routed outlet.
 *
 * Contract: DESIGN.md > Layout.
 *
 * `/login` renders outside this shell (see `App.jsx`); a signed-out user has no
 * navigation to offer. Below `lg` the sidebar becomes an overlay drawer so the
 * 375px viewport never gets a squeezed column of icons.
 */
import { LayoutDashboard, LogOut, Menu, Package, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import logoG2 from '../assets/LogoG2_definitivo.png'
import Button from './Button.jsx'

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/productos', label: 'Productos', icon: Package },
]

function NavItems({ onNavigate }) {
  return (
    <nav aria-label="Navegación principal" className="flex flex-col gap-1 p-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'flex min-h-11 items-center gap-3 rounded-md px-3 text-label',
              'transition-colors duration-[var(--gc-duration-fast)]',
              isActive
                ? 'bg-accent-strong text-ink-inverse'
                : 'text-ink-muted hover:bg-surface-hover hover:text-ink',
            ].join(' ')
          }
        >
          {({ isActive }) => (
            <>
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span>{label}</span>
              {isActive && <span className="sr-only">(página actual)</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

function Sidebar({ onNavigate, onSignOut }) {
  return (
    <div className="flex h-full flex-col border-r border-line bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-line px-4">
        <img
          src={logoG2}
          alt="Logo de Gestión Comercial"
          className="h-7 w-auto"
          loading="eager"
          decoding="async"
        />
        <span className="truncate text-label font-semibold text-ink">
          Gestión Comercial
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <NavItems onNavigate={onNavigate} />
      </div>

      <div className="border-t border-line p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onSignOut}
        >
          <LogOut aria-hidden="true" className="size-4 shrink-0" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}

export function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const toggleRef = useRef(null)

  // Escape closes the drawer and hands focus back to the trigger that opened it.
  // Route changes close it too, via the `onNavigate` handler on every NavLink.
  useEffect(() => {
    if (!drawerOpen) return

    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      setDrawerOpen(false)
      toggleRef.current?.focus()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [drawerOpen])

  // Sign-out routing is a later task: there is no auth backend yet. Kept as an
  // explicit no-op so the affordance is never a dead-looking control.
  const handleSignOut = () => {}

  return (
    <div className="min-h-dvh bg-canvas">
      {/* Persistent navigation, 1024px and up. */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 lg:block">
        <Sidebar onSignOut={handleSignOut} />
      </aside>

      {/* Overlay navigation below 1024px. */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[var(--gc-z-dialog)] lg:hidden">
          <div
            aria-hidden="true"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-overlay"
          />
          <div className="absolute inset-y-0 left-0 w-64 max-w-[85vw] shadow-lg">
            <Sidebar onNavigate={() => setDrawerOpen(false)} onSignOut={handleSignOut} />
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label="Cerrar navegación"
              onClick={() => {
                setDrawerOpen(false)
                toggleRef.current?.focus()
              }}
              className="absolute top-3 -right-11 text-ink-on-overlay"
            >
              <X aria-hidden="true" className="size-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-[var(--gc-z-header)] flex h-14 items-center gap-3 border-b border-line bg-surface px-4">
          <Button
            ref={toggleRef}
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="Abrir navegación"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden"
          >
            <Menu aria-hidden="true" className="size-5" />
          </Button>

          <img
            src={logoG2}
            alt="Logo Gestión Comercial 2"
            className="h-6 w-auto lg:hidden"
            loading="eager"
            decoding="async"
          />
          <span className="text-label text-ink-muted lg:hidden">
            Gestión Comercial
          </span>
        </header>

        <main id="contenido-principal" className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
