import { useState, useEffect } from 'react'
import Badge from '../components/Badge'

const API = import.meta.env.VITE_API_URL
const STATUSES = ['pending', 'dikemas', 'dikirim', 'selesai', 'dibatalkan']

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [editStatus, setEditStatus] = useState('')
  const [resi, setResi] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => { fetchOrders() }, [])

  const fetchOrders = () => {
    fetch(`${API}/orders`).then(r => r.json()).then(setOrders).catch(() => {})
  }

  const fetchDetail = (id) => {
    fetch(`${API}/orders/${id}`)
      .then(r => r.json())
      .then(d => {
        setDetail(d)
        setEditStatus(d.status)
        setResi(d.tracking_number || '')
      })
      .catch(() => {})
  }

  const handleSelect = (o) => {
    setSelected(o.id)
    fetchDetail(o.id)
    setSaveMsg('')
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`${API}/orders/${selected}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editStatus, tracking_number: resi || null }),
      })
      fetchOrders()
      fetchDetail(selected)
      setSaveMsg('Tersimpan!')
      setTimeout(() => setSaveMsg(''), 2000)
    } finally { setSaving(false) }
  }

  const filtered = orders.filter(o =>
    (!filterStatus || o.status === filterStatus) &&
    (!search || o.customer_name.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <h1 style={titleStyle}>Kelola Orders</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama customer..." />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '150px' }}>
              <option value="">Semua status</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div style={tableCardStyle}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Customer</th>
                  <th>Kurir</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th style={{ width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#a1a1aa' }}>Tidak ada order</td></tr>
                ) : filtered.map(o => (
                  <tr key={o.id} style={{ backgroundColor: selected === o.id ? '#f4f4f5' : 'white' }}>
                    <td style={{ fontWeight: '700' }}>#{o.id}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{o.customer_name}</div>
                      <div style={{ fontSize: '11px', color: '#a1a1aa' }}>{new Date(o.created_at).toLocaleDateString('id-ID')}</div>
                    </td>
                    <td style={{ color: '#71717a' }}>{o.courier_name} {o.courier_service}</td>
                    <td style={{ fontWeight: '600' }}>Rp {(Number(o.total_price) / 1000).toFixed(0)}rb</td>
                    <td><Badge status={o.status} /></td>
                    <td>
                      <button onClick={() => handleSelect(o)} style={outlineBtnStyle}>Detail</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          {detail ? (
            <div style={panelStyle}>
              <div style={{ fontSize: '15px', fontWeight: '700', marginBottom: '2px' }}>Order #{detail.id}</div>
              <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '18px' }}>{new Date(detail.created_at).toLocaleString('id-ID')}</div>

              <DetailSection title="Penerima">
                <DetailRow label="Nama"    value={detail.customer_name} />
                <DetailRow label="No HP"   value={detail.phone_number} />
                <DetailRow label="Alamat"  value={`${detail.address}, Kec. ${detail.district}, ${detail.city}`} />
                <DetailRow label="Provinsi" value={detail.province} />
                {detail.note && <DetailRow label="Catatan" value={detail.note} />}
              </DetailSection>

              <DetailSection title="Pengiriman">
                <DetailRow label="Kurir"  value={`${detail.courier_name} - ${detail.courier_service}`} />
                <DetailRow label="Ongkir" value={`Rp ${Number(detail.shipping_cost).toLocaleString('id-ID')}`} />
                {detail.tracking_number && <DetailRow label="Resi" value={detail.tracking_number} />}
              </DetailSection>

              <DetailSection title="Item pesanan">
                {detail.items?.map(item => (
                  <DetailRow key={item.id}
                    label={`${item.name} x${item.quantity}`}
                    value={`Rp ${Number(item.price_at_time * item.quantity).toLocaleString('id-ID')}`}
                  />
                ))}
                <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '13px' }}>
                  <span>Total</span>
                  <span style={{ color: '#10b981' }}>Rp {Number(detail.total_price).toLocaleString('id-ID')}</span>
                </div>
              </DetailSection>

              <DetailSection title="Update status">
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} style={{ marginBottom: '8px' }}>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input value={resi} onChange={e => setResi(e.target.value)} placeholder="Nomor resi (opsional)" style={{ marginBottom: '12px' }} />
                <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>
                  {saving ? 'Menyimpan...' : saveMsg || 'Simpan perubahan'}
                </button>
              </DetailSection>
            </div>
          ) : (
            <div style={{ ...panelStyle, textAlign: 'center', padding: '48px 20px', color: '#a1a1aa', fontSize: '14px' }}>
              Pilih order untuk melihat detail
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DetailSection({ title, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '13px', marginBottom: '4px' }}>
      <span style={{ color: '#71717a', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: '500', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

const titleStyle    = { fontSize: '22px', fontWeight: '800', marginBottom: '24px' }
const tableCardStyle = { backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }
const panelStyle    = { backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '20px' }
const outlineBtnStyle = { padding: '4px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', backgroundColor: 'white', fontSize: '12px' }
const primaryBtnStyle = { width: '100%', padding: '10px', backgroundColor: '#18181b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '13px' }