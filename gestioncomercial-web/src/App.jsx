/**
 * Route table.
 *
 * Two shells, deliberately:
 *  - `/login` renders bare and full-screen: a signed-out user has no navigation
 *    to offer, and a sidebar around a login form is noise.
 *  - everything else renders inside `AppLayout`.
 */
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout.jsx'
import EmptyState from './components/EmptyState.jsx'
import { Dashboard, Login, Productos } from './routes/index.jsx'

function NotFound() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <EmptyState
        title="Página no encontrada"
        description="La dirección que abriste no corresponde a ninguna sección del sistema."
      />
    </div>
  )
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
