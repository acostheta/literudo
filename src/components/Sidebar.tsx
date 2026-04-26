'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  Home, 
  BookOpen, 
  PenLine, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  FileText,
  User,
  Search
} from 'lucide-react';
import { MOCK_USER } from '@/lib/mock-store';

const publicNavItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/nuevo-envio', label: 'Enviar Escrito', icon: PenLine },
];

const categories = [
  { href: '/blog?cat=poesia', label: 'Poesía' },
  { href: '/blog?cat=cuento', label: 'Cuento' },
  { href: '/blog?cat=ensayo', label: 'Ensayo' },
  { href: '/blog?cat=cronica', label: 'Crónica' },
  { href: '/blog?cat=analisis', label: 'Análisis' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1100,
          padding: '0.6rem',
          background: 'var(--foreground)',
          color: 'var(--background)',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer'
        }}
        className="mobile-menu-btn"
      >
        {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <aside style={{
        width: '280px',
        minHeight: '100vh',
        background: 'var(--foreground)',
        color: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 100,
        transition: 'transform 0.3s ease',
      }} className="sidebar">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <BookOpen size={28} color="#FDFDFD" />
            <span style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.3rem',
              fontWeight: '700',
              color: '#FDFDFD'
            }}>
              Portal de Letras
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '10px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '700',
              fontSize: '1rem'
            }}>
              {MOCK_USER.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: '600', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {MOCK_USER.name}
              </p>
              <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>{MOCK_USER.career}</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          <div style={{ padding: '0 1rem', marginBottom: '0.5rem' }}>
            <p style={{ 
              fontSize: '0.7rem', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              opacity: 0.5,
              marginBottom: '0.75rem'
            }}>
              Navegación
            </p>
          </div>
          {publicNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === '/' && pathname.startsWith('/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.25rem',
                  margin: '0.1rem 0.75rem',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  borderRadius: '8px',
                  fontWeight: isActive ? '600' : '400',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}

          <div style={{ padding: '1.25rem 1rem 0.5rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ 
              fontSize: '0.7rem', 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              opacity: 0.5,
              marginBottom: '0.75rem'
            }}>
              Categorías
            </p>
          </div>
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.25rem',
                margin: '0.1rem 0.75rem',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: 'var(--accent)',
                opacity: 0.7
              }} />
              {cat.label}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link 
            href="/mis-escritos" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.9rem',
              borderRadius: '8px',
              marginBottom: '0.5rem'
            }}
          >
            <FileText size={18} />
            Mis Escritos
          </Link>
          <Link 
            href="/" 
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('user');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '0.9rem',
              borderRadius: '8px'
            }}
          >
            <LogOut size={18} />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 50,
            display: 'none'
          }}
          className="overlay-mobile"
        />
      )}

      <style jsx>{`
        @media (max-width: 900px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.mobile-open {
            transform: translateX(0);
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          .overlay-mobile {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
}
