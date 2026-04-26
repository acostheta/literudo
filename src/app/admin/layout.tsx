import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--background)',
      color: 'var(--foreground)'
    }}>
      {/* Sidebar */}
      <aside className="glass-effect" style={{
        width: '260px',
        borderRight: '1px solid var(--border)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{
          fontSize: '1.4rem',
          fontWeight: '700',
          background: 'linear-gradient(to right, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          Literudo Admin
        </div>

        <nav style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.8rem'
        }}>
          <Link href="/admin" style={{
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            fontWeight: '600',
            background: 'var(--glass-border)',
            color: 'var(--foreground)'
          }}>
            Dashboard
          </Link>
          <Link href="/admin/posts" style={{
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            fontWeight: '500',
            color: 'var(--foreground-muted)'
          }}>
            Entradas
          </Link>
           <Link href="/admin/users" style={{
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            fontWeight: '500',
            color: 'var(--foreground-muted)'
          }}>
            Usuarios
          </Link>
           <Link href="/admin/settings" style={{
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            fontWeight: '500',
            color: 'var(--foreground-muted)'
          }}>
            Ajustes
          </Link>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <Link href="/" style={{
            display: 'block',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            fontWeight: '600',
            textAlign: 'center',
            border: '1px solid var(--border)',
            color: 'var(--foreground-muted)'
          }}>
            ← Volver al Blog
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        padding: '3rem 4rem',
        minWidth: 0 // Prevents grid/flex overflows
      }}>
        {children}
      </main>
    </div>
  );
}
