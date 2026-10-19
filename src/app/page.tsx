"use client";

import { useEffect, useState } from "react";
import { createClient, getCurrentUser } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeedCard from "@/components/FeedCard";
import {
  Box,
  Container,
  Typography,
  Stack,
  CircularProgress,
} from "@mui/material";
import { AutoStories } from "@mui/icons-material";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  created_at: string;
  type: "post";
  comment_count: number;
  like_count: number;
  liked: boolean;
}

interface GalleryEntry {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  created_at: string;
  cover_url: string | null;
  image_count: number;
  embed_count: number;
  type: "gallery";
  comment_count: number;
  like_count: number;
  liked: boolean;
}

type FeedItem = Post | GalleryEntry;

// Los conteos de la portada vienen en dos llamadas (una por tipo), no una por entrada
async function fetchEngagement(
  supabase: ReturnType<typeof createClient>,
  posts: FeedItem[],
  galleries: FeedItem[]
) {
  const countMap = new Map<string, { comments: number; likes: number }>();
  const likedSet = new Set<string>();

  const postIds = posts.map((p) => p.id);
  const galleryIds = galleries.map((g) => g.id);

  const jobs: PromiseLike<any>[] = [];

  if (postIds.length) {
    jobs.push(
      supabase
        .rpc("get_counts", { p_target_ids: postIds, p_target_type: "post" })
        .then(({ data }) =>
          (data || []).forEach((r: any) =>
            countMap.set(`post|${r.item_id}`, {
              comments: r.comments_n,
              likes: r.likes_n,
            })
          )
        )
    );
  }

  if (galleryIds.length) {
    jobs.push(
      supabase
        .rpc("get_counts", { p_target_ids: galleryIds, p_target_type: "gallery" })
        .then(({ data }) =>
          (data || []).forEach((r: any) =>
            countMap.set(`gallery|${r.item_id}`, {
              comments: r.comments_n,
              likes: r.likes_n,
            })
          )
        )
    );
  }

  const allIds = [...postIds, ...galleryIds];
  const user = await getCurrentUser();
  if (user && allIds.length) {
    jobs.push(
      supabase
        .from("reactions")
        .select("target_id, target_type")
        .eq("user_id", user.id)
        .in("target_id", allIds)
        .then(({ data }) =>
          (data || []).forEach((r: any) => likedSet.add(`${r.target_type}|${r.target_id}`))
        )
    );
  }

  await Promise.all(jobs);
  return { countMap, likedSet };
}

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

      const postItems: FeedItem[] = (posts || []).map((p) => ({
        ...p,
        type: "post" as const,
        comment_count: 0,
        like_count: 0,
        liked: false,
      }));

      let galleryItems: FeedItem[] = [];
      if (galleries && galleries.length > 0) {
        const postIds = galleries.map((g) => g.id);
        const [{ data: images }, { data: embeds }] = await Promise.all([
          supabase
            .from("gallery_images")
            .select("gallery_post_id, image_url, caption, description, sort_order")
            .in("gallery_post_id", postIds)
            .order("sort_order"),
          supabase
            .from("gallery_embeds")
            .select("gallery_post_id")
            .in("gallery_post_id", postIds),
        ]);

        const coverMap: Record<string, string> = {};
        const imageCountMap: Record<string, number> = {};
        const embedCountMap: Record<string, number> = {};

        images?.forEach((img) => {
          if (!coverMap[img.gallery_post_id]) {
            coverMap[img.gallery_post_id] = img.image_url;
          }
          imageCountMap[img.gallery_post_id] = (imageCountMap[img.gallery_post_id] || 0) + 1;
        });

        embeds?.forEach((emb) => {
          embedCountMap[emb.gallery_post_id] = (embedCountMap[emb.gallery_post_id] || 0) + 1;
        });

        galleryItems = galleries.map((g) => ({
          ...g,
          cover_url: coverMap[g.id] || null,
          image_count: imageCountMap[g.id] || 0,
          embed_count: embedCountMap[g.id] || 0,
          type: "gallery" as const,
          comment_count: 0,
          like_count: 0,
          liked: false,
        }));
      }

      const merged = [...postItems, ...galleryItems].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const { countMap, likedSet } = await fetchEngagement(
        supabase,
        merged.filter((i) => i.type === "post"),
        merged.filter((i) => i.type === "gallery")
      );

      setItems(
        merged.map((item) => ({
          ...item,
          comment_count: countMap.get(`${item.type}|${item.id}`)?.comments ?? 0,
          like_count: countMap.get(`${item.type}|${item.id}`)?.likes ?? 0,
          liked: likedSet.has(`${item.type}|${item.id}`),
        }))
      );
      setLoading(false);
    };

    fetchFeed();
  }, []);

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Frontispicio de la Biblioteca */}
      <Box
        component="section"
        sx={{
          pt: { xs: 6, md: 9 },
          pb: { xs: 5, md: 7 },
          textAlign: "center",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          bgcolor: "var(--background-warm)",
          backgroundImage: "radial-gradient(#e0d2c0 0.8px, transparent 0.8px)",
          backgroundSize: "24px 24px",
        }}
      >
        <Container maxWidth="md">
          {/* Lema Universitario */}
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, mb: 2 }}>
            <span style={{ height: "1px", width: "24px", background: "var(--accent)" }} />
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 3,
                color: "var(--accent-text)",
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            >
              Agrupación Estudiantil · Universidad de Oriente
            </Typography>
            <span style={{ height: "1px", width: "24px", background: "var(--accent)" }} />
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
              fontWeight: 800,
              fontSize: { xs: "2.75rem", sm: "3.75rem", md: "5rem" },
              letterSpacing: "-0.01em",
              color: "var(--foreground)",
              lineHeight: 1.08,
              mb: 2,
            }}
          >
            Literudo
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: { xs: "1.1rem", md: "1.35rem" },
              color: "var(--foreground-muted)",
              maxWidth: "680px",
              mx: "auto",
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Artículos, poesía, ensayos y galería visual de la comunidad de la Universidad de Oriente.
          </Typography>
        </Container>
      </Box>

      {/* Catálogo de Obras */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 }, flex: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 12, gap: 2 }}>
            <CircularProgress size={32} sx={{ color: "var(--primary)" }} />
            <Typography sx={{ fontStyle: "italic", color: "var(--foreground-muted)", fontSize: "0.95rem" }}>
              Cargando publicaciones...
            </Typography>
          </Box>
        ) : items.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 12,
              px: 3,
              bgcolor: "var(--background-card)",
              borderRadius: "4px",
              border: "1px dashed var(--border)",
            }}
          >
            <AutoStories sx={{ fontSize: 44, color: "var(--accent)", mb: 2, opacity: 0.6 }} />
            <Typography variant="h5" sx={{ mb: 1, color: "var(--foreground)" }}>
              Aún no hay publicaciones
            </Typography>
            <Typography sx={{ fontStyle: "italic", color: "var(--foreground-muted)", maxWidth: 440, mx: "auto" }}>
              No hay publicaciones todavía. Vuelve pronto.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={{ xs: 3, md: 4 }}>
            {items.map((item) => (
              <FeedCard
                key={`${item.type}-${item.id}`}
                id={item.id}
                type={item.type}
                title={item.title}
                slug={item.slug}
                text={
                  item.type === "gallery"
                    ? item.description || "Imágenes y videos de la comunidad universitaria."
                    : item.excerpt || "Sin resumen disponible para esta entrada..."
                }
                date={new Date(item.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                coverUrl={item.type === "gallery" ? item.cover_url : null}
                itemCount={
                  item.type === "gallery" ? item.image_count + item.embed_count : undefined
                }
                commentCount={item.comment_count}
                likeCount={item.like_count}
                liked={item.liked}
              />
            ))}
          </Stack>
        )}
      </Container>

      <Footer />
    </Box>
  );
}