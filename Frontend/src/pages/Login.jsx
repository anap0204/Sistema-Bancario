import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      localStorage.setItem('token', data.token)
      localStorage.setItem('userName', data.user.nombreCompleto)
      localStorage.setItem('userRol', data.user.rol)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError('Cuenta bloqueada. Contacta al administrador.')
      } else {
        setError('Correo o contraseña incorrectos')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.brand}>Banco UP</h1>
        <p style={styles.subtitle}>Sistema de Transferencias</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={styles.input}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={styles.input}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f2f5',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 15.3px 0 rgba(0, 0, 0, 0.31)',
    padding: '36px 32px',
    width: '100%',
    maxWidth: '360px',
  },
  brand: {
    color: '#182649',
    fontSize: '1.6rem',
    fontWeight: '700',
    textAlign: 'center',
    margin: '0 0 4px 0',
  },
  subtitle: {
    color: '#182649',
    fontSize: '0.9rem',
    textAlign: 'center',
    margin: '0 0 32px 0',
    opacity: 0.7,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: '#182649',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #cdd3e0',
    fontSize: '0.95rem',
    outline: 'none',
    color: '#182649',
  },
  error: {
    color: '#c0392b',
    fontSize: '0.875rem',
    textAlign: 'center',
    margin: '0',
  },
  button: {
    backgroundColor: '#182649',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '4px',
  },
}
