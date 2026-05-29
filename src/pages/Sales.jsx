import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'

const API = import.meta.env.VITE_API_URL

const rupiah = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`

export default function Sales() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    fetch(`${API}/orders/sales-report`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const toggle = (gameName) => {
    setExpanded(prev => ({ ...prev, [gameName]: !prev[gameName] }))
  }

  if (loading) {
    return (
      <div>
        <h1 style={titleStyle}>Rekap Penjualan</h1>
        <div style={{ color: '#a1a1aa', fontSize: '14px' }}>Memuat data...</div>
      </div>
    )
  }

  const hasData = data?.games?.length > 0

  return (
    <div>
      <h1 style={titleStyle}>Rekap Penjualan</h1>
      <p style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '-16px', marginBottom: '24px' }}>
        Berdasarkan order berstatus <strong>selesai</strong>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '28px', maxWidth: '480px' }}>
        <StatCard label="Total omzet" value={rupiah(data?.summary?.total_revenue || 0)} />
        <StatCard label="Total kartu terjual" value={`${data?.summary?.total_qty || 0} pcs`} />
      </div>

      {!hasData ? (
        <div style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#a1a1aa', fontSize: '14px' }}>
          Belum ada penjualan selesai untuk direkap.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {data.games.map(game => {
            const isOpen = expanded[game.game_name]
            return (
              <div key={game.game_name} style={{ backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', overflow: 'hidden' }}>

                {/* Game header */}
                <button
                  onClick={() => toggle(game.game_name)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 20px', border: 'none', backgroundColor: '#fafafa', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#a1a1aa', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>▶</span>
                    <span style={{ fontSize: '16px', fontWeight: '800' }}>{game.game_name}</span>
                    <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{game.sets.length} set</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontSize: '13px', color: '#71717a' }}>{game.qty} pcs</span>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#10b981', minWidth: '120px', textAlign: 'right' }}>{rupiah(game.revenue)}</span>
                  </div>
                </button>

                {/* Sets breakdown */}
                {isOpen && (
                  <div style={{ padding: '8px 20px 16px' }}>
                    {game.sets.map(set => (
                      <div key={set.expansion_name} style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '2px solid #f0f0f0' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#3f3f46' }}>{set.expansion_name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <span style={{ fontSize: '12px', color: '#a1a1aa' }}>{set.qty} pcs</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '120px', textAlign: 'right' }}>{rupiah(set.revenue)}</span>
                          </div>
                        </div>

                        {/* Products in set */}
                        <table style={{ width: '100%', marginTop: '4px' }}>
                          <tbody>
                            {set.products.map((prod, i) => (
                              <tr key={i}>
                                <td style={{ padding: '6px 0', fontSize: '13px' }}>
                                  {prod.product_name}
                                  {prod.card_code && <span style={{ fontSize: '11px', color: '#a1a1aa', fontFamily: 'monospace', marginLeft: '8px' }}>{prod.card_code}</span>}
                                </td>
                                <td style={{ padding: '6px 0', fontSize: '12px', color: '#a1a1aa', textAlign: 'right', width: '80px' }}>{prod.qty_sold} pcs</td>
                                <td style={{ padding: '6px 0', fontSize: '13px', fontWeight: '600', textAlign: 'right', width: '120px' }}>{rupiah(prod.revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const titleStyle = { fontSize: '22px', fontWeight: '800', marginBottom: '24px' }