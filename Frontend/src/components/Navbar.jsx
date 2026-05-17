import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { UserCircle2, LogOut } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
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

  const linkStyle = (path) =>
    location.pathname === path
      ? { ...styles.link, ...styles.linkActive }
      : styles.link

  return (
    <nav style={styles.nav}>
      <div style={styles.leftSection}>
        <span style={styles.brand}>Banco UP</span>

        <div style={styles.links}>
          {userRol === 'cliente' && (
            <>
              <Link to="/dashboard" style={linkStyle('/dashboard')}>Inicio</Link>
              <Link to="/transfer" style={linkStyle('/transfer')}>Transferir</Link>
            </>
          )}
          {userRol === 'admin' && (
            <Link to="/admin" style={linkStyle('/admin')}>Panel Admin</Link>
          )}
        </div>
      </div>

      <div style={styles.rightSection}>
        <div style={styles.userSection}>
          <UserCircle2 size={28} strokeWidth={1.6} color="rgba(255,255,255,0.9)" />
          <span style={styles.userName}>{userName}</span>
        </div>

        <button
          onClick={handleLogout}
          style={styles.logoutBtn}
          title="Cerrar sesión"
        >
          <LogOut size={20} strokeWidth={2} />
        </button>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    backgroundColor: '#182649',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: '60px',
    fontFamily: 'system-ui, sans-serif',
    boxShadow: '0 6px 28px 0 rgba(0, 0, 0, 0.5)',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '0',
  },
  brand: {
    fontWeight: '700',
    fontSize: '1.2rem',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    paddingRight: '28px',
  },
  links: {
    display: 'flex',
    alignItems: 'stretch',
  },
  link: {
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    padding: '0 18px',
    borderBottom: '3px solid transparent',
    boxSizing: 'border-box',
    transition: 'color 0.15s',
  },
  linkActive: {
    color: '#ffffff',
    borderBottomColor: '#ffffff',
    backgroundColor: 'rgba(5, 15, 55, 0.35)',
    textShadow: '0 1px 12px rgba(10, 30, 120, 0.9)',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'stretch',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 18px',
    borderRight: '1px solid rgba(255,255,255,0.15)',
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.75)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 16px',
    cursor: 'pointer',
  },
}
