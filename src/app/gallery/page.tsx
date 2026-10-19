"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient, getCurrentUser } from "@/lib/supabase/client";
import { GalleryPost } from "@/lib/types/gallery";
import FeedCard from "@/components/FeedCard";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera, ArrowBack, Collections } from "@mui/icons-material";

export default function GalleryListPage() {
  const [galleries, setGalleries] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const fetchGalleries = async () => {
      const { data: posts } = await supabaseRef.current
        .from("gallery_posts")
        .select("*")
        .eq("status", "publicado")
        .order("created_at", { ascending: false });

      if (posts && posts.length > 0) {
        const authorIds = [...new Set(posts.map((p) => p.author_id))];
        const { data: profiles } = await supabaseRef.current
          .from("profiles")
          .select("id, name")
          .in("id", authorIds);

        const profileMap: Record<string, string> = {};
        profiles?.forEach((p) => {
          profileMap[p.id] = p.name;
        });

        const postIds = posts.map((p) => p.id);
        const [{ data: images }, { data: embeds }] = await Promise.all([
          supabaseRef.current
            .from("gallery_images")
            .select("gallery_post_id, image_url, caption, description")
            .in("gallery_post_id", postIds),
          supabaseRef.current
            .from("gallery_embeds")
            .select("gallery_post_id")
            .in("gallery_post_id", postIds),
        ]);

        const coverMap: Record<string, string> = {};
        const countMap: Record<string, number> = {};

        images?.forEach((img) => {
          if (!coverMap[img.gallery_post_id]) {
            coverMap[img.gallery_post_id] = img.image_url;
          }
          countMap[img.gallery_post_id] = (countMap[img.gallery_post_id] || 0) + 1;
        });

        embeds?.forEach((emb) => {
          countMap[emb.gallery_post_id] = (countMap[emb.gallery_post_id] || 0) + 1;
        });

        const [{ data: counts }, user] = await Promise.all([
          supabaseRef.current.rpc("get_counts", { p_target_ids: postIds, p_target_type: "gallery" }),
          getCurrentUser(),
        ]);
        const engagementMap = new Map<string, any>();
        ((counts || []) as any[]).forEach((r) => engagementMap.set(r.item_id, r));
        const likedSet = new Set<string>();
        if (user) {
          const { data: mine } = await supabaseRef.current
            .from("reactions")
            .select("target_id")
            .eq("user_id", user.id)
            .eq("target_type", "gallery")
            .in("target_id", postIds);
          (mine || []).forEach((r: any) => likedSet.add(r.target_id));
        }

        const enriched = posts.map((p) => ({
          ...p,
          profiles: { name: profileMap[p.author_id] || "Anónimo" },
          gallery_images: coverMap[p.id] ? [{ image_url: coverMap[p.id] }] : [],
          _itemCount: countMap[p.id] || 0,
          comment_count: engagementMap.get(p.id)?.comments_n ?? 0,
          like_count: engagementMap.get(p.id)?.likes_n ?? 0,
          liked: likedSet.has(p.id),
        }));

        setGalleries(enriched);
      } else {
        setGalleries(posts || []);
      }
      setLoading(false);
    };

    fetchGalleries();
  }, []);

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 }, flex: 1 }}>
        {/* Enlace de Retorno */}
        <Box sx={{ mb: 4 }}>
          <Link
            href="/"
            style={{
              color: "var(--foreground-muted)",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontFamily: "var(--font-serif)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "color 0.2s",
            }}
          >
            <ArrowBack sx={{ fontSize: 16 }} />
            <span>Volver al inicio</span>
          </Link>
        </Box>

        {/* Encabezado del Gabinete */}
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 8 } }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <PhotoCamera sx={{ color: "var(--accent-text)", fontSize: 20 }} />
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 3,
                color: "var(--accent-text)",
                fontWeight: 700,
                fontSize: "0.78rem",
              }}
            >
              Galería
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
              fontSize: { xs: "2.3rem", sm: "3.2rem", md: "4rem" },
              letterSpacing: "-0.01em",
              color: "var(--foreground)",
              mb: 2,
            }}
          >
            Galería
          </Typography>

          <Typography
            sx={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: { xs: "1.05rem", md: "1.2rem" },
              color: "var(--foreground-muted)",
              maxWidth: 620,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Imágenes, videos y audios creados por nuestra comunidad.
          </Typography>
        </Box>

        {/* Listado de Galerías */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
            <CircularProgress sx={{ color: "var(--primary)" }} size={32} />
          </Box>
        ) : galleries.length === 0 ? (
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
            <Collections sx={{ fontSize: 44, color: "var(--accent)", mb: 2, opacity: 0.6 }} />
            <Typography variant="h5" sx={{ mb: 1, color: "var(--foreground)" }}>
              Aún no hay galerías
            </Typography>
            <Typography sx={{ fontStyle: "italic", color: "var(--foreground-muted)" }}>
              Pronto se publicarán nuevas galerías.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 5,
            }}
          >
            {galleries.map((gallery) => {
              const g = gallery as any;
              const coverImage = gallery.gallery_images?.[0]?.image_url;

              return (
                <FeedCard
                  compact
                  key={gallery.id}
                  id={gallery.id}
                  type="gallery"
                  title={gallery.title}
                  slug={gallery.slug}
                  text={gallery.description || "Imágenes y videos de la comunidad universitaria."}
                  date={new Date(gallery.created_at).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  coverUrl={coverImage}
                  itemCount={g._itemCount || 0}
                  commentCount={g.comment_count}
                  likeCount={g.like_count}
                  liked={g.liked}
                />
              );
            })}
          </Box>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
