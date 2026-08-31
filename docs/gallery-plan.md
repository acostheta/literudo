# Plan de Implementación: Post de Fotografía

## Resumen de Decisiones

| Decisión | Elección |
|----------|----------|
| Estructura | Tabla separada `gallery_posts` en Supabase |
| Subida de imágenes | Supabase Storage bucket `gallery` |
| Permisos | Todos los usuarios registrados |
| Layout público | Grid masonry ( Pinterest) |
| Límite de imágenes | Sin límite |

---

## 1. Base de Datos

### 1.1. Nueva tabla `gallery_posts`

```sql
CREATE TABLE gallery_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador', 'publicado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.2. Tabla `gallery_images`

```sql
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_post_id UUID REFERENCES gallery_posts(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.3. RLS Policies

```sql
-- Lectura pública para posts publicados
ALTER TABLE gallery_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery posts public read" ON gallery_posts
  FOR SELECT USING (status = 'publicado');

CREATE POLICY "Gallery posts author insert" ON gallery_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Gallery posts author update" ON gallery_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Gallery posts author delete" ON gallery_posts
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Gallery images public read" ON gallery_images
  FOR SELECT USING (true);

CREATE POLICY "Gallery images author insert" ON gallery_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM gallery_posts
      WHERE id = gallery_post_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "Gallery images author delete" ON gallery_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM gallery_posts
      WHERE id = gallery_post_id AND author_id = auth.uid()
    )
  );
```

### 1.4. Storage Bucket

- Bucket: `gallery`
- Público: sí (lectura)
- Límite de archivo: 10 MB por imagen
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- Ruta: `{user_id}/{gallery_post_id}/{filename}`

---

## 2. Tipos TypeScript

Archivo: `src/lib/types/gallery.ts`

```ts
export interface GalleryPost {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  author_id: string;
  status: 'borrador' | 'publicado';
  created_at: string;
  updated_at: string;
  profiles?: { name: string; avatar_url?: string } | null;
  gallery_images?: GalleryImage[];
}

export interface GalleryImage {
  id: string;
  gallery_post_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}
```

---

## 3. Panel de Admin

### 3.1. Lista de galerías

Archivo: `src/app/admin/gallery/page.tsx`

- Tabla con columnas: Título, Autor, Imágenes (count), Estado, Fecha, Acciones
- Toggle de estado inline (borrador/publicado) — mismo patrón que `admin/posts/page.tsx`
- Acciones: Ver, Editar, Eliminar
- Admin ve todas; usuario normal solo las suyas

### 3.2. Crear nueva galería

Archivo: `src/app/admin/gallery/new/page.tsx`

- Formulario con campos:
  - **Título** (obligatorio)
  - **Descripción** (opcional, textarea)
  - **Imágenes** — zona de drag & drop + botón "Agregar imágenes"
    - Upload a Supabase Storage bucket `gallery`
    - Preview de imágenes subidas con opción de reordenar (drag) y eliminar
    - Cada imagen tiene campo opcional "Pie de foto"
    - Sin límite de cantidad
  - **Estado** — borrador / publicado
- Botón "Guardar" → inserta en `gallery_posts` + `gallery_images`

### 3.3. Editar galería

Archivo: `src/app/admin/gallery/edit/[id]/page.tsx`

- Mismo formulario que crear, pero precarga datos existentes
- Permite agregar/quitar/reordenar imágenes
- Las imágenes eliminadas se borran de Storage

### 3.4. Detalle de galería (preview)

Archivo: `src/app/admin/gallery/[slug]/page.tsx`

- Muestra la galería con layout masonry (preview del admin)
- Toggle publicar/draft
- Link a editar

### 3.5. Navegación del admin

- Añadir sección "Galería" al sidebar de `src/app/admin/layout.tsx`
- Icono: `Image` de lucide-react

---

## 4. Vistas Públicas

### 4.1. Listado de galerías

Archivo: `src/app/gallery/page.tsx`

- Grid masonry de galerías publicadas
- Cada tarjeta muestra: imagen principal (primera del orden), título, autor, fecha
- Enlace a `/gallery/[slug]`

### 4.2. Detalle de galería

Archivo: `src/app/gallery/[slug]/page.tsx`

- Título + descripción + autor + fecha
- Grid masonry de todas las imágenes con pies de foto
- Imágenes a tamaño completo, responsive

### 4.3. Componente Masonry

Archivo: `src/components/MasonryGrid.tsx`

- Grid masonry pura CSS (column-count + column-gap) — sin dependencias externas
- Responsive: 1 col (mobile), 2 col (tablet), 3-4 col (desktop)
- Props: `images: GalleryImage[]`, `onImageClick?`

---

## 5. Navegación Pública

- Añadir "Galería" al navbar (`src/components/Navbar.tsx`)
- Añadir "Galería" al sidebar del dashboard (`src/components/Sidebar.tsx`)

---

## 6. Archivos a Modificar/Crear

### Nuevos
| Archivo | Descripción |
|---------|-------------|
| `src/lib/types/gallery.ts` | Tipos TypeScript |
| `src/app/admin/gallery/page.tsx` | Lista admin de galerías |
| `src/app/admin/gallery/new/page.tsx` | Formulario crear galería |
| `src/app/admin/gallery/edit/[id]/page.tsx` | Formulario editar galería |
| `src/app/admin/gallery/[slug]/page.tsx` | Preview admin |
| `src/app/gallery/page.tsx` | Listado público |
| `src/app/gallery/[slug]/page.tsx` | Detalle público |
| `src/components/MasonryGrid.tsx` | Componente grid masonry |
| `src/components/admin/GalleryForm.tsx` | Formulario reutilizable de galería |
| `docs/gallery-schema.sql` | SQL de la nueva tabla + policies + bucket |

### A modificar
| Archivo | Cambio |
|---------|--------|
| `src/app/admin/layout.tsx` | Añadir sección "Galería" al sidebar |
| `src/components/Navbar.tsx` | Añadir link "Galería" |
| `src/components/Sidebar.tsx` | Añadir link "Galería" al dashboard |
| `schema.sql` | Añadir tablas `gallery_posts` y `gallery_images` |

---

## 7. Orden de Ejecución

1. **SQL**: Crear tablas, policies, y bucket en Supabase
2. **Tipos**: `src/lib/types/gallery.ts`
3. **Componente MasonryGrid**: `src/components/MasonryGrid.tsx`
4. **Componente GalleryForm**: `src/components/admin/GalleryForm.tsx`
5. **Admin CRUD**: pages new, edit, [slug], list
6. **Admin layout**: Añadir link al sidebar
7. **Público**: pages gallery/list, gallery/[slug]
8. **Navegación pública**: Navbar + Sidebar
9. **Tests manuales**: crear galería, subir imágenes, verificar layout

---

## 8. Dependencias Externas

Ninguna nueva. El grid masonry se implementa con CSS puro. Para futuras mejoras se puede considerar:
- `react-masonry-css` (si se quiere más control)
- Lightbox (`react-lightbox` o `yet-another-react-lightbox`)
