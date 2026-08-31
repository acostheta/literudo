"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Container,
  Typography,
  Stack,
  Divider,
  CircularProgress,
  Button,
} from "@mui/material";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  created_at: string;
  type: "post";
}

interface GalleryEntry {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  created_at: string;
  cover_url: string | null;
  image_count: number;
  type: "gallery";
}

type FeedItem = Post | GalleryEntry;

export default function Home() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchFeed = async () => {
      const [{ data: posts }, { data: galleries }] = await Promise.all([
        supabase
          .from("posts")
          .select("id, title, slug, excerpt, created_at")
          .eq("status", "publicado")
          .order("created_at", { ascending: false }),
        supabase
          .from("gallery_posts")
          .select("id, title, slug, description, created_at")
          .eq("status", "publicado")
          .order("created_at", { ascending: false }),
      ]);

      const postItems: FeedItem[] = (posts || []).map((p) => ({ ...p, type: "post" as const }));

      let galleryItems: FeedItem[] = [];
      if (galleries && galleries.length > 0) {
        const postIds = galleries.map((g) => g.id);
        const { data: images } = await supabase
          .from("gallery_images")
          .select("gallery_post_id, image_url, sort_order")
          .in("gallery_post_id", postIds)
          .order("sort_order");

        galleryItems = galleries.map((g) => {
          const gImages = (images || []).filter((i) => i.gallery_post_id === g.id);
          return {
            ...g,
            cover_url: gImages[0]?.image_url || null,
            image_count: gImages.length,
            type: "gallery" as const,
          };
        });
      }

      const merged = [...postItems, ...galleryItems].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setItems(merged);
      setLoading(false);
    };

    fetchFeed();
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#fdfdfb' }}>
        <CircularProgress color="inherit" size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fdfdfb', minHeight: '100vh', color: '#1a1a1a', pb: 10 }}>
      {/* Cabecera Clásica Estilo Blogspot/Editorial */}
      <Box sx={{ pt: 10, pb: 6, textAlign: 'center', borderBottom: '1px solid #eee' }}>
        <Container maxWidth="md">
          <Typography 
            variant="h1" 
            sx={{ 
              fontFamily: '"Lora", serif', 
              fontWeight: 800, 
              fontSize: { xs: '3rem', md: '5rem' },
              letterSpacing: -2,
              mb: 1
            }}
          >
            Literudo
          </Typography>
          <Typography 
            variant="overline" 
            sx={{ 
              letterSpacing: 4, 
              opacity: 0.5, 
              fontWeight: 700,
              display: 'block',
              mb: 4
            }}
          >
            Bitácora de Pensamiento Literario
          </Typography>
          
          <Stack direction="row" spacing={3} sx={{ justifyContent: "center", mt: 2 }}>
            <Typography component={Link} href="/" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>
              Inicio
            </Typography>
            <Typography component={Link} href="/gallery" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>
              Galería
            </Typography>
            <Typography component={Link} href="/admin" sx={{ textDecoration: 'none', color: 'primary.main', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 1 }}>
              Admin
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Lista de Entradas */}
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Stack spacing={12}>
          {items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Typography sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                El tintero está vacío por ahora. Vuelve pronto.
              </Typography>
            </Box>
          ) : (
            items.map((item) => (
              <Box key={item.id} component="article" sx={{ textAlign: 'center' }}>
                {/* Fecha */}
                <Typography variant="caption" sx={{ letterSpacing: 2, textTransform: 'uppercase', opacity: 0.4, mb: 2, display: 'block' }}>
                  {new Date(item.created_at).toLocaleDateString('es-ES', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </Typography>

                {/* Label de tipo */}
                {item.type === "gallery" && (
                  <Typography variant="caption" sx={{ letterSpacing: 3, textTransform: 'uppercase', opacity: 0.35, mb: 1, display: 'block', fontWeight: 700 }}>
                    · Galería ·
                  </Typography>
                )}

                {/* Cover image para galerías */}
                {item.type === "gallery" && item.cover_url && (
                  <Box
                    component={Link}
                    href={`/gallery/${item.slug}`}
                    sx={{
                      display: 'block',
                      width: '100%',
                      height: 280,
                      backgroundImage: `url(${item.cover_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      mb: 4,
                      textDecoration: 'none',
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 0.85 }
                    }}
                  />
                )}

                {/* Título */}
                <Typography 
                  variant="h2" 
                  component={Link}
                  href={item.type === "gallery" ? `/gallery/${item.slug}` : `/posts/${item.slug}`}
                  sx={{ 
                    fontFamily: '"Lora", serif', 
                    fontWeight: 800, 
                    fontSize: { xs: '2rem', md: '2.8rem' },
                    lineHeight: 1.2,
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    mb: 3,
                    '&:hover': { opacity: 0.7 }
                  }}
                >
                  {item.title}
                </Typography>

                {/* Resumen / Descripción */}
                <Typography 
                  sx={{ 
                    fontFamily: '"Lora", serif', 
                    fontSize: '1.15rem', 
                    color: '#444',
                    lineHeight: 1.8,
                    mb: 4,
                    textAlign: 'center'
                  }}
                >
                  {item.type === "gallery"
                    ? (item.description || `${item.image_count} fotografías`)
                    : (item.excerpt || "Sin resumen disponible...")
                  }
                </Typography>

                <Button 
                  component={Link}
                  href={item.type === "gallery" ? `/gallery/${item.slug}` : `/posts/${item.slug}`}
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 800, 
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    fontFamily: '"Lora", serif',
                    fontStyle: 'italic'
                  }}
                >
                  {item.type === "gallery" ? "Ver galería →" : "Seguir leyendo →"}
                </Button>
              </Box>
            ))
          )}
        </Stack>
      </Container>

      {/* Footer */}
      <Box sx={{ mt: 20, py: 6, borderTop: '1px solid #eee', textAlign: 'center', opacity: 0.3 }}>
        <Typography variant="caption" sx={{ letterSpacing: 2 }}>
          © {new Date().getFullYear()} LITERUDO — AÚN EN SILENCIO
        </Typography>
      </Box>
    </Box>
  );
}