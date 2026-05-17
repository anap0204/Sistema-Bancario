import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transfer from './pages/Transfer'
import AdminPanel from './pages/AdminPanel'

function getAuth() {
  const token = localStorage.getItem('token')
  const rol = localStorage.getItem('userRol')
  return { token, rol }
}

function PrivateRoute({ children }) {
  const { token, rol } = getAuth()
  return token ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { token, rol } = getAuth()
  if (!token) return children
  return rol === 'admin'
    ? <Navigate to="/admin" replace />
    : <Navigate to="/dashboard" replace />
}

function AdminRoute({ children }) {
  const { token, rol } = getAuth()
  if (!token) return <Navigate to="/login" replace />
  if (rol !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function ClientRoute({ children }) {
  const { token, rol } = getAuth()
  if (!token) return <Navigate to="/login" replace />
  if (rol === 'admin') return <Navigate to="/admin" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
 
        <Route path="/dashboard" element={<ClientRoute><Dashboard /></ClientRoute>} />
        <Route path="/transfer" element={<ClientRoute><Transfer /></ClientRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
 
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
