import { useState, useEffect } from 'react'
import { authFetch } from '../auth'

const API = import.meta.env.VITE_API_URL

export default function Games() {
  const [games, setGames] = useState([])
  const [expansions, setExpansions] = useState([])
  const [selectedGame, setSelectedGame] = useState(null)

  const [newGameName, setNewGameName] = useState('')
  const [addingGame, setAddingGame] = useState(false)
  const [gameError, setGameError] = useState('')

  const [editingGame, setEditingGame] = useState(null)
  const [editGameName, setEditGameName] = useState('')

  const [newExpName, setNewExpName] = useState('')
  const [newExpNewest, setNewExpNewest] = useState(false)
  const [addingExp, setAddingExp] = useState(false)
  const [expError, setExpError] = useState('')

  const [editingExp, setEditingExp] = useState(null)
  const [editExpName, setEditExpName] = useState('')
  const [editExpNewest, setEditExpNewest] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const data = await authFetch(`${API}/games`).then(r => r.json()).catch(() => ({ games: [], expansions: [] }))
    setGames(data.games || [])
    setExpansions(data.expansions || [])
  }

  const expansionsForGame = (gameId) => expansions.filter(e => e.game_id === gameId)

  // ── Game actions ──
  const handleAddGame = async () => {
    if (!newGameName.trim()) return
    setAddingGame(true); setGameError('')
    try {
      const res = await authFetch(`${API}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGameName.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewGameName('')
      fetchData()
    } catch (e) { setGameError(e.message) }
    finally { setAddingGame(false) }
  }

  const handleEditGame = async (id) => {
    if (!editGameName.trim()) return
    try {
      const res = await authFetch(`${API}/games/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editGameName.trim() })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setEditingGame(null)
      fetchData()
    } catch (e) { alert(e.message) }
  }

  const handleDeleteGame = async (id, name) => {
    const expCount = expansionsForGame(id).length
    if (!confirm(`Hapus game "${name}"?\n\nIni akan menghapus SEMUA data terkait:\n• Semua expansion (${expCount} expansion)\n• Semua produk di game ini\n\nAksi ini tidak bisa dibatalkan!`)) return
    try {
      const res = await authFetch(`${API}/games/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      if (selectedGame === id) setSelectedGame(null)
      alert(`Game "${name}" berhasil dihapus.\n${data.deleted.products} produk dan ${data.deleted.expansions} expansion telah dihapus.`)
      fetchData()
    } catch (e) { alert(e.message) }
  }

  // ── Expansion actions ──
  const handleAddExp = async () => {
    if (!newExpName.trim() || !selectedGame) return
    setAddingExp(true); setExpError('')
    try {
      const res = await authFetch(`${API}/games/${selectedGame}/expansions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newExpName.trim(), is_newest: newExpNewest })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setNewExpName(''); setNewExpNewest(false)
      fetchData()
    } catch (e) { setExpError(e.message) }
    finally { setAddingExp(false) }
  }

  const handleEditExp = async (id) => {
    try {
      const res = await authFetch(`${API}/games/expansions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editExpName.trim(), is_newest: editExpNewest })
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setEditingExp(null)
      fetchData()
    } catch (e) { alert(e.message) }
  }

  const handleDeleteExp = async (id, name) => {
    if (!confirm(`Hapus expansion "${name}"?`)) return
    try {
      const res = await authFetch(`${API}/games/expansions/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      fetchData()
    } catch (e) { alert(e.message) }
  }

  const selectedGameData = games.find(g => g.id === selectedGame)

  return (
    <div>
      <h1 style={titleStyle}>Kelola Game & Expansion</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

        {/* ── Kolom kiri: Games ── */}
        <div>
          <h3 style={sectionStyle}>Daftar Game</h3>

          {/* Form tambah game */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                value={newGameName}
                onChange={e => setNewGameName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddGame()}
                placeholder="Nama game baru..."
                style={{ flex: 1 }}
              />
              <button onClick={handleAddGame} disabled={addingGame || !newGameName.trim()} style={primaryBtnStyle}>
                {addingGame ? '...' : '+ Tambah'}
              </button>
            </div>
            {gameError && <div style={errorStyle}>{gameError}</div>}
          </div>

          {/* List games */}
          <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
            {games.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#a1a1aa', fontSize: '14px' }}>Belum ada game</div>
            ) : games.map(g => (
              <div
                key={g.id}
                onClick={() => { if (editingGame !== g.id) setSelectedGame(g.id) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 16px', borderBottom: '1px solid #f9f9f9',
                  backgroundColor: selectedGame === g.id ? '#f4f4f5' : 'white',
                  cursor: 'pointer', transition: 'background 0.1s',
                  borderLeft: selectedGame === g.id ? '3px solid #18181b' : '3px solid transparent',
                }}
              >
                {editingGame === g.id ? (
                  <>
                    <input
                      value={editGameName}
                      onChange={e => setEditGameName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleEditGame(g.id)}
                      style={{ flex: 1, fontSize: '13px' }}
                      autoFocus
                      onClick={e => e.stopPropagation()}
                    />
                    <button onClick={e => { e.stopPropagation(); handleEditGame(g.id) }} style={saveBtnStyle}>Simpan</button>
                    <button onClick={e => { e.stopPropagation(); setEditingGame(null) }} style={cancelBtnStyle}>Batal</button>
                  </>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{g.name}</div>
                      <div style={{ fontSize: '11px', color: '#a1a1aa' }}>
                        {expansionsForGame(g.id).length} expansion
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); setEditingGame(g.id); setEditGameName(g.name) }} style={iconBtnStyle}>Edit</button>
                    <button onClick={e => { e.stopPropagation(); handleDeleteGame(g.id, g.name) }} style={{ ...iconBtnStyle, color: '#e11d48', borderColor: '#fecdd3' }}>Hapus</button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Kolom kanan: Expansions ── */}
        <div>
          <h3 style={sectionStyle}>
            Expansion {selectedGameData ? `— ${selectedGameData.name}` : ''}
          </h3>

          {!selectedGame ? (
            <div style={{ ...cardStyle, textAlign: 'center', color: '#a1a1aa', fontSize: '14px', padding: '32px' }}>
              Pilih game di sebelah kiri untuk kelola expansion-nya
            </div>
          ) : (
            <>
              {/* Form tambah expansion */}
              <div style={cardStyle}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    value={newExpName}
                    onChange={e => setNewExpName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddExp()}
                    placeholder="Nama expansion baru..."
                    style={{ flex: 1 }}
                  />
                  <button onClick={handleAddExp} disabled={addingExp || !newExpName.trim()} style={primaryBtnStyle}>
                    {addingExp ? '...' : '+ Tambah'}
                  </button>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#52525b', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newExpNewest} onChange={e => setNewExpNewest(e.target.checked)} style={{ width: 'auto' }} />
                  Tandai sebagai expansion terbaru
                </label>
                {expError && <div style={errorStyle}>{expError}</div>}
              </div>

              {/* List expansions */}
              <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>
                {expansionsForGame(selectedGame).length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#a1a1aa', fontSize: '14px' }}>Belum ada expansion</div>
                ) : expansionsForGame(selectedGame).map(e => (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderBottom: '1px solid #f9f9f9' }}>
                    {editingExp === e.id ? (
                      <>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <input value={editExpName} onChange={ev => setEditExpName(ev.target.value)} style={{ fontSize: '13px' }} autoFocus />
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#52525b', cursor: 'pointer' }}>
                            <input type="checkbox" checked={editExpNewest} onChange={ev => setEditExpNewest(ev.target.checked)} style={{ width: 'auto' }} />
                            Expansion terbaru
                          </label>
                        </div>
                        <button onClick={() => handleEditExp(e.id)} style={saveBtnStyle}>Simpan</button>
                        <button onClick={() => setEditingExp(null)} style={cancelBtnStyle}>Batal</button>
                      </>
                    ) : (
                      <>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {e.name}
                            {e.is_newest && (
                              <span style={{ fontSize: '10px', fontWeight: '700', backgroundColor: '#EAF3DE', color: '#27500A', padding: '1px 7px', borderRadius: '20px' }}>
                                Terbaru
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => { setEditingExp(e.id); setEditExpName(e.name); setEditExpNewest(e.is_newest) }} style={iconBtnStyle}>Edit</button>
                        <button onClick={() => handleDeleteExp(e.id, e.name)} style={{ ...iconBtnStyle, color: '#e11d48', borderColor: '#fecdd3' }}>Hapus</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

const titleStyle   = { fontSize: '22px', fontWeight: '800', marginBottom: '24px' }
const sectionStyle = { fontSize: '12px', fontWeight: '700', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }
const cardStyle    = { backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '14px 16px', marginBottom: '12px' }
const errorStyle   = { marginTop: '8px', fontSize: '12px', color: '#e11d48', backgroundColor: '#fff1f2', padding: '6px 10px', borderRadius: '6px' }
const primaryBtnStyle = { padding: '8px 14px', backgroundColor: '#18181b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }
const saveBtnStyle    = { padding: '5px 10px', backgroundColor: '#18181b', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }
const cancelBtnStyle  = { padding: '5px 10px', border: '1px solid #e4e4e7', borderRadius: '6px', backgroundColor: 'white', fontSize: '12px', cursor: 'pointer' }
const iconBtnStyle    = { padding: '4px 10px', border: '1px solid #e4e4e7', borderRadius: '6px', backgroundColor: 'white', fontSize: '12px', cursor: 'pointer', color: '#52525b' }