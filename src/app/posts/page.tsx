import PostCard from '@/components/PostCard';

const SAMPLE_POSTS = [
  {
    title: 'El Arte de la Brevedad en la Poesía Moderna',
    excerpt: '¿Cómo decir tanto en tan pocas palabras? Analizamos las tendencias actuales de la poesía minimalista.',
    category: 'Literatura',
    date: 'Marzo 20, 2026',
    slug: 'arte-brevedad-poesia'
  },
  {
    title: 'Realismo Mágico: Un Puente entre Realidad y Sueño',
    excerpt: 'Desde García Márquez hasta Isabel Allende, exploramos el género que definió la literatura latinoamericana.',
    category: 'Análisis',
    date: 'Marzo 18, 2026',
    slug: 'realismo-magico-puente'
  },
  {
    title: 'Café y Libros: La Combinación Perfecta',
    excerpt: '¿Por qué nos gusta tanto leer en cafeterías? Un viaje sensorial por los mejores rincones literarios.',
    category: 'Estilo de Vida',
    date: 'Marzo 15, 2026',
    slug: 'cafe-y-libros'
  }
];

export default function PostsPage() {
  return (
    <div className="container" style={{ padding: '4rem 0' }}>
      <header style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem' }}>Explorar Entradas</h1>
        <p style={{ color: 'var(--foreground-muted)' }}>Descubre todos nuestros artículos y reflexiones.</p>
      </header>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {SAMPLE_POSTS.map(post => (
          <PostCard key={post.slug} {...post} />
        ))}
      </div>
    </div>
  );
}
