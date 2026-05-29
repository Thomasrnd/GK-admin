import { useState, useEffect } from 'react'
import { authFetch } from '../auth'

const API = import.meta.env.VITE_API_URL

const EMPTY_FORM = { name: '', card_code: '', game_id: '', expansion_id: '', price: '', stock: '', image_url: '' }

export default function AddProduct() {
  const [games, setGames] = useState([])
  const [expansions, setExpansions] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    authFetch(`${API}/products/games`)
      .then(r => r.json())
      .then(d => { setGames(d.games); setExpansions(d.expansions) })
      .catch(() => {})
  }, [])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const filteredExp = expansions.filter(e => e.game_id == form.game_id)

  const handleSubmit = async () => {
    if (!form.name || !form.game_id || !form.expansion_id || !form.price) {
      setError('Nama, game, expansion, dan harga wajib diisi'); return
    }
    setSaving(true); setError('')
    try {
      const res = await authFetch(`${API}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setSuccess(true)
      setForm(EMPTY_FORM)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e.message)
    } finally { setSaving(false) }
  }

  return (
    <div>
      <h1 style={titleStyle}>Tambah Produk</h1>

      <div style={{ maxWidth: '580px', backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <Field label="Nama kartu *">
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="cth. WarGreymon" />
          </Field>
          <Field label="Card code">
            <input value={form.card_code} onChange={e => set('card_code', e.target.value)} placeholder="cth. ST1-001" />
          </Field>
          <Field label="Game *">
            <select value={form.game_id} onChange={e => setForm(f => ({ ...f, game_id: e.target.value, expansion_id: '' }))} style={form.game_id ? {} : { color: '#a1a1aa' }}>
              <option value="">Pilih game</option>
              {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </Field>
          <Field label="Expansion *">
            <select value={form.expansion_id} onChange={e => set('expansion_id', e.target.value)} disabled={!form.game_id} style={{ opacity: !form.game_id ? 0.5 : 1 }}>
              <option value="">Pilih expansion</option>
              {filteredExp.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </Field>
          <Field label="Harga (Rp) *">
            <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="180000" />
          </Field>
          <Field label="Stok awal">
            <input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="10" />
          </Field>
        </div>

        <div style={{ marginTop: '14px' }}>
          <Field label="URL gambar kartu">
            <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
          </Field>
        </div>

        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message="Produk berhasil ditambahkan!" />}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={() => setForm(EMPTY_FORM)} style={cancelBtnStyle}>Reset</button>
          <button onClick={handleSubmit} disabled={saving} style={primaryBtnStyle}>
            {saving ? 'Menyimpan...' : 'Simpan produk'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#52525b', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  )
}

function Alert({ type, message }) {
  const colors = {
    error:   { bg: '#fff1f2', border: '#fecdd3', text: '#e11d48' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  }
  const c = colors[type]
  return (
    <div style={{ backgroundColor: c.bg, border: `1px solid ${c.border}`, borderRadius: '8px', padding: '10px 14px', color: c.text, fontSize: '13px', marginTop: '14px' }}>
      {message}
    </div>
  )
}

const titleStyle    = { fontSize: '22px', fontWeight: '800', marginBottom: '24px' }
const primaryBtnStyle = { padding: '10px 20px', backgroundColor: '#18181b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }
const cancelBtnStyle  = { padding: '10px 20px', border: '1px solid #e4e4e7', borderRadius: '8px', backgroundColor: 'white', fontSize: '14px' }