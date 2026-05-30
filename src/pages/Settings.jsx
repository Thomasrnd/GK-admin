import { useState, useEffect } from 'react'
import { authFetch } from '../auth'

const API = import.meta.env.VITE_API_URL

export default function Settings() {
  const [accounts, setAccounts] = useState([])
  const [form, setForm] = useState({ bank_name: '', account_number: '', account_holder: '' })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [editData, setEditData] = useState({})

  useEffect(() => { fetchAccounts() }, [])

  const fetchAccounts = () => {
    authFetch(`${API}/bank-accounts/all`).then(r => r.json()).then(setAccounts).catch(() => {})
  }

  const handleAdd = async () => {
    if (!form.bank_name.trim() || !form.account_number.trim() || !form.account_holder.trim()) {
      setError('Semua field wajib diisi'); return
    }
    setAdding(true); setError('')
    try {
      const res = await authFetch(`${API}/bank-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setForm({ bank_name: '', account_number: '', account_holder: '' })
      fetchAccounts()
    } catch (e) { setError(e.message) }
    finally { setAdding(false) }
  }

  const handleToggleActive = async (acc) => {
    await authFetch(`${API}/bank-accounts/${acc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !acc.is_active }),
    })
    fetchAccounts()
  }

  const handleSaveEdit = async (id) => {
    await authFetch(`${API}/bank-accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
    setEditing(null)
    fetchAccounts()
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus rekening ${name}?`)) return
    await authFetch(`${API}/bank-accounts/${id}`, { method: 'DELETE' })
    fetchAccounts()
  }

  return (
    <div>
      <h1 style={titleStyle}>Pengaturan Rekening</h1>
      <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '-16px', marginBottom: '24px' }}>
        Rekening aktif akan ditampilkan ke pembeli saat checkout
      </p>

      <div style={{ maxWidth: '600px' }}>
        {/* Form tambah */}
        <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '14px', color: '#3f3f46' }}>Tambah Rekening</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <Field label="Nama Bank">
              <input value={form.bank_name} onChange={e => setForm(f => ({...f, bank_name: e.target.value}))} placeholder="cth. BCA" style={inputStyle} />
            </Field>
            <Field label="Atas Nama">
              <input value={form.account_holder} onChange={e => setForm(f => ({...f, account_holder: e.target.value}))} placeholder="cth. Thomas Riandi" style={inputStyle} />
            </Field>
          </div>
          <Field label="Nomor Rekening">
            <input value={form.account_number} onChange={e => setForm(f => ({...f, account_number: e.target.value}))} placeholder="cth. 1234567890" style={inputStyle} />
          </Field>
          {error && <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '8px 12px', color: '#e11d48', fontSize: '13px', marginTop: '12px' }}>{error}</div>}
          <button onClick={handleAdd} disabled={adding} style={{ marginTop: '14px', padding: '9px 18px', backgroundColor: '#18181b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
            {adding ? 'Menyimpan...' : 'Tambah Rekening'}
          </button>
        </div>

        {/* List rekening */}
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          Daftar Rekening
        </div>
        {accounts.length === 0 ? (
          <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#a1a1aa', fontSize: '14px' }}>
            Belum ada rekening
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {accounts.map(acc => (
              <div key={acc.id} style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '16px', opacity: acc.is_active ? 1 : 0.55 }}>
                {editing === acc.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input value={editData.bank_name} onChange={e => setEditData(d => ({...d, bank_name: e.target.value}))} style={inputStyle} placeholder="Nama bank" />
                    <input value={editData.account_number} onChange={e => setEditData(d => ({...d, account_number: e.target.value}))} style={inputStyle} placeholder="Nomor rekening" />
                    <input value={editData.account_holder} onChange={e => setEditData(d => ({...d, account_holder: e.target.value}))} style={inputStyle} placeholder="Atas nama" />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button onClick={() => handleSaveEdit(acc.id)} style={smallPrimaryBtn}>Simpan</button>
                      <button onClick={() => setEditing(null)} style={smallBtn}>Batal</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800' }}>{acc.bank_name}</span>
                        {!acc.is_active && <span style={{ fontSize: '10px', fontWeight: '700', color: '#791F1F', backgroundColor: '#FCEBEB', padding: '1px 7px', borderRadius: '20px' }}>Nonaktif</span>}
                      </div>
                      <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#3f3f46', marginTop: '2px' }}>{acc.account_number}</div>
                      <div style={{ fontSize: '12px', color: '#a1a1aa' }}>a.n. {acc.account_holder}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleToggleActive(acc)} style={smallBtn}>{acc.is_active ? 'Nonaktifkan' : 'Aktifkan'}</button>
                      <button onClick={() => { setEditing(acc.id); setEditData({ bank_name: acc.bank_name, account_number: acc.account_number, account_holder: acc.account_holder }) }} style={smallBtn}>Edit</button>
                      <button onClick={() => handleDelete(acc.id, acc.bank_name)} style={{ ...smallBtn, color: '#e11d48', borderColor: '#fecdd3' }}>Hapus</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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

const titleStyle = { fontSize: '22px', fontWeight: '800', marginBottom: '24px' }
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }
const smallBtn = { padding: '5px 11px', border: '1px solid #e4e4e7', borderRadius: '6px', backgroundColor: 'white', fontSize: '12px', cursor: 'pointer', color: '#52525b' }
const smallPrimaryBtn = { padding: '5px 11px', backgroundColor: '#18181b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }