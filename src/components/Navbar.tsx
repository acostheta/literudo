'use client';

import Link from 'next/link';
import { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import NavDrawer from './NavDrawer';
import { Menu as MenuIcon } from '@mui/icons-material';

export default function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const openRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  return (
    <>
      <nav style={{
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 900,
        background: 'var(--background)',
        borderBottom: '1px solid var(--border)',
        padding: '1rem 2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                color: 'var(--foreground-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <MenuIcon />
            </button>
            <Link href="/" style={{
              color: 'var(--foreground)',
              fontSize: '1rem',
              fontWeight: '700',
              fontFamily: 'var(--font-lora)',
              textDecoration: 'none',
              letterSpacing: -0.5,
            }}>
              Literudo
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link href="/posts" style={{
              color: 'var(--foreground-muted)',
              fontSize: '0.9rem',
              fontWeight: '500',
              textDecoration: 'none'
            }}>
              Artículos
            </Link>
            <Link href="/gallery" style={{
              color: 'var(--foreground-muted)',
              fontSize: '0.9rem',
              fontWeight: '500',
              textDecoration: 'none'
            }}>
              Galería
            </Link>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <button 
              onClick={openLogin}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: 'var(--foreground-muted)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '500'
              }}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={openRegister}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--primary)',
                color: '#fff',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}
            >
              Registrarse
            </button>
          </div>
        </div>
      </nav>

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSwitchToRegister={openRegister}
      />
      
      <RegisterModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={openLogin}
      />
    </>
  );
}
