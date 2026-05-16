import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import '../styles/styles.css'

export default function AdminPanel() {
  const [users, setUsers] = useState([])

  // borrar cuando conectemos endpoint
  useEffect(() => {
    const mockUsers = [
      {
        id: 1,
        nombre: 'Juan Pérez',
        correo: 'juan@bancoup.com',
        bloqueada: false,
      },
      {
        id: 2,
        nombre: 'María López',
        correo: 'maria@bancoup.com',
        bloqueada: true,
      },
      {
        id: 3,
        nombre: 'Carlos Ramírez',
        correo: 'carlos@bancoup.com',
        bloqueada: false,
      },
    ]

    setUsers(mockUsers)
  }, [])

  const handleUnlock = async (id) => {
    try {
      // Aquí t poner:
      // await axios.put(`${API_URL}/admin/unlock/${id}`) para api y asiiiiiiii

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