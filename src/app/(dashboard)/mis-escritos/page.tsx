'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Eye, FileText } from 'lucide-react';
import { MOCK_ARTICLES, STATUS_LABELS, CATEGORIES, Article, ArticleStatus } from '@/lib/mock-store';

export default function MisEscritosPage() {
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [filter, setFilter] = useState<ArticleStatus | 'todos'>('todos');

  const filteredArticles = filter === 'todos' 
    ? articles 
    : articles.filter(a => a.status === filter);

  const deleteArticle = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este escrito?')) {
      setArticles(articles.filter(a => a.id !== id));
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2rem',
            marginBottom: '0.5rem'
          }}>
            Mis Escritos
          </h1>
          <p style={{ color: 'var(--foreground-muted)' }}>
            Gestiona tus artículos y envíos
          </p>
        </div>
        <Link 
          href="/nuevo-envio"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '0.95rem'
          }}
        >
          <Plus size={20} />
          Nuevo Envío
        </Link>
      </header>

      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { value: 'todos', label: 'Todos' },
          { value: 'borrador', label: 'Borradores' },
          { value: 'revision', label: 'En Revisión' },
          { value: 'publicado', label: 'Publicados' },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value as ArticleStatus | 'todos')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '500',
              background: filter === value ? 'var(--foreground)' : 'var(--background-alt)',
              color: filter === value ? 'var(--background)' : 'var(--foreground)',
              border: '1px solid',
              borderColor: filter === value ? 'var(--foreground)' : 'var(--border)'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {filteredArticles.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--background-alt)',
          borderRadius: '12px',
          color: 'var(--foreground-muted)'
        }}>
          <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p style={{ fontSize: '1.1rem' }}>No tienes escritos en esta categoría</p>
          <Link 
            href="/nuevo-envio"
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              color: 'var(--primary)',
              fontWeight: '600'
            }}
          >
            Crear tu primer escrito
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {filteredArticles.map((article) => {
            const statusInfo = STATUS_LABELS[article.status];
            const category = CATEGORIES.find(c => c.value === article.category);
            
            return (
              <article 
                key={article.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 1.5rem',
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      background: statusInfo.color,
                      color: '#fff',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      borderRadius: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {statusInfo.label}
                    </span>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      background: 'var(--background-alt)',
                      color: 'var(--foreground-muted)',
                      fontSize: '0.7rem',
                      fontWeight: '500',
                      borderRadius: '4px'
                    }}>
                      {category?.label}
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '1.1rem',
                    marginBottom: '0.3rem'
                  }}>
                    {article.title}
                  </h3>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--foreground-muted)'
                  }}>
                    {article.excerpt}
                  </p>
                  <p style={{
                    fontSize: '0.8rem',
                    color: 'var(--foreground-muted)',
                    marginTop: '0.5rem'
                  }}>
                    Creado: {new Date(article.createdAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap'
                }}>
                  {article.status === 'publicado' && (
                    <button 
                      title="Ver publicación"
                      style={{
                        padding: '0.6rem',
                        background: 'var(--background-alt)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--foreground-muted)',
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={18} />
                    </button>
                  )}
                  {article.status === 'borrador' && (
                    <>
                      <Link 
                        href="/nuevo-envio"
                        title="Editar"
                        style={{
                          padding: '0.6rem',
                          background: 'var(--primary)',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button 
                        title="Eliminar"
                        onClick={() => deleteArticle(article.id)}
                        style={{
                          padding: '0.6rem',
                          background: '#FEE2E2',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#DC2626',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  {article.status === 'revision' && (
                    <span style={{
                      padding: '0.5rem 1rem',
                      color: 'var(--foreground-muted)',
                      fontSize: '0.8rem',
                      fontStyle: 'italic'
                    }}>
                      En espera de revisión
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
