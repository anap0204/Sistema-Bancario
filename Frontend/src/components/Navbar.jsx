import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Navbar() {
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || ''
  const userRol = localStorage.getItem('userRol') || ''

  const handleLogout = async () => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch {
      // Proceed with local logout even if request fails
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      localStorage.removeItem('userRol')
      navigate('/login', { replace: true })
    }
  }

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>Banco UP</span>
      <div style={styles.links}>
        {userRol === 'cliente' && (
          <>
            <Link to="/dashboard" style={styles.link}>Inicio</Link>
            <Link to="/transfer" style={styles.link}>Transferir</Link>
          </>
        )}
        {userRol === 'admin' && (
          <Link to="/admin" style={styles.link}>Panel Admin</Link>
        )}
      </div>
      <div style={styles.right}>
        <span style={styles.userName}>{userName}</span>
        <button onClick={handleLogout} style={styles.button}>Cerrar sesión</button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: '#182649',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '60px',
    fontFamily: 'system-ui, sans-serif',
  },
  brand: {
    fontWeight: '700',
    fontSize: '1.2rem',
  },
  links: {
    display: 'flex',
    gap: '24px',
  },
  link: {
    color: 'rgba(255,255,255,0.85)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'color 0.15s',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userName: {
    fontSize: '0.9rem',
    opacity: 0.9,
  },
  button: {
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.5)',
    borderRadius: '6px',
    padding: '6px 14px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  },
}
