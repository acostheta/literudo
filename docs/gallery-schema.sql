-- Gallery tables for Literudo

-- Gallery posts table
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

-- Gallery images table
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_post_id UUID REFERENCES gallery_posts(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE gallery_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Gallery posts: public read for published
CREATE POLICY "Gallery posts public read" ON gallery_posts
  FOR SELECT USING (status = 'publicado');

-- Gallery posts: author insert
CREATE POLICY "Gallery posts author insert" ON gallery_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Gallery posts: author update
CREATE POLICY "Gallery posts author update" ON gallery_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Gallery posts: author delete
CREATE POLICY "Gallery posts author delete" ON gallery_posts
  FOR DELETE USING (auth.uid() = author_id);

-- Gallery images: public read
CREATE POLICY "Gallery images public read" ON gallery_images
  FOR SELECT USING (true);

-- Gallery images: author insert (must own the parent post)
CREATE POLICY "Gallery images author insert" ON gallery_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM gallery_posts
      WHERE id = gallery_post_id AND author_id = auth.uid()
    )
  );

-- Gallery images: author delete (must own the parent post)
CREATE POLICY "Gallery images author delete" ON gallery_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM gallery_posts
      WHERE id = gallery_post_id AND author_id = auth.uid()
    )
  );

-- Storage bucket: gallery
-- Run this in Supabase Dashboard > Storage > New Bucket
-- Name: gallery
-- Public: true
-- File size limit: 10 MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
