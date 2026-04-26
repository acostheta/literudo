export default function AdminDashboard() {
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <header>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Dashboard</h1>
        <p style={{ color: 'var(--foreground-muted)' }}>Bienvenido al panel de administración de Literudo.</p>
      </header>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem'
      }}>
        {[
          { label: 'Total Entradas', value: '24', trend: '+3 este mes' },
          { label: 'Visitas hoy', value: '1,245', trend: '+12% vs ayer' },
          { label: 'Suscriptores', value: '3,892', trend: '+124 este mes' },
        ].map((stat, i) => (
          <div key={i} className="glass-effect" style={{
            padding: '2rem',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--foreground-muted)', fontWeight: '500' }}>{stat.label}</h3>
            <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>{stat.value}</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--primary)', fontWeight: '600' }}>{stat.trend}</span>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <section className="glass-effect" style={{
        padding: '2.5rem',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Actividad Reciente</h2>
          <button style={{
            color: 'var(--primary)',
            fontWeight: '600'
          }}>Ver toda</button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { action: 'Nueva entrada publicada', item: '"El Arte de la Brevedad"', time: 'Hace 2 horas' },
            { action: 'Nuevo suscriptor añadido', item: 'juan.perez@email.com', time: 'Hace 5 horas' },
            { action: 'Borrador actualizado', item: '"Realismo Mágico: Un Puente"', time: 'Ayer' },
          ].map((activity, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.5rem',
              background: 'var(--background-alt)',
              borderRadius: '16px',
              border: '1px solid var(--glass-border)'
            }}>
              <div>
                <p style={{ fontWeight: '600', marginBottom: '0.3rem' }}>{activity.action}</p>
                <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>{activity.item}</p>
              </div>
              <span style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>{activity.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
