import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const formatMoney = (value) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value)

const formatDate = (fecha) =>
  new Date(fecha).toLocaleDateString('es-MX')

export default function Dashboard() {
  const [cargando, setCargando] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [saldoData, setSaldoData] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [paginaActual, setPaginaActual] = useState(1)
  const FILAS_POR_PAGINA = 5

  useEffect(() => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    Promise.all([
      fetch(`${API_URL}/api/cuenta/saldo`, { headers }),
      fetch(`${API_URL}/api/cuenta/historial`, { headers })
    ])
      .then(async ([resSaldo, resHistorial]) => {
        if (!resSaldo.ok) throw new Error('Error al obtener saldo')
        if (!resHistorial.ok) throw new Error('Error al obtener historial')
        const [dataSaldo, dataHistorial] = await Promise.all([
          resSaldo.json(),
          resHistorial.json()
        ])
        setSaldoData(dataSaldo)
        setMovimientos(dataHistorial)
        setPaginaActual(1)
      })
      .catch(() => setErrorMsg('No se pudieron cargar los datos. Intenta de nuevo.'))
      .finally(() => setCargando(false))
  }, [])

  const transferenciasRealizadas = movimientos.filter(m => m.tipo === 'envío').length
  const depositosRecibidos       = movimientos.filter(m => m.tipo === 'depósito').length
  const totalIngresado = movimientos
    .filter(m => m.tipo === 'depósito')
    .reduce((acc, m) => acc + parseFloat(m.monto), 0)
  const totalEgresado = movimientos
    .filter(m => m.tipo === 'envío')
    .reduce((acc, m) => acc + parseFloat(m.monto), 0)

  const indiceInicio       = (paginaActual - 1) * FILAS_POR_PAGINA
  const movimientosPagina  = movimientos.slice(indiceInicio, indiceInicio + FILAS_POR_PAGINA)
  const totalPaginas       = Math.ceil(movimientos.length / FILAS_POR_PAGINA)

  if (cargando) {
    return (
      <>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '80px', fontFamily: 'system-ui, sans-serif', color: '#182649' }}>
          Cargando...
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main style={{ padding: '32px', fontFamily: 'system-ui, sans-serif', color: '#182649', maxWidth: '1200px', margin: '0 auto' }}>
        {errorMsg && (
          <p style={{ color: '#C0392B', marginBottom: '16px' }}>{errorMsg}</p>
        )}

        <h2 style={{ margin: '0 0 4px', fontSize: '1.6rem' }}>
          Hola, {saldoData?.nombreCompleto || localStorage.getItem('userName')}!
        </h2>
        <p style={{ margin: '0 0 24px', color: '#555' }}>
          Saldo disponible:{' '}
          <strong style={{ color: '#182649' }}>
            {saldoData ? formatMoney(parseFloat(saldoData.saldo)) : '—'}
          </strong>
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Transferencias',   value: transferenciasRealizadas, isMoney: false },
            { label: 'Depósitos a cuenta', value: depositosRecibidos,     isMoney: false },
            { label: 'Total ingresado',  value: totalIngresado,           isMoney: true  },
            { label: 'Total egresado',   value: totalEgresado,            isMoney: true  },
          ].map(({ label, value, isMoney }) => (
            <div key={label} style={cardStyle}>
              <span style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '8px', display: 'block' }}>
                {label}
              </span>
              <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#182649' }}>
                {isMoney ? formatMoney(value) : value}
              </span>
            </div>
          ))}
        </div>

        <h3 style={{ margin: '0', fontSize: '1.1rem', fontWeight: 600 }}>Actividad reciente</h3>
        <div style={tablaWrapperStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#182649' }}>
                {['Folio', 'Fecha', 'Tipo', 'Otro actor', 'Monto', 'Concepto'].map(col => (
                  <th key={col} style={thStyle}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {movimientosPagina.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: '32px' }}>
                    No tienes movimientos registrados aún
                  </td>
                </tr>
              ) : (
                movimientosPagina.map((m, i) => {
                  const isLast = i === movimientosPagina.length - 1
                  const td = { ...tdStyle, borderBottom: isLast ? 'none' : '1px solid #F0F0F0' }
                  return (
                    <tr
                      key={m.id}
                      style={{ background: '#FFF' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F8F9FB')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#FFF')}
                    >
                      <td style={td}>{String(m.id || '').slice(0, 8)}</td>
                      <td style={td}>{formatDate(m.fecha)}</td>
                      <td style={td}>
                        {m.tipo === 'envío'
                          ? <span style={badgeEnvio}>Transferencia</span>
                          : <span style={badgeDeposito}>Depósito</span>
                        }
                      </td>
                      <td style={td}>{m.otroActor}</td>
                      <td style={td}>{formatMoney(parseFloat(m.monto))}</td>
                      <td style={td}>{m.concepto}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {totalPaginas > 1 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px', padding: '10px 16px' }}>
              <button
                onClick={() => setPaginaActual(p => p - 1)}
                disabled={paginaActual === 1}
                style={{
                  background: 'none', border: 'none',
                  cursor: paginaActual === 1 ? 'default' : 'pointer',
                  color: paginaActual === 1 ? '#CCC' : '#182649',
                  fontSize: '0.85rem', fontWeight: 600, padding: '2px 6px'
                }}
              >←</button>

              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => setPaginaActual(num)}
                  style={{
                    width: '24px', height: '24px', borderRadius: '4px',
                    border: 'none', cursor: 'pointer', fontSize: '0.78rem',
                    background: num === paginaActual ? '#182649' : 'transparent',
                    color: num === paginaActual ? '#FFF' : '#182649',
                    fontWeight: num === paginaActual ? 700 : 400
                  }}
                >{num}</button>
              ))}

              <button
                onClick={() => setPaginaActual(p => p + 1)}
                disabled={paginaActual === totalPaginas}
                style={{
                  background: 'none', border: 'none',
                  cursor: paginaActual === totalPaginas ? 'default' : 'pointer',
                  color: paginaActual === totalPaginas ? '#CCC' : '#182649',
                  fontSize: '0.85rem', fontWeight: 600, padding: '2px 6px'
                }}
              >→</button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

const cardStyle = {
  borderRadius: '16px',
  background: '#FFF',
  boxShadow: '0 4px 15.3px 0 rgba(0, 0, 0, 0.31)',
  padding: '24px 32px',
  minWidth: '180px',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
}

const tablaWrapperStyle = {
  borderRadius: '16px',
  background: '#FFF',
  boxShadow: '0 4px 15.3px 0 rgba(0, 0, 0, 0.31)',
  overflow: 'hidden',
  marginTop: '16px',
}

const thStyle = {
  color: '#FFFFFF',
  padding: '12px 20px',
  textAlign: 'left',
  fontWeight: 600,
}

const tdStyle = {
  padding: '14px 20px',
  color: '#333',
}

const badgeEnvio = {
  background: '#FFE5E5',
  color: '#C0392B',
  borderRadius: '8px',
  padding: '3px 12px',
  fontWeight: 600,
  fontSize: '0.85rem',
}

const badgeDeposito = {
  background: '#E5F4E5',
  color: '#27AE60',
  borderRadius: '8px',
  padding: '3px 12px',
  fontWeight: 600,
  fontSize: '0.85rem',
}
