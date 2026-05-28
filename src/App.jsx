import { useState } from 'react'
import Sidebar    from './components/Sidebar'
import Dashboard  from './pages/Dashboard'
import Orders     from './pages/Orders'
import Products   from './pages/Products'
import Games      from './pages/Games'
import AddProduct from './pages/AddProduct'
import ImportCSV  from './pages/ImportCSV'

export default function App() {
  const [page, setPage] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard setPage={setPage} />,
    orders:    <Orders />,
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