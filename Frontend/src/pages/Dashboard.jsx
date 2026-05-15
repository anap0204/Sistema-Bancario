import Navbar from '../components/Navbar'

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <main style={{ padding: '32px', fontFamily: 'system-ui, sans-serif', color: '#182649' }}>
        <h2>Dashboard</h2>
        <p>Bienvenido al sistema bancario.</p>
      </main>
    </>
  )
}
