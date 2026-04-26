'use client';

import { useState } from 'react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password && name) {
      setSuccess(true);
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
          <h2 style={{ fontSize: '1.8rem', letterSpacing: '-0.5px' }}>Únete a Literudo</h2>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Crea tu cuenta para empezar
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>¡Registro Exitoso!</h3>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Por favor, verifica tu bandeja de entrada para confirmar tu correo electrónico.
            </p>
            <button 
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '12px',
                background: 'var(--background-alt)',
                color: 'var(--foreground)',
                fontWeight: '600',
                border: '1px solid var(--border)',
                cursor: 'pointer'
              }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && (
              <div style={{ padding: '0.8rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label htmlFor="name" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground-muted)' }}>
                Nombre y Apellido
              </label>
              <input 
                id="name"
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Pérez" 
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
              <label htmlFor="register-email" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground-muted)' }}>
                Correo Electrónico
              </label>
              <input 
                id="register-email"
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
              <label htmlFor="register-password" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--foreground-muted)' }}>
                Contraseña
              </label>
              <input 
                id="register-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres" 
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
              {loading ? 'Registrando...' : 'Crear cuenta'}
            </button>
          </form>
        )}

        {!success && (
          <div style={{
            marginTop: '1rem',
            textAlign: 'center',
            fontSize: '0.95rem',
            color: 'var(--foreground-muted)'
          }}>
            ¿Ya tienes una cuenta? <button onClick={onSwitchToLogin} style={{
              color: 'var(--primary)',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              outline: 'none',
              cursor: 'pointer'
            }}>Inicia Sesión</button>
          </div>
        )}

      </div>
    </div>
  );
}
