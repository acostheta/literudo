import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--foreground)',
      color: 'var(--background)',
      padding: '4rem 0 2rem',
      marginTop: 'auto'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '3rem',
        marginBottom: '3rem'
      }}>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.3rem',
            marginBottom: '1rem',
            color: 'var(--background)'
          }}>
            Portal de Letras
          </h3>
          <p style={{
            color: 'var(--foreground-muted)',
            fontSize: '0.9rem',
            lineHeight: '1.6'
          }}>
            Espacio dedicado a la difusión de la creación literaria universitaria.
          </p>
        </div>
        
        <div>
          <h4 style={{
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '1rem',
            color: 'var(--foreground-muted)'
          }}>Navegación</h4>
          <ul style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem'
          }}>
            <li>
              <Link href="/" style={{ color: 'var(--background)', fontSize: '0.95rem' }}>
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/blog" style={{ color: 'var(--background)', fontSize: '0.95rem' }}>
                Blog
              </Link>
            </li>
            <li>
              <Link href="/blog" style={{ color: 'var(--background)', fontSize: '0.95rem' }}>
                Categorías
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '1rem',
            color: 'var(--foreground-muted)'
          }}>Institucional</h4>
          <ul style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.7rem'
          }}>
            <li>
              <a href="#" style={{ color: 'var(--background)', fontSize: '0.95rem' }}>
                Acerca de
              </a>
            </li>
            <li>
              <a href="#" style={{ color: 'var(--background)', fontSize: '0.95rem' }}>
                Envíos
              </a>
            </li>
            <li>
              <a href="#" style={{ color: 'var(--background)', fontSize: '0.95rem' }}>
                Contacto
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{
            fontSize: '0.85rem',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '1rem',
            color: 'var(--foreground-muted)'
          }}>Síguenos</h4>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#" aria-label="Twitter" style={{ color: 'var(--background)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" aria-label="Instagram" style={{ color: 'var(--background)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
          </div>
        </div>
      </div>
      
      <div className="container" style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '1.5rem',
        textAlign: 'center'
      }}>
        <p style={{
          color: 'var(--foreground-muted)',
          fontSize: '0.85rem'
        }}>
          © {new Date().getFullYear()} Portal de Letras - Universidad. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
