'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="glass-effect" style={{
      position: 'sticky',
      top: 0,
      width: '100%',
      zIndex: 1000,
      padding: '1.2rem 0',
      transition: 'var(--transition)'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{
          fontSize: '1.6rem',
          fontWeight: '700',
          background: 'linear-gradient(to right, var(--primary), var(--secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>
          Literudo Blog
        </Link>
        
        <ul style={{
          display: 'flex',
          gap: '2.5rem',
          alignItems: 'center'
        }}>
          <li><Link href="/">Home</Link></li>
          <li><Link href="/posts">Explorar</Link></li>
          <li><button className="glass-effect" style={{
            padding: '0.6rem 1.4rem',
            borderRadius: '12px',
            color: 'var(--foreground)',
            fontWeight: '600'
          }}>Suscriberse</button></li>
        </ul>
      </div>
    </nav>
  );
}
