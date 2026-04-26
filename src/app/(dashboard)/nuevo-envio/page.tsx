'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Send, Image as ImageIcon, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { CATEGORIES } from '@/lib/mock-store';

interface FormData {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
}

interface FormErrors {
  title?: string;
  category?: string;
  excerpt?: string;
  content?: string;
}

export default function NuevoEnvioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    coverImage: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length < 5) {
      newErrors.title = 'El título debe tener al menos 5 caracteres';
    }
    
    if (!formData.category) {
      newErrors.category = 'Selecciona una categoría';
    }
    
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'El resumen es requerido';
    } else if (formData.excerpt.length < 20) {
      newErrors.excerpt = 'El resumen debe tener al menos 20 caracteres';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es requerido';
    } else if (formData.content.length < 100) {
      newErrors.content = 'El contenido debe tener al menos 100 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = async () => {
    if (validate()) {
      setIsSubmitting(true);
      console.log('Guardando como borrador:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitting(false);
      alert('✓ Borrador guardado correctamente');
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    const confirmed = confirm(
      '¿Estás seguro de enviar tu escrito para revisión?\n\n' +
      'Una vez enviado, no podrás editarlo hasta que el admin lo revise.'
    );
    
    if (confirmed) {
      setIsSubmitting(true);
      console.log('Enviando para revisión:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, coverImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (submitSuccess) {
    return (
      <div className="animate-fade-in" style={{
        maxWidth: '600px',
        margin: '4rem auto',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#D1FAE5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <CheckCircle size={40} color="#10B981" />
        </div>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '2rem',
          marginBottom: '1rem'
        }}>
          ¡Envío exitoso!
        </h1>
        <p style={{
          color: 'var(--foreground-muted)',
          marginBottom: '2rem',
          lineHeight: '1.7'
        }}>
          Tu escrito ha sido enviado para revisión. El equipo editorial lo revisará pronto y te notificaremos cuando esté publicado.
        </p>
        <button
          onClick={() => router.push('/mis-escritos')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          Ver mis escritos
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => router.push('/mis-escritos')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--foreground-muted)',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}
        >
          <ArrowLeft size={18} />
          Volver a mis escritos
        </button>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '2rem',
          marginBottom: '0.5rem'
        }}>
          Nuevo Envío
        </h1>
        <p style={{ color: 'var(--foreground-muted)' }}>
          Crea y envía tu escrito para revisión
        </p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        gap: '2rem'
      }} className="form-grid">
        <div style={{
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Escribe un título evocador para tu escrito..."
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                border: `1px solid ${errors.title ? '#DC2626' : 'var(--border)'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'var(--background-alt)',
                color: 'var(--foreground)'
              }}
            />
            {errors.title && (
              <p style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={14} /> {errors.title}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Resumen *
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Un breve resumen que capture la esencia de tu escrito (20-200 caracteres)..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                border: `1px solid ${errors.excerpt ? '#DC2626' : 'var(--border)'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                background: 'var(--background-alt)',
                color: 'var(--foreground)',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            {errors.excerpt && (
              <p style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={14} /> {errors.excerpt}
              </p>
            )}
            <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginTop: '0.3rem' }}>
              {formData.excerpt.length}/200 caracteres
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Contenido * <span style={{ fontWeight: '400', color: 'var(--foreground-muted)' }}>(Markdown soportado)</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Escribe aquí tu escrito. Puedes usar Markdown para formatear..."
              rows={15}
              style={{
                width: '100%',
                padding: '0.85rem 1rem',
                border: `1px solid ${errors.content ? '#DC2626' : 'var(--border)'}`,
                borderRadius: '8px',
                fontSize: '0.95rem',
                background: 'var(--background-alt)',
                color: 'var(--foreground)',
                resize: 'vertical',
                fontFamily: 'var(--font-mono, monospace)',
                lineHeight: '1.7'
              }}
            />
            {errors.content && (
              <p style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={14} /> {errors.content}
              </p>
            )}
            <p style={{ fontSize: '0.8rem', color: 'var(--foreground-muted)', marginTop: '0.3rem' }}>
              {formData.content.length} caracteres
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Configuración</h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                Categoría *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: `1px solid ${errors.category ? '#DC2626' : 'var(--border)'}`,
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  background: 'var(--background-alt)',
                  color: 'var(--foreground)'
                }}
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && (
                <p style={{ color: '#DC2626', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                  {errors.category}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}>
                Imagen de portada
              </label>
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                border: '2px dashed var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'var(--transition)',
                background: formData.coverImage ? 'transparent' : 'var(--background-alt)'
              }}>
                {formData.coverImage ? (
                  <img 
                    src={formData.coverImage} 
                    alt="Preview" 
                    style={{ 
                      width: '100%', 
                      height: '150px', 
                      objectFit: 'cover',
                      borderRadius: '6px'
                    }} 
                  />
                ) : (
                  <>
                    <ImageIcon size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--foreground-muted)', textAlign: 'center' }}>
                      Clic para subir imagen
                    </p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <div style={{
            background: 'var(--background)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <button
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem',
                background: 'var(--background-alt)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <Save size={18} />
              Guardar como Borrador
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.85rem',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '0.95rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <Send size={18} />
              {isSubmitting ? 'Enviando...' : 'Enviar para Revisión'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
