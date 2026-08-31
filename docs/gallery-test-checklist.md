# Checklist de Pruebas — Gallery

## Base de Datos

- [ ] Tabla `gallery_posts` existe
- [ ] Tabla `gallery_images` existe
- [ ] Columnas de `gallery_posts`: id, slug, title, description, author_id, status, created_at, updated_at
- [ ] Columnas de `gallery_images`: id, gallery_post_id, image_url, caption, sort_order, created_at
- [ ] Foreign key `gallery_images.gallery_post_id` → `gallery_posts.id` (ON DELETE CASCADE)
- [ ] Foreign key `gallery_posts.author_id` → `auth.users(id)`
- [ ] CHECK constraint: status IN ('borrador', 'publicado')

## RLS Policies

- [ ] `gallery_posts`: SELECT público solo para status='publicado'
- [ ] `gallery_posts`: INSERT solo el autor (auth.uid() = author_id)
- [ ] `gallery_posts`: UPDATE solo el autor
- [ ] `gallery_posts`: DELETE solo el autor
- [ ] `gallery_images`: SELECT público para todos
- [ ] `gallery_images`: INSERT solo si posee el post padre
- [ ] `gallery_images`: DELETE solo si posee el post padre

## Storage

- [ ] Bucket `gallery` existe
- [ ] Bucket es público (lectura sin auth)
- [ ] Límite de archivo: 10 MB
- [ ] MIME types permitidos: image/jpeg, image/png, image/webp, image/gif

## Panel Admin — CRUD

### Lista de galerías (`/admin/gallery`)
- [ ] Muestra tabla con columnas: Título, Autor, Imágenes, Estado, Fecha, Acciones
- [ ] Admin ve todas las galerías
- [ ] Usuario normal solo ve las suyas
- [ ] Botón "Nueva Galería" funciona
- [ ] Click en fila navega al detalle
- [ ] Toggle de estado (borrador/publicado) funciona
- [ ] Botón ver navega al detalle
- [ ] Botón editar navega al formulario
- [ ] Botón eliminar muestra confirmación y borra

### Crear galería (`/admin/gallery/new`)
- [ ] Formulario muestra campos: Título, Descripción
- [ ] Slug se genera automáticamente al escribir título
- [ ] Preview de slug visible ("literudo.com/gallery/...")
- [ ] Botón "Agregar imágenes" abre selector de archivos
- [ ] Imágenes seleccionadas muestran preview
- [ ] Se puede agregar pie de foto a cada imagen
- [ ] Se puede eliminar imagen antes de subir
- [ ] Imágenes se suben a Supabase Storage bucket `gallery`
- [ ] Progress indicator durante subida
- [ ] Botón "Crear Galería" guarda en `gallery_posts` + `gallery_images`
- [ ] Redirige a `/admin/gallery` al guardar
- [ ] Validación: título obligatorio

### Editar galería (`/admin/gallery/edit/[id]`)
- [ ] Carga datos existentes (título, descripción, imágenes, estado)
- [ ] Muestra imágenes existentes con preview
- [ ] Se pueden agregar nuevas imágenes
- [ ] Se pueden eliminar imágenes existentes (borra de Storage)
- [ ] Se puede editar pie de foto de imágenes existentes
- [ ] Botón "Guardar Cambios" actualiza en BD
- [ ] Redirige a `/admin/gallery` al guardar

### Detalle/Preview (`/admin/gallery/[slug]`)
- [ ] Muestra título, descripción, autor, fecha
- [ ] Grid masonry con todas las imágenes
- [ ] Pies de foto visibles
- [ ] Botón toggle publicar/borrador funciona
- [ ] Botón "Editar" navega al formulario
- [ ] Botón volver funciona

## Vistas Públicas

### Listado (`/gallery`)
- [ ] Muestra galerías publicadas en grid
- [ ] Cada tarjeta muestra: imagen cover, título, autor, cantidad de fotos
- [ ] Click navega al detalle
- [ ] Galerías en borrador NO aparecen
- [ ] Layout responsive (1-4 columnas según ancho)

### Detalle (`/gallery/[slug]`)
- [ ] Muestra título, descripción, autor, fecha
- [ ] Grid masonry con todas las imágenes
- [ ] Pies de foto visibles
- [ ] Imágenes a tamaño completo
- [ ] Link "Volver a la galería" funciona
- [ ] Galerías en borrador retornan 404

## Componente MasonryGrid

- [ ] Layout masonry funciona (columnas de altura variable)
- [ ] Responsive: 1 col (mobile), 2 col (tablet), 3 col (desktop), 4 col (wide)
- [ ] Imágenes cargan con lazy loading
- [ ] Transición de opacidad al cargar
- [ ] Pies de foto se muestran debajo de cada imagen
- [ ] Estado vacío muestra mensaje

## Navegación

- [ ] Navbar muestra link "Galería"
- [ ] Sidebar del dashboard muestra link "Galería"
- [ ] Admin sidebar muestra sección "Galería" con icono
- [ ] Links navegan correctamente

## Edge Cases

- [ ] Crear galería sin imágenes → muestra "No hay imágenes"
- [ ] Eliminar galería → elimina imágenes asociadas (CASCADE)
- [ ] Subir imagen > 10MB → error controlado
- [ ] Subir archivo no imagen → error controlado
- [ ] Slug duplicado → error controlado
- [ ] Usuario no autenticado no puede crear/editar/eliminar
