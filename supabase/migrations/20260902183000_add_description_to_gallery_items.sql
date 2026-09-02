-- Agregar campo description a gallery_images
ALTER TABLE gallery_images ADD COLUMN description TEXT;

-- Agregar campo description a gallery_embeds
ALTER TABLE gallery_embeds ADD COLUMN description TEXT;
