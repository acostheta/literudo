export type ArticleStatus = 'borrador' | 'revision' | 'publicado';
export type ArticleCategory = 'poesia' | 'cuento' | 'ensayo' | 'cronica' | 'analisis';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  career: string;
  avatar?: string;
}

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Ana Lucía Torres',
  email: 'ana.torres@universidad.edu',
  career: 'Licenciatura en Literatura',
};

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'El eco de las aulas vacías',
    excerpt: 'Una reflexión sobre los espacios universitarios que guardan memoria collective.',
    content: 'Contenido del artículo...',
    category: 'ensayo',
    status: 'publicado',
    createdAt: '2026-03-15',
    updatedAt: '2026-03-16',
    authorId: 'user-1',
  },
  {
    id: '2',
    title: 'Poesía en bits: Cuando el código trova',
    excerpt: 'Explorando la intersección entre la escritura poética y la programación.',
    content: 'Contenido del artículo...',
    category: 'poesia',
    status: 'revision',
    createdAt: '2026-04-01',
    updatedAt: '2026-04-02',
    authorId: 'user-1',
  },
  {
    id: '3',
    title: 'Ensayo sobre la inteligencia artificial y la creatividad',
    excerpt: '¿Puede una máquina真正的 crear arte? Un análisis crítico.',
    content: 'Contenido del artículo...',
    category: 'analisis',
    status: 'borrador',
    createdAt: '2026-04-10',
    updatedAt: '2026-04-10',
    authorId: 'user-1',
  },
  {
    id: '4',
    title: 'Crónica de un martes lluvioso',
    excerpt: 'Las pequeñas historias que merecen ser contadas.',
    content: 'Contenido del artículo...',
    category: 'cronica',
    status: 'borrador',
    createdAt: '2026-04-12',
    updatedAt: '2026-04-12',
    authorId: 'user-1',
  },
];

export const CATEGORIES: { value: ArticleCategory; label: string }[] = [
  { value: 'poesia', label: 'Poesía' },
  { value: 'cuento', label: 'Cuento' },
  { value: 'ensayo', label: 'Ensayo' },
  { value: 'cronica', label: 'Crónica' },
  { value: 'analisis', label: 'Análisis' },
];

export const STATUS_LABELS: Record<ArticleStatus, { label: string; color: string }> = {
  borrador: { label: 'Borrador', color: '#64748B' },
  revision: { label: 'En Revisión', color: '#F59E0B' },
  publicado: { label: 'Publicado', color: '#10B981' },
};
