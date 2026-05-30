import { useAuth } from '../auth'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',        color: '#18181b' },
  { id: 'orders',    label: 'Orders',           color: '#378ADD' },
  { id: 'sales',     label: 'Rekap Penjualan',  color: '#1D9E75' },
  { id: 'products',  label: 'Produk',           color: '#639922' },
  { id: 'games',     label: 'Game & Expansion', color: '#D4537E' },
  { id: 'add',       label: 'Tambah Produk',    color: '#BA7517' },
  { id: 'import',    label: 'Import CSV',       color: '#7F77DD' },
  { id: 'settings',  label: 'Pengaturan Rekening', color: '#3F8C8C' },
]

export default function Sidebar({ page, setPage }) {
  const { admin, logout } = useAuth()
  return (
    <aside style={{
      width: '210px', backgroundColor: 'white',
      borderRight: '1px solid #f0f0f0', flexShrink: 0,
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      position: 'sticky', top: 0,
    }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: '16px', fontWeight: '800', color: '#18181b' }}>TCG Admin</div>
        <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '2px' }}>Panel pengelola toko</div>
      </div>

      <nav style={{ padding: '12px 0', flex: 1 }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            style={{
              width: '100%', textAlign: 'left',
              padding: '10px 20px', border: 'none',
              backgroundColor: page === item.id ? '#f4f4f5' : 'transparent',
              color: page === item.id ? '#18181b' : '#71717a',
              fontWeight: page === item.id ? '700' : '500',
              fontSize: '14px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '10px',
              borderRight: page === item.id ? '3px solid #18181b' : '3px solid transparent',
              transition: 'all 0.1s',
            }}
          >
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: item.color, flexShrink: 0,
            }} />
            {item.label}
          </button>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0' }}>
        {admin && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#18181b' }}>{admin.name || admin.username}</div>
            <div style={{ fontSize: '11px', color: '#a1a1aa' }}>@{admin.username}</div>
          </div>
        )}
        <button
          onClick={logout}
          style={{ width: '100%', padding: '8px', border: '1px solid #e4e4e7', borderRadius: '8px', backgroundColor: 'white', fontSize: '12px', fontWeight: '600', color: '#e11d48', cursor: 'pointer', marginBottom: '10px' }}
        >
          Keluar
        </button>
        <a href="http://localhost:5173" style={{ fontSize: '12px', color: '#a1a1aa', textDecoration: 'none' }}>
          ← Ke Storefront
        </a>
      </div>
    </aside>
  )
}