-- Tabla para almacenar embeds (YouTube/SoundCloud) en galerías
CREATE TABLE gallery_embeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_post_id UUID REFERENCES gallery_posts(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'soundcloud')),
  url TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE gallery_embeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery embeds public read"
  ON gallery_embeds FOR SELECT
  USING (true);

CREATE POLICY "Gallery embeds author insert"
  ON gallery_embeds FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT author_id FROM gallery_posts WHERE id = gallery_post_id)
  );

CREATE POLICY "Gallery embeds author delete"
  ON gallery_embeds FOR DELETE
  USING (
    auth.uid() = (SELECT author_id FROM gallery_posts WHERE id = gallery_post_id)
  );

-- Índices
CREATE INDEX idx_gallery_embeds_post_id ON gallery_embeds(gallery_post_id);
CREATE INDEX idx_gallery_embeds_sort ON gallery_embeds(gallery_post_id, sort_order);
