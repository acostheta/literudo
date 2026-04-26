'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { 
  FileText, 
  PenLine, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  BookOpen
} from 'lucide-react';
import { MOCK_USER } from '@/lib/mock-store';

const navItems = [
  { href: '/mis-escritos', label: 'Mis Escritos', icon: FileText },
  { href: '/nuevo-envio', label: 'Nuevo Envío', icon: PenLine },
  { href: '#', label: 'Configuración', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
      <aside style={{
        width: '260px',
        background: 'var(--foreground)',
        color: 'var(--background)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        transition: 'transform 0.3s ease',
        transform: sidebarOpen ? 'translateX(0)' : undefined,
      }} className="sidebar">
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem'
          }}>
            <BookOpen size={28} color="#FDFDFD" />
            <span style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.2rem',
              fontWeight: '700'
            }}>
              Portal de Letras
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>
              {MOCK_USER.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p style={{ fontWeight: '600', fontSize: '0.95rem' }}>{MOCK_USER.name}</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{MOCK_USER.career}</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1.5rem',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                  background: isActive ? 'var(--primary)' : 'transparent',
                  fontWeight: isActive ? '600' : '400',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link 
            href="/" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 0',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.9rem'
            }}
          >
            <LogOut size={20} />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 200,
          padding: '0.5rem',
          background: 'var(--foreground)',
          color: 'var(--background)',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer'
        }}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 50
          }}
        />
      )}

      <main style={{
        flex: 1,
        marginLeft: '260px',
        padding: '2rem'
      }} className="main-content">
        {children}
      </main>

      <style jsx>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .mobile-menu-btn {
            display: block !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding-top: 4rem !important;
          }
        }
      `}</style>
    </div>
  );
}
