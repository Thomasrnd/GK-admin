import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'
import Badge from '../components/Badge'

const API = import.meta.env.VITE_API_URL

export default function Dashboard({ setPage }) {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [lowStock, setLowStock] = useState([])

  useEffect(() => {
    fetch(`${API}/orders`)
      .then(r => r.json())
      .then(orders => {
        const today = new Date().toDateString()
        setRecentOrders(orders.slice(0, 5))
        setStats({
          totalOrders: orders.length,
          todayOrders: orders.filter(o => new Date(o.created_at).toDateString() === today).length,
          revenue: orders.filter(o => o.status === 'selesai').reduce((s, o) => s + Number(o.total_price), 0),
          pending: orders.filter(o => o.status === 'pending').length,
        })
      })
      .catch(() => {})

    fetch(`${API}/products/all`)
      .then(r => r.json())
      .then(products => {
        setLowStock(
          products.filter(p => p.stock <= 5 && p.is_active)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5)
        )
      })
      .catch(() => {})
  }, [])

  return (
    <div>
      <h1 style={titleStyle}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total order"       value={stats?.totalOrders ?? '—'} sub={`+${stats?.todayOrders ?? 0} hari ini`} subColor="#10b981" />
        <StatCard label="Pending"           value={stats?.pending ?? '—'}     sub={stats?.pending > 0 ? 'perlu diproses' : 'bersih'} subColor={stats?.pending > 0 ? '#E24B4A' : '#10b981'} />
        <StatCard label="Revenue (selesai)" value={stats ? `Rp ${(stats.revenue / 1000000).toFixed(1)}jt` : '—'} />
        <StatCard label="Stok kritis"       value={lowStock.length} sub={lowStock.length > 0 ? 'perlu restock' : 'semua aman'} subColor={lowStock.length > 0 ? '#E24B4A' : '#10b981'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <section>
          <h3 style={sectionStyle}>Order terbaru</h3>
          <div style={cardStyle}>
            {recentOrders.length === 0
              ? <Empty text="Belum ada order" />
              : recentOrders.map(o => (
                <div key={o.id} style={rowStyle}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>#{o.id} {o.customer_name}</div>
                    <div style={{ fontSize: '12px', color: '#a1a1aa' }}>Rp {Number(o.total_price).toLocaleString('id-ID')}</div>
                  </div>
                  <Badge status={o.status} />
                </div>
              ))
            }
            <button onClick={() => setPage('orders')} style={linkBtnStyle}>Lihat semua →</button>
          </div>
        </section>

        <section>
          <h3 style={sectionStyle}>Stok kritis</h3>
          <div style={cardStyle}>
            {lowStock.length === 0
              ? <Empty text="Semua stok aman ✓" color="#10b981" />
              : lowStock.map(p => (
                <div key={p.id} style={{ ...rowStyle, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: '#a1a1aa' }}>{p.expansion_name}</div>
                  </div>
                  <span style={{ fontWeight: '700', color: p.stock <= 3 ? '#E24B4A' : '#BA7517', fontSize: '13px' }}>
                    {p.stock} pcs
                  </span>
                </div>
              ))
            }
            <button onClick={() => setPage('stock')} style={linkBtnStyle}>Monitor stok →</button>
          </div>
        </section>
      </div>
    </div>
  )
}

function Empty({ text, color }) {
  return <div style={{ padding: '24px', textAlign: 'center', color: color || '#a1a1aa', fontSize: '14px' }}>{text}</div>
}

const titleStyle   = { fontSize: '22px', fontWeight: '800', marginBottom: '24px' }
const sectionStyle = { fontSize: '12px', fontWeight: '700', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }
const cardStyle    = { backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }
const rowStyle     = { display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f9f9f9' }
const linkBtnStyle = { width: '100%', padding: '12px', border: 'none', backgroundColor: 'transparent', color: '#a1a1aa', fontSize: '13px', cursor: 'pointer' }