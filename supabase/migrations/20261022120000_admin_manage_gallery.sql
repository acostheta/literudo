-- El Administrador puede leer y gestionar cualquier galeria, incluidos borradores ajenos.
-- Las politicas de autor siguen vigentes; estas se suman (son permisivas).

-- Las imagenes solo pueden agregarse a galerias propias (antes cualquier autenticado podia).
DROP POLICY IF EXISTS "Gallery images author insert" ON gallery_images;
CREATE POLICY "Gallery images author insert" ON gallery_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gallery_posts
      WHERE id = gallery_post_id AND author_id = auth.uid()
    )
  );

CREATE POLICY "Gallery posts admin all" ON gallery_posts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Administrador'
    )
  );

CREATE POLICY "Gallery images admin all" ON gallery_images
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Administrador'
    )
  );

CREATE POLICY "Gallery embeds admin all" ON gallery_embeds
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Administrador'
    )
  );
