export default function StatCard({ label, value, sub, subColor }) {
  return (
    <div style={{
      backgroundColor: 'white', border: '1px solid #f0f0f0',
      borderRadius: '12px', padding: '16px 20px',
    }}>
      <div style={{ fontSize: '12px', color: '#a1a1aa', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: '800', color: '#18181b' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: subColor || '#a1a1aa', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}