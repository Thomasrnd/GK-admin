const STATUS_COLORS = {
  menunggu_pembayaran:  { bg: '#FAEEDA', color: '#633806', label: 'menunggu pembayaran' },
  menunggu_konfirmasi:  { bg: '#FDF2D0', color: '#7A5A06', label: 'menunggu konfirmasi' },
  diproses:             { bg: '#E6F1FB', color: '#0C447C', label: 'diproses' },
  dikirim:              { bg: '#EEEDFE', color: '#3C3489', label: 'dikirim' },
  selesai:              { bg: '#EAF3DE', color: '#27500A', label: 'selesai' },
  dibatalkan:           { bg: '#FCEBEB', color: '#791F1F', label: 'dibatalkan' },
}

export default function Badge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f4f4f5', color: '#52525b', label: status }
  return (
    <span style={{
      backgroundColor: s.bg, color: s.color,
      padding: '2px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}