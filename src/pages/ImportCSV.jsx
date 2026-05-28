import { useState, useRef } from 'react'
import StatCard from '../components/StatCard'

const API = import.meta.env.VITE_API_URL

export default function ImportCSV() {
  const [preview, setPreview] = useState([])
  const [headers, setHeaders] = useState([])
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const handleFile = (f) => {
    setFile(f); setResult(null); setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const lines = e.target.result.split('\n').map(l => l.trim()).filter(Boolean)
      if (lines.length < 2) { setError('File CSV kosong atau hanya berisi header'); return }
      const heads = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
      const rows  = lines.slice(1, 6).map(line => line.split(',').map(c => c.replace(/"/g, '').trim()))
      setHeaders(heads)
      setPreview(rows)
    }
    reader.readAsText(f)
  }

  const handleImport = async () => {
    if (!file) return
    setImporting(true); setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res  = await fetch(`${API}/products/import`, { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data)
      setFile(null); setPreview([]); setHeaders([])
      if (fileRef.current) fileRef.current.value = ''
    } catch (e) {
      setError(e.message)
    } finally { setImporting(false) }
  }

  return (
    <div>
      <h1 style={titleStyle}>Import CSV</h1>

      <div style={{ maxWidth: '700px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        <div style={cardStyle}>
          <SectionTitle>Download template</SectionTitle>
          <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '12px' }}>
            Download template CSV, isi dengan data kartu, lalu upload kembali.
          </p>
          <a href={`${API}/products/template`} download style={downloadBtnStyle}>
            Download template.csv
          </a>
          <div style={codeStyle}>
            name,card_code,game,expansion,price,stock,image_url,is_newest<br />
            WarGreymon,ST1-001,Digimon,Starter Deck 1,180000,10,,true
          </div>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#a1a1aa' }}>
            <strong>Catatan kolom:</strong> name, game, expansion, price = wajib · card_code, stock, image_url, is_newest = opsional
          </div>
        </div>

        <div style={cardStyle}>
          <SectionTitle>Upload file CSV</SectionTitle>
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${file ? '#10b981' : '#e4e4e7'}`,
              borderRadius: '10px', padding: '32px',
              textAlign: 'center', cursor: 'pointer', backgroundColor: '#fafafa',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📄</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: file ? '#10b981' : '#18181b' }}>
              {file ? file.name : 'Drag & drop atau klik untuk pilih file'}
            </div>
            <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px' }}>Format: .csv</div>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} style={{ display: 'none' }} />
        </div>

        {preview.length > 0 && (
          <div style={cardStyle}>
            <SectionTitle>Preview (5 baris pertama)</SectionTitle>
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table>
                <thead>
                  <tr>{headers.map(h => <th key={h} style={{ whiteSpace: 'nowrap' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cell || <span style={{ color: '#d4d4d8' }}>—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handleImport} disabled={importing} style={importBtnStyle}>
              {importing ? 'Mengimport...' : `Import ${file?.name}`}
            </button>
          </div>
        )}

        {error && (
          <div style={{ backgroundColor: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', padding: '12px 16px', color: '#e11d48', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#15803d', marginBottom: '14px' }}>Import selesai!</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: result.errors?.length ? '14px' : 0 }}>
              <StatCard label="Produk baru"  value={result.success} />
              <StatCard label="Diupdate"     value={result.updated} />
              <StatCard label="Error"        value={result.errors?.length ?? 0} />
            </div>
            {result.errors?.length > 0 && (
              <div style={{ backgroundColor: '#fff1f2', borderRadius: '8px', padding: '10px 14px' }}>
                {result.errors.map((e, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#e11d48' }}>Baris {e.row}: {e.reason}</div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h3 style={{ fontSize: '12px', fontWeight: '700', color: '#3f3f46', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>{children}</h3>
}

const titleStyle      = { fontSize: '22px', fontWeight: '800', marginBottom: '24px' }
const cardStyle       = { backgroundColor: 'white', border: '1px solid #f0f0f0', borderRadius: '12px', padding: '20px' }
const codeStyle       = { marginTop: '14px', backgroundColor: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '11px', color: '#71717a', lineHeight: '1.8' }
const downloadBtnStyle = { display: 'inline-block', padding: '8px 16px', backgroundColor: '#18181b', color: 'white', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', fontWeight: '600' }
const importBtnStyle  = { width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700' }