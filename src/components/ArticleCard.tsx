import Link from 'next/link';

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  image?: string;
  variant?: 'default' | 'featured';
}

export default function ArticleCard({
  title,
  excerpt,
  author,
  date,
  category,
  image,
  variant = 'default'
}: ArticleCardProps) {
  if (variant === 'featured') {
    return (
      <article style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2.5rem',
        background: 'var(--background-alt)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'var(--card-shadow)'
      }} className="featured-card">
        <div style={{
          height: '100%',
          minHeight: '320px',
          background: image ? `url(${image}) center/cover` : 'var(--foreground-muted)'
        }} />
        <div style={{
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <span style={{
            display: 'inline-block',
            padding: '0.3rem 0.8rem',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            borderRadius: '4px',
            marginBottom: '1rem',
            width: 'fit-content'
          }}>
            {category}
          </span>
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.8rem',
            marginBottom: '1rem',
            lineHeight: '1.3'
          }}>
            {title}
          </h2>
          <p style={{
            color: 'var(--foreground-muted)',
            marginBottom: '1.5rem',
            lineHeight: '1.7'
          }}>
            {excerpt}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <span style={{ color: 'var(--foreground)', fontWeight: '500' }}>{author}</span>
            <span style={{ color: 'var(--foreground-muted)' }}>•</span>
            <span style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>{date}</span>
          </div>
          <Link href="#" style={{
            display: 'inline-block',
            padding: '0.7rem 1.5rem',
            background: 'var(--primary)',
            color: '#fff',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '0.9rem',
            width: 'fit-content'
          }}>
            Leer más
          </Link>
        </div>
        <style jsx>{`
          @media (max-width: 768px) {
            .featured-card {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </article>
    );
  }

  return (
    <article style={{
      background: 'var(--background)',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: 'var(--card-shadow)',
      border: '1px solid var(--border)',
      transition: 'var(--transition)'
    }} className="article-card">
      <div style={{
        height: '180px',
        background: image ? `url(${image}) center/cover` : 'linear-gradient(135deg, var(--foreground-muted) 0%, var(--primary) 100%)'
      }} />
      <div style={{ padding: '1.5rem' }}>
        <span style={{
          display: 'inline-block',
          padding: '0.25rem 0.6rem',
          background: 'var(--background-alt)',
          color: 'var(--primary)',
          fontSize: '0.7rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          borderRadius: '4px',
          marginBottom: '0.8rem'
        }}>
          {category}
        </span>
        <h3 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.2rem',
          marginBottom: '0.8rem',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {title}
        </h3>
        <p style={{
          color: 'var(--foreground-muted)',
          fontSize: '0.9rem',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {excerpt}
        </p>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.85rem'
        }}>
          <span style={{ color: 'var(--foreground)' }}>{author}</span>
          <span style={{ color: 'var(--foreground-muted)' }}>{date}</span>
        </div>
      </div>
      <style jsx>{`
        .article-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow);
        }
      `}</style>
    </article>
  );
}
