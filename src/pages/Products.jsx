import { useState, useEffect } from 'react'
import { authFetch } from '../auth'

const API = import.meta.env.VITE_API_URL

export default function Products() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [filterGame, setFilterGame] = useState('')
  const [filterExp, setFilterExp] = useState('')
  const [editing, setEditing] = useState(null)
  const [editData, setEditData] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchProducts() }, [])

  const fetchProducts = () => {
    authFetch(`${API}/products/all`).then(r => r.json()).then(setProducts).catch(() => {})
  }

  const games = [...new Set(products.map(p => p.game_name))].sort()

  const expansionsForGame = [...new Set(
    products
      .filter(p => !filterGame || p.game_name === filterGame)
      .map(p => p.expansion_name)
  )].sort()

  const handleGameChange = (game) => {
    setFilterGame(game)
    setFilterExp('')
  }

  const filtered = products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.card_code?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterGame || p.game_name === filterGame) &&
    (!filterExp || p.expansion_name === filterExp)
  )

  const handleEdit = (p) => {
    setEditing(p.id)
    setEditData({ price: p.price, stock: p.stock, is_active: p.is_active, image_url: p.image_url || '' })
  }

  const handleSave = async (id) => {
    setSaving(true)
    try {
      await authFetch(`${API}/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      fetchProducts()
      setEditing(null)
    } finally { setSaving(false) }
  }

  return (
    <div>
      <h1 style={titleStyle}>Daftar Produk</h1>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari nama / card code..."
          style={{ flex: 1, minWidth: '180px' }}
        />
        <select value={filterGame} onChange={e => handleGameChange(e.target.value)} style={{ width: '160px' }}>
          <option value="">Semua game</option>
          {games.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
        <select
          value={filterExp}
          onChange={e => setFilterExp(e.target.value)}
          disabled={!filterGame}
          style={{ width: '180px', opacity: !filterGame ? 0.5 : 1 }}
        >
          <option value="">Semua set</option>
          {expansionsForGame.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {/* Info count */}
      <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '10px' }}>
        {filtered.length} produk
        {filterGame && ` · ${filterGame}`}
        {filterExp && ` · ${filterExp}`}
      </div>

      <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: '56px' }}></th>
              <th>Kartu</th>
              <th>Set</th>
              <th>Harga</th>
              <th>Stok</th>
              <th>Status</th>
              <th style={{ width: '120px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '32px', textAlign: 'center', color: '#a1a1aa' }}>Tidak ada produk</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id}>
                <td>
                  <Thumb url={p.image_url} name={p.name} />
                </td>
                <td>
                  <div style={{ fontWeight: '600' }}>{p.name}</div>
                  {p.card_code && <div style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace' }}>{p.card_code}</div>}
                </td>
                <td style={{ color: '#71717a' }}>
                  {!filterGame && <div style={{ fontSize: '12px' }}>{p.game_name}</div>}
                  <div style={{ fontSize: filterGame ? '13px' : '11px', color: filterGame ? '#18181b' : '#a1a1aa' }}>{p.expansion_name}</div>
                </td>
                <td>
                  {editing === p.id
                    ? <input type="number" value={editData.price} onChange={e => setEditData(d => ({...d, price: e.target.value}))} style={{ width: '100px' }} />
                    : `Rp ${Number(p.price).toLocaleString('id-ID')}`}
                </td>
                <td>
                  {editing === p.id
                    ? <input type="number" value={editData.stock} onChange={e => setEditData(d => ({...d, stock: e.target.value}))} style={{ width: '70px' }} />
                    : <span style={{ color: p.stock <= 5 ? '#E24B4A' : '#18181b', fontWeight: p.stock <= 5 ? '700' : '400' }}>{p.stock}</span>}
                </td>
                <td>
                  {editing === p.id
                    ? <select value={String(editData.is_active)} onChange={e => setEditData(d => ({...d, is_active: e.target.value === 'true'}))} style={{ width: '100px' }}>
                        <option value="true">Aktif</option>
                        <option value="false">Nonaktif</option>
                      </select>
                    : <StatusPill active={p.is_active} />}
                </td>
                <td>
                  {editing === p.id
                    ? <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleSave(p.id)} disabled={saving} style={saveBtnStyle}>Simpan</button>
                        <button onClick={() => setEditing(null)} style={cancelBtnStyle}>Batal</button>
                      </div>
                    : <button onClick={() => handleEdit(p)} style={editBtnStyle}>Edit</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit gambar — muncul saat editing */}
      {editing && (
        <div style={{ marginTop: '16px', backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '20px', maxWidth: '600px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: '#3f3f46' }}>
            URL Gambar Kartu
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0 }}>
              <Thumb url={editData.image_url} name="" big />
            </div>
            <div style={{ flex: 1 }}>
              <input
                value={editData.image_url}
                onChange={e => setEditData(d => ({ ...d, image_url: e.target.value }))}
                placeholder="https://..."
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                Tempel URL gambar kartu. Preview muncul otomatis di sebelah kiri. Kosongkan untuk pakai placeholder.
              </div>
              <button onClick={() => handleSave(editing)} disabled={saving} style={{ ...saveBtnStyle, marginTop: '12px', padding: '8px 18px', fontSize: '13px' }}>
                {saving ? 'Menyimpan...' : 'Simpan perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Thumb({ url, name, big }) {
  const [failed, setFailed] = useState(false)
  const size = big ? { width: '90px', height: '126px' } : { width: '40px', height: '56px' }

  if (!url || failed) {
    return (
      <div style={{
        ...size, borderRadius: '6px',
        background: 'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: 'white', fontSize: big ? '11px' : '8px', fontWeight: '700' }}>No img</span>
      </div>
    )
  }
  return (
    <img
      src={url}
      alt={name}
      onError={() => setFailed(true)}
      style={{ ...size, borderRadius: '6px', objectFit: 'cover', display: 'block', flexShrink: 0, border: '1px solid #f0f0f0' }}
    />
  )
}

function StatusPill({ active }) {
  return (
    <span style={{
      fontSize: '12px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
      backgroundColor: active ? '#EAF3DE' : '#FCEBEB',
      color: active ? '#27500A' : '#791F1F',
    }}>
      {active ? 'Aktif' : 'Nonaktif'}
    </span>
  )
}

const titleStyle     = { fontSize: '22px', fontWeight: '800', marginBottom: '24px' }
const editBtnStyle   = { padding: '4px 12px', border: '1px solid #e4e4e7', borderRadius: '6px', backgroundColor: 'white', fontSize: '12px' }
const saveBtnStyle   = { padding: '4px 10px', backgroundColor: '#18181b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px' }
const cancelBtnStyle = { padding: '4px 10px', border: '1px solid #e4e4e7', borderRadius: '6px', backgroundColor: 'white', fontSize: '12px' }