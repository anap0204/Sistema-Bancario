export default function Modal({ type = 'success', title, message, importe, cuentaReceptora, onClose }) {
  const isSuccess = type === 'success'
 
  const importeFormateado =
    importe != null
      ? parseFloat(importe).toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : null
 
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...styles.icon, backgroundColor: isSuccess ? '#182649' : '#c0392b' }}>
          {isSuccess ? '✓' : '✕'}
        </div>
 
        <h2 style={styles.title}>
          {title || (isSuccess ? 'Transferencia realizada con éxito' : 'Error en la operación')}
        </h2>
 
        {message && <p style={styles.message}>{message}</p>}
 
        {isSuccess && importeFormateado && (
          <div style={styles.details}>
            <p style={styles.detail}>
              <span style={styles.detailLabel}>Monto transferido</span>
              <span style={styles.detailValue}>${importeFormateado}</span>
            </p>
            {cuentaReceptora && (
              <p style={styles.detail}>
                <span style={styles.detailLabel}>Cuenta destino</span>
                <span style={styles.detailValue}>{cuentaReceptora}</span>
              </p>
            )}
          </div>
        )}
 
        <button
          style={{ ...styles.button, backgroundColor: isSuccess ? '#182649' : '#c0392b' }}
          onClick={onClose}
        >
          Aceptar
        </button>
      </div>
    </div>
  )
}
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 15.3px 0 rgba(0, 0, 0, 0.31)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  icon: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: '#182649',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.6rem',
    fontWeight: '700',
  },
  title: {
    color: '#182649',
    fontSize: '1.1rem',
    fontWeight: '700',
    textAlign: 'center',
    margin: 0,
  },
  message: {
    color: '#555',
    fontSize: '0.9rem',
    textAlign: 'center',
    margin: 0,
    lineHeight: '1.5',
  },
  details: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: '#f0f2f5',
    borderRadius: '10px',
    padding: '16px',
  },
  detail: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: 0,
    fontSize: '0.9rem',
  },
  detailLabel: {
    color: '#555',
  },
  detailValue: {
    color: '#182649',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#182649',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 40px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '8px',
  },
}
