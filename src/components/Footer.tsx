export default function Footer() {
  return (
    <footer style={{
      background: 'var(--background-alt)',
      padding: '4rem 0 2rem',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '3rem',
        marginBottom: '4rem'
      }}>
        <div>
          <h3>Literudo Blog</h3>
          <p style={{
            color: 'var(--foreground-muted)',
            marginTop: '1rem',
            fontSize: '0.9rem'
          }}>Descubre la mejor literatura y reflexiones sobre el mundo.</p>
        </div>
        
        <div>
          <h4>Recursos</h4>
          <ul style={{
            marginTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            <li><a href="#" style={{ color: 'var(--foreground-muted)' }}>Blog</a></li>
            <li><a href="#" style={{ color: 'var(--foreground-muted)' }}>Autores</a></li>
            <li><a href="#" style={{ color: 'var(--foreground-muted)' }}>Tags</a></li>
          </ul>
        </div>

        <div>
           <h4>Redes Sociales</h4>
          <ul style={{
            marginTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            <li><a href="#" style={{ color: 'var(--foreground-muted)' }}>Twitter</a></li>
            <li><a href="#" style={{ color: 'var(--foreground-muted)' }}>Instagram</a></li>
            <li><a href="#" style={{ color: 'var(--foreground-muted)' }}>GitHub</a></li>
          </ul>
        </div>
      </div>
      
      <div className="container" style={{
        borderTop: '1px solid var(--border)',
        paddingTop: '2rem',
        textAlign: 'center',
        paddingBottom: '2rem'
      }}>
        <p style={{
          color: 'var(--foreground-muted)',
          fontSize: '0.85rem'
        }}>© {new Date().getFullYear()} Literudo Blog - Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
