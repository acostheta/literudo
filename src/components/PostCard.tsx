'use client';

import Link from 'next/link';

interface PostCardProps {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  slug: string;
}

export default function PostCard({ title, excerpt, category, date, slug }: PostCardProps) {
  return (
    <article className="animate-fade-in glass-effect" style={{
      padding: '2rem',
      borderRadius: '24px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'var(--transition)',
      cursor: 'pointer'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem'
      }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--primary)',
          background: 'rgba(99, 102, 241, 0.1)',
          padding: '4px 12px',
          borderRadius: '20px'
        }}>{category}</span>
        
        <span style={{
          fontSize: '0.8rem',
          color: 'var(--foreground-muted)'
        }}>{date}</span>
      </div>
      
      <h3 style={{
        fontSize: '1.5rem',
        marginBottom: '1rem',
        fontWeight: '800'
      }}>{title}</h3>
      
      <p style={{
        color: 'var(--foreground-muted)',
        fontSize: '1rem',
        marginBottom: '2rem',
        display: '-webkit-box',
        WebkitLineClamp: '3',
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>{excerpt}</p>
      
      <Link href={`/posts/${slug}`} style={{
        marginTop: 'auto',
        color: 'var(--primary)',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        Leer Más 
        <svg fill="currentColor" width="16" height="16" viewBox="0 0 24 24"><path d="M11 2h2v20h-2zm-9 9h20v2H2z"/></svg>
      </Link>
    </article>
  );
}
