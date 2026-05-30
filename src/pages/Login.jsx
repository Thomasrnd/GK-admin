import { useState } from 'react'
import { useAuth } from '../auth'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!username || !password) { setError('Isi username dan password'); return }
    setLoading(true); setError('')
    try {
      await login(username, password)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#fafafc',
    }}>
      <div style={{
        width: '360px', backgroundColor: 'white', border: '1px solid #f0f0f0',
        borderRadius: '16px', padding: '32px',
      }}>
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <img src="/logo-full.png" alt="Gudang Kartu" style={{ width: '110px', height: '110px', objectFit: 'contain', marginBottom: '10px' }} />
          <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.5px', color: '#0a0e1a' }}>GUDANG <span style={{ color: '#b8932e' }}>KARTU</span></div>
          <div style={{ fontSize: '13px', color: '#a1a1aa', marginTop: '2px' }}>Masuk untuk mengelola toko</div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="username"
            style={inputStyle}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '10px 14px', color: '#e11d48', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '11px', backgroundColor: '#0a0e1a', color: 'white',
            border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700',
            cursor: 'pointer', opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </div>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#52525b', marginBottom: '6px' }
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e4e4e7', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }