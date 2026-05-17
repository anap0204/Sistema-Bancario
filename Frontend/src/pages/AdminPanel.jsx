import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import '../styles/styles.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/admin/usuarios`, {
          headers: getAuthHeaders(),
        })
        const clientes = (data.usuarios || [])
          .filter((u) => u.rol === 'cliente')
          .map((u) => ({
            id: u.id,
            nombre: u.nombreCompleto,
            correo: u.email,
            bloqueada: u.cuentaBloqueada,
          }))
        setUsers(clientes)
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login', { replace: true })
        } else {
          setError('No se pudo cargar la lista de usuarios.')
        }
      }
    }

    fetchUsuarios()
  }, [navigate])

  const handleUnlock = async (id) => {
    try {
      await axios.patch(
        `${API_URL}/api/admin/usuario/${id}/bloqueo`,
        { bloqueado: false },
        { headers: getAuthHeaders() }
      )
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id
            ? { ...user, bloqueada: false }
            : user
        )
      )
    } catch (error) {
      console.error('Error desbloqueando usuario', error)
    }
  }

  return (
    <>
      <Navbar />

      <main className="admin-container">
        <div className="admin-card">
          <h2 className="brand">Panel de Administración</h2>
          <p className="subtitle">
            Gestión de cuentas de usuario
          </p>
          {error && (
            <p style={{ color: '#c0392b', marginBottom: '12px' }}>{error}</p>
          )}
          <table className="users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={
                    user.bloqueada
                      ? 'blocked-row'
                      : 'active-row'
                  }
                >
                  <td>{user.nombre}</td>
                  <td>{user.correo}</td>

                  <td>
                    <span
                      className={
                        user.bloqueada
                          ? 'status blocked'
                          : 'status active'
                      }
                    >
                      {user.bloqueada
                        ? 'Bloqueada'
                        : 'Activa'}
                    </span>
                  </td>

                  <td>
                    {user.bloqueada ? (
                      <button
                        className="button unlock-btn"
                        onClick={() =>
                          handleUnlock(user.id)
                        }
                      >
                        Desbloquear
                      </button>
                    ) : (
                      <span className="no-action">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}