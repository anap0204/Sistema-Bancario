import { useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Modal from '../components/Modal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Transfer() {
  const [monto, setMonto] = useState('')
  const [cuentaDestino, setCuentaDestino] = useState('')
  const [concepto, setConcepto] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [modal, setModal] = useState(null)

  const validate = () => {
    const newErrors = {}
    const montoNum = parseFloat(monto)
    if (!monto || isNaN(montoNum) || montoNum < 0.01) {
      newErrors.monto = 'Ingresa un monto válido (mínimo $0.01)'
    }
    if (!/^\d{16}$/.test(cuentaDestino)) {
      newErrors.cuentaDestino = 'La cuenta destino debe tener exactamente 16 dígitos'
    }
    if (!concepto.trim()) {
      newErrors.concepto = 'El concepto es requerido'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.post(
        `${API_URL}/api/transferencias`,
        { monto: parseFloat(monto), cuentaDestino, concepto: concepto.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setModal({
        type: 'success',
        importe: data.transferencia.Importe,
        cuentaReceptora: data.transferencia.CuentaReceptora,
      })
    } catch (err) {
      const mensaje =
        err.response?.data?.message ||
        'Ocurrió un error al procesar la transferencia. Intenta de nuevo.'
      setModal({ type: 'error', message: mensaje })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setModal(null)
    setMonto('')
    setCuentaDestino('')
    setConcepto('')
  }

  const handleCuentaDestinoChange = (e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (val.length <= 16) setCuentaDestino(val)
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h1 style={styles.heading}>Nueva transferencia</h1>
            <p style={styles.subheading}>Ingresa los datos de la cuenta destino y el monto a enviar</p>
          </div>

          <div style={styles.divider} />

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="monto">Monto</label>
              <input
                id="monto"
                type="number"
                step="0.01"
                min="0.01"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                disabled={loading}
                style={{ ...styles.input, ...(errors.monto ? styles.inputError : {}) }}
                placeholder="0.00"
              />
              {errors.monto && <span style={styles.fieldError}>{errors.monto}</span>}
            </div>

            <div style={styles.field}>
              <label style={styles.label} htmlFor="cuentaDestino">Número de cuenta destino</label>
              <input
                id="cuentaDestino"
                type="text"
                value={cuentaDestino}
                onChange={handleCuentaDestinoChange}
                maxLength={16}
                disabled={loading}
                style={{ ...styles.input, ...(errors.cuentaDestino ? styles.inputError : {}) }}
                placeholder="1234567890123456"
              />
              {errors.cuentaDestino && <span style={styles.fieldError}>{errors.cuentaDestino}</span>}
            </div>

            <div style={styles.field}>
              <label style={styles.label} htmlFor="concepto">Concepto</label>
              <input
                id="concepto"
                type="text"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                disabled={loading}
                style={{ ...styles.input, ...(errors.concepto ? styles.inputError : {}) }}
                placeholder="Ej. Pago de renta, Regalo, etc."
              />
              {errors.concepto && <span style={styles.fieldError}>{errors.concepto}</span>}
            </div>

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Procesando...' : 'Realizar transferencia'}
            </button>
          </form>
        </div>
      </main>

      {modal && (
        <Modal
          type={modal.type}
          message={modal.message}
          importe={modal.importe}
          cuentaReceptora={modal.cuentaReceptora}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f4f6f9',
    fontFamily: 'system-ui, sans-serif',
  },
  main: {
    maxWidth: '580px',
    margin: '0 auto',
    padding: '48px 24px',
  },
  card: {
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '28px 36px 24px',
  },
  heading: {
    color: '#182649',
    fontSize: '1.3rem',
    fontWeight: '700',
    margin: '0 0 6px 0',
  },
  subheading: {
    color: '#8a97b0',
    fontSize: '0.875rem',
    margin: 0,
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
    padding: '28px 36px 36px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px',
  },
  label: {
    color: '#182649',
    fontSize: '0.85rem',
    fontWeight: '600',
    letterSpacing: '0.01em',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d9e6',
    fontSize: '0.95rem',
    outline: 'none',
    color: '#182649',
    backgroundColor: '#fafbfd',
  },
  inputError: {
    borderColor: '#c0392b',
    backgroundColor: '#fff8f8',
  },
  fieldError: {
    color: '#c0392b',
    fontSize: '0.8rem',
  },
  button: {
    backgroundColor: '#182649',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '13px',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '6px',
    letterSpacing: '0.01em',
  },
}
