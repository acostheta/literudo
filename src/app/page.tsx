import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';

const mockArticles = [
  {
    id: '1',
    title: 'La identidad latinoamericana en la poesía contemporánea',
    excerpt: 'Un análisis profundo sobre cómo los poetas actuales redefinen los límites de lo que significa ser latinoamericano a través de la literatura.',
    author: 'María Elena Vásquez',
    date: '12 Abr 2026',
    category: 'Análisis'
  },
  {
    id: '2',
    title: 'Café y篇小说: Historias cortas para leer en la pausa',
    excerpt: 'Una colección de microrrelatos que capturan momentos cotidianos con una intensidad literaria surprising.',
    author: 'Carlos Mendoza',
    date: '10 Abr 2026',
    category: 'Ficción'
  },
  {
    id: '3',
    title: 'El diario como género literario: Más allá de la introspección',
    excerpt: 'Exploramos cómo el formato del diario personal se ha convertido en una herramienta narrativa fundamental.',
    author: 'Ana Lucía Torres',
    date: '8 Abr 2026',
    category: 'Crónica'
  }
];

const featuredArticle = {
  id: 'featured',
  title: 'Memoria y olvido: La literatura como acto de resistencia',
  excerpt: 'En tiempos donde la información se desvanece, la literatura permanece como guardiana de nuestra memoria colectiva. Este ensayo explora cómo los escritores contemporáneos utilizan la palabra escrita como herramienta de preservación cultural.',
  author: 'Dr. Roberto Jiménez',
  date: '15 Abr 2026',
  category: 'Ensayo Destacado'
};

export default function HomePage() {
  return (
    <div className="animate-fade-in">
      <section style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        background: 'var(--background-alt)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            marginBottom: '1.5rem',
            letterSpacing: '-1px'
          }}>
            Donde las letras universitarias cobran vida
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--foreground-muted)',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: '1.8'
          }}>
            Un espacio dedicado a la difusión de la creación literaria, el pensamiento crítico y el arte de escribir desde las aulas universitarias.
          </p>
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link href="/blog" style={{
              padding: '0.8rem 1.5rem',
              background: 'var(--primary)',
              color: '#fff',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Explorar Escritos
            </Link>
            <Link href="/nuevo-envio" style={{
              padding: '0.8rem 1.5rem',
              background: 'transparent',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.95rem'
            }}>
              Enviar mi Texto
            </Link>
          </div>
        </div>
      </section>

      <section style={{ padding: '3rem 0' }}>
        <div className="container">
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.6rem',
            marginBottom: '1.5rem'
          }}>
            Destacado del Mes
          </h2>
          <ArticleCard {...featuredArticle} variant="featured" />
        </div>
      </section>

      <section style={{ padding: '2rem 0 4rem' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.6rem'
            }}>
              Últimas Publicaciones
            </h2>
            <Link href="/blog" style={{
              color: 'var(--primary)',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              Ver todas →
            </Link>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}>
            {mockArticles.map((article) => (
              <ArticleCard key={article.id} {...article} />
            ))}
          </div>
        </div>
      </section>

      <section style={{
        padding: '3rem 0',
        background: 'var(--primary)',
        color: '#fff',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1.8rem',
            marginBottom: '1rem',
            color: '#fff'
          }}>
            ¿Eres escritor universitario?
          </h2>
          <p style={{
            fontSize: '1rem',
            opacity: 0.9,
            maxWidth: '500px',
            margin: '0 auto 1.5rem'
          }}>
            Comparte tu voz con nuestra comunidad. Aceptamos poemas, cuentos, ensayos y más.
          </p>
          <Link href="/nuevo-envio" style={{
            display: 'inline-block',
            padding: '0.8rem 1.5rem',
            background: '#fff',
            color: 'var(--primary)',
            borderRadius: '6px',
            fontWeight: '700',
            fontSize: '0.95rem'
          }}>
            Conoce cómo enviar
          </Link>
        </div>
      </section>
    </div>
  );
}
