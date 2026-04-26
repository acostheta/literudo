'use client';

import Link from 'next/link';
import { useState } from 'react';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';

export default function Navbar() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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
          <Link href="/blog" style={{
            color: 'var(--foreground-muted)',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}>
            Explorar
          </Link>
          
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
