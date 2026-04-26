'use client';

import { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      setEmail('');
      setPassword('');
      onClose();
    } else {
      setError("Completa todos los campos");
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
      padding: '1.5rem'
    }} onClick={onClose}>
      
      <div 
        className="animate-fade-in glass-effect" 
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem 2rem',
          borderRadius: '28px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '1.2rem',
            background: 'var(--glass-border)',
            border: 'none',
            color: 'var(--foreground-muted)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.2rem',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          aria-label="Cerrar modal"
        >
          ×
        </button>

        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>Bienvenido de nuevo</h2>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Inicia sesión en Literudo Blog
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor="email" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground-muted)' }}>
              Correo Electrónico
            </label>
            <input 
              id="email"
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com" 
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                background: 'var(--background)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                color: 'var(--foreground)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'var(--transition)'
              }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label htmlFor="password" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground-muted)' }}>
                Contraseña
              </label>
              <button type="button" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <input 
              id="password"
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                background: 'var(--background)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                color: 'var(--foreground)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'var(--transition)'
              }} 
            />
          </div>

          <button type="submit" disabled={loading} style={{
            marginTop: '0.5rem',
            width: '100%',
            padding: '0.9rem',
            borderRadius: '12px',
            background: 'var(--primary)',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.05rem',
            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'var(--transition)'
          }}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{
          marginTop: '1rem',
          textAlign: 'center',
          fontSize: '0.95rem',
          color: 'var(--foreground-muted)'
        }}>
          ¿No tienes una cuenta? <button onClick={onSwitchToRegister} style={{
            color: 'var(--primary)',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            outline: 'none',
            cursor: 'pointer'
          }}>Regístrate aquí</button>
        </div>

      </div>
    </div>
  );
}
