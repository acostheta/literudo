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

export default function Home() {
  return (
    <div className="container" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4rem'
    }}>
      <section className="animate-fade-in" style={{
         textAlign: 'center',
         padding: '4rem 0',
         display: 'flex',
         flexDirection: 'column',
         alignItems: 'center',
         gap: '1.5rem'
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          maxWidth: '900px',
          fontWeight: '900',
          letterSpacing: '-1.5px',
          marginBottom: '1rem'
        }}>
          Inspiración y <span style={{
             background: 'linear-gradient(to right, var(--primary), var(--secondary))',
             WebkitBackgroundClip: 'text',
             WebkitTextFillColor: 'transparent',
          }}>Literatura</span> en un solo lugar.
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--foreground-muted)',
          maxWidth: '650px',
          lineHeight: '1.6'
        }}>
          Explora reflexiones profundas, análisis literarios y historias que te transportarán a otros mundos.
        </p>
        
        <div style={{
          marginTop: '2rem',
          display: 'flex',
          gap: '1rem'
        }}>
          <button className="glass-effect" style={{
            padding: '1rem 2.5rem',
            borderRadius: '16px',
            background: 'var(--primary)',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.1rem',
            boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
          }}>Empezar a leer</button>
          
           <button className="glass-effect" style={{
            padding: '1rem 2.5rem',
            borderRadius: '16px',
            color: 'var(--foreground)',
            fontWeight: '600',
            fontSize: '1.1rem'
          }}>Conócenos</button>
        </div>
      </section>

      <section>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '3rem'
        }}>
          <div>
            <h2 style={{ fontSize: '2.5rem' }}>Últimas Entradas</h2>
            <p style={{ color: 'var(--foreground-muted)' }}>Lo más reciente en nuestro blog.</p>
          </div>
          <button style={{
             color: 'var(--primary)',
             fontWeight: '700',
             borderBottom: '2px solid var(--primary)'
          }}>Ver todas</button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          {SAMPLE_POSTS.map(post => (
            <PostCard key={post.slug} {...post} />
          ))}
        </div>
      </section>

      <section className="glass-effect" style={{
        marginTop: '4rem',
        padding: '5rem 2rem',
        borderRadius: '32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Únete a nuestra comunidad</h2>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--foreground-muted)',
          maxWidth: '550px',
          margin: '0 auto 3rem'
        }}>Recibe las mejores historias directamente en tu bandeja de entrada cada semana.</p>
        
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          display: 'flex',
          gap: '1rem'
        }}>
          <input type="email" placeholder="tu@email.com" style={{
            flex: 1,
            padding: '1rem 1.5rem',
            background: 'var(--glass)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            color: 'var(--foreground)',
            fontSize: '1rem'
          }} />
          <button className="glass-effect" style={{
             background: 'var(--primary)',
             color: 'white',
             padding: '0 2rem',
             borderRadius: '16px',
             fontWeight: '700'
          }}>Suscribirse</button>
        </div>
      </section>
    </div>
  );
}
