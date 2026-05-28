import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'

const API = import.meta.env.VITE_API_URL

export default function Stock() {
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [newStock, setNewStock] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = () => {
    fetch(`${API}/products/all`).then(r => r.json()).then(setProducts).catch(() => {})
  }

  const handleSave = async (id) => {
    setSaving(true)
    try {
      await fetch(`${API}/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: parseInt(newStock) }),
      })
      fetchProducts()
      setEditing(null)
    } finally { setSaving(false) }
  }

  const maxStock = Math.max(...products.map(p => p.stock), 1)
  const critical = products.filter(p => p.stock <= 5).length
  const low      = products.filter(p => p.stock <= 10 && p.stock > 5).length

  const filtered = products
    .filter(p => {
      if (filter === 'critical') return p.stock <= 5
      if (filter === 'low')      return p.stock <= 10 && p.stock > 5
      return true
    })
    .sort((a, b) => a.stock - b.stock)

  return (
    <div>
      <h1 style={titleStyle}>Monitor Stok</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Stok kritis (≤5)"  value={critical} sub={critical > 0 ? 'perlu restock segera' : 'aman'} subColor={critical > 0 ? '#E24B4A' : '#10b981'} />
        <StatCard label="Stok rendah (≤10)" value={low}      sub={low > 0 ? 'perlu perhatian' : 'aman'}           subColor={low > 0 ? '#BA7517' : '#10b981'} />
        <StatCard label="Total produk aktif" value={products.filter(p => p.is_active).length} />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {[['all','Semua'], ['critical','Kritis (≤5)'], ['low','Rendah (≤10)']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            padding: '6px 14px', borderRadius: '20px', border: '1px solid',
            borderColor: filter === val ? '#18181b' : '#e4e4e7',
            backgroundColor: filter === val ? '#18181b' : 'white',
            color: filter === val ? 'white' : '#71717a',
            fontSize: '13px', fontWeight: '600',
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Kartu</th>
              <th>Expansion</th>
              <th style={{ width: '80px' }}>Stok</th>
              <th style={{ width: '180px' }}>Bar</th>
              <th style={{ width: '130px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const pct      = Math.min((p.stock / maxStock) * 100, 100)
              const barColor = p.stock <= 5 ? '#E24B4A' : p.stock <= 10 ? '#EF9F27' : '#639922'
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: '600' }}>{p.name}</td>
                  <td style={{ color: '#71717a' }}>{p.expansion_name}</td>
                  <td style={{ fontWeight: '700', color: barColor }}>
                    {editing === p.id
                      ? <input type="number" value={newStock} onChange={e => setNewStock(e.target.value)} style={{ width: '64px' }} autoFocus />
                      : `${p.stock} pcs`}
                  </td>
                  <td>
                    <div style={{ height: '4px', backgroundColor: '#f0f0f0', borderRadius: '2px' }}>
                      <div style={{ height: '4px', width: `${pct}%`, backgroundColor: barColor, borderRadius: '2px', transition: 'width 0.3s' }} />
                    </div>
                  </td>
                  <td>
                    {editing === p.id
                      ? <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleSave(p.id)} disabled={saving} style={saveBtnStyle}>Simpan</button>
                          <button onClick={() => setEditing(null)} style={cancelBtnStyle}>Batal</button>
                        </div>
                      : <button onClick={() => { setEditing(p.id); setNewStock(String(p.stock)) }} style={editBtnStyle}>Update</button>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const titleStyle    = { fontSize: '22px', fontWeight: '800', marginBottom: '24px' }
const editBtnStyle  = { padding: '4px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', backgroundColor: 'white', fontSize: '12px' }
const saveBtnStyle  = { padding: '4px 10px', backgroundColor: '#18181b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px' }
const cancelBtnStyle = { padding: '4px 10px', border: '1px solid #e4e4e7', borderRadius: '6px', backgroundColor: 'white', fontSize: '12px' }