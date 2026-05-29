import { useState } from 'react'
import Sidebar    from './components/Sidebar'
import Dashboard  from './pages/Dashboard'
import Orders     from './pages/Orders'
import Sales      from './pages/Sales'
import Products   from './pages/Products'
import Games      from './pages/Games'
import AddProduct from './pages/AddProduct'
import ImportCSV  from './pages/ImportCSV'
import Login      from './pages/Login'
import { useAuth } from './auth'

export default function App() {
  const { admin, loading } = useAuth()
  const [page, setPage] = useState('dashboard')

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: '14px' }}>
        Memuat...
      </div>
    )
  }

  if (!admin) return <Login />

  const pages = {
    dashboard: <Dashboard setPage={setPage} />,
    orders:    <Orders />,
    sales:     <Sales />,
    products:  <Products />,
    games:     <Games />,
    add:       <AddProduct />,
    import:    <ImportCSV />,
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, padding: '32px', minHeight: '100vh', overflowX: 'auto' }}>
        {pages[page]}
      </main>
    </div>
  )
}