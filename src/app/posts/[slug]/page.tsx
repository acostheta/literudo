'use client';

import { useParams } from 'next/navigation';

const POST_CONTENT = {
  'arte-brevedad-poesia': {
    title: 'El Arte de la Brevedad en la Poesía Moderna',
    category: 'Literatura',
    date: 'Marzo 20, 2026',
    content: `
      La poesía moderna ha experimentado un giro hacia el minimalismo...
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
      Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    `
  },
  'realismo-magico-puente': {
     title: 'Realismo Mágico: Un Puente entre Realidad y Sueño',
     category: 'Análisis',
     date: 'Marzo 18, 2026',
     content: `
      El realismo mágico no es una fantasía, es una forma de ver la realidad...
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    `
  },
  'cafe-y-libros': {
     title: 'Café y Libros: La Combinación Perfecta',
     category: 'Estilo de Vida',
     date: 'Marzo 15, 2026',
     content: `
      No hay nada como el aroma del café recién hecho y el olor a libro nuevo...
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    `
  }
};

export default function PostPage() {
  const { slug } = useParams();
  const post = POST_CONTENT[slug as keyof typeof POST_CONTENT] || POST_CONTENT['arte-brevedad-poesia'];

  return (
    <article className="container animate-fade-in" style={{
      maxWidth: '800px',
      padding: '4rem 1.5rem',
       display: 'flex',
       flexDirection: 'column',
       gap: '2.5rem'
    }}>
      <header>
        <span style={{
           fontSize: '0.9rem',
           fontWeight: '800',
           color: 'var(--primary)',
           textTransform: 'uppercase',
           marginBottom: '1rem',
           display: 'block'
        }}>{post.category}</span>
        
        <h1 style={{
           fontSize: 'clamp(2rem, 6vw, 3.5rem)',
           lineHeight: '1.1',
           letterSpacing: '-1px',
           marginBottom: '1.5rem'
        }}>{post.title}</h1>
        
        <div style={{
           display: 'flex',
           alignItems: 'center',
           gap: '1rem',
           color: 'var(--foreground-muted)'
        }}>
          <div style={{
             width: '40px',
             height: '40px',
             borderRadius: '50%',
             background: 'var(--background-alt)',
             border: '1px solid var(--border)'
          }}></div>
          <div>
            <span style={{ fontWeight: '600', color: 'var(--foreground)' }}>Redacción Literudo</span>
            <span style={{ display: 'block', fontSize: '0.85rem' }}>Publicado el {post.date}</span>
          </div>
        </div>
      </header>
      
      <div className="glass-effect" style={{
         borderRadius: '32px',
         overflow: 'hidden',
         aspectRatio: '16/9',
         background: 'linear-gradient(45deg, var(--background-alt), var(--glass))'
      }}></div>

      <div style={{
         fontSize: '1.2rem',
         lineHeight: '1.8',
         color: 'rgba(255, 255, 255, 0.85)',
         display: 'flex',
         flexDirection: 'column',
         gap: '2rem'
      }}>
         {post.content.split('\n').map((para, i) => para.trim() && <p key={i}>{para.trim()}</p>)}
      </div>
    </article>
  );
}
