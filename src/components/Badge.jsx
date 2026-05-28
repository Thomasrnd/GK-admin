const STATUS_COLORS = {
  pending:    { bg: '#FAEEDA', color: '#633806' },
  dikemas:    { bg: '#E6F1FB', color: '#0C447C' },
  dikirim:    { bg: '#EEEDFE', color: '#3C3489' },
  selesai:    { bg: '#EAF3DE', color: '#27500A' },
  dibatalkan: { bg: '#FCEBEB', color: '#791F1F' },
}

export default function Badge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f4f4f5', color: '#52525b' }
  return (
    <span style={{
      backgroundColor: s.bg, color: s.color,
      padding: '2px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: '600',
    }}>
      {status}
    </span>
  )
}