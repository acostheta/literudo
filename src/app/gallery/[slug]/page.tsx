"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { GalleryPost } from "@/lib/types/gallery";
import MasonryGrid from "@/components/MasonryGrid";
import EmbedPlayer from "@/components/EmbedPlayer";
import CommentSection from "@/components/comments/CommentSection";
import PostEngagement from "@/components/engagement/PostEngagement";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Container,
  CircularProgress,
  Stack,
  Button,
} from "@mui/material";
import {
  Image as ImageIcon,
  VideoFile as VideoIcon,
  MusicNote as MusicIcon,
  ArrowBack,
  PersonOutlined,
  CalendarToday,
} from "@mui/icons-material";

export default function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [gallery, setGallery] = useState<GalleryPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const fetchGallery = async () => {
      const { data: post } = await supabaseRef.current
        .from("gallery_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "publicado")
        .single();

      if (post) {
        const { data: profile } = await supabaseRef.current
          .from("profiles")
          .select("name")
          .eq("id", post.author_id)
          .single();

        const [{ data: images }, { data: embeds }] = await Promise.all([
          supabaseRef.current
            .from("gallery_images")
            .select("*")
            .eq("gallery_post_id", post.id)
            .order("sort_order"),
          supabaseRef.current
            .from("gallery_embeds")
            .select("*")
            .eq("gallery_post_id", post.id)
            .order("sort_order"),
        ]);

        setGallery({
          ...post,
          profiles: profile,
          gallery_images: images || [],
          gallery_embeds: embeds || [],
        });

        if ((!images || images.length === 0) && embeds && embeds.length > 0) {
          setActiveTab(1);
        }
      }
      setLoading(false);
    };

    fetchGallery();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "var(--background)", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
          <CircularProgress sx={{ color: "var(--primary)" }} size={32} />
        </Box>
        <Footer />
      </Box>
    );
  }

  if (!gallery) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "var(--background)", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 15, textAlign: "center", flex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
              mb: 2,
              color: "var(--foreground)",
            }}
          >
            Galería no encontrada
          </Typography>
          <Typography sx={{ mb: 4, color: "var(--foreground-muted)", fontFamily: "var(--font-serif)" }}>
            La galería solicitada no existe o ha sido eliminada.
          </Typography>
          <Button
            component={Link}
            href="/gallery"
            variant="outlined"
            sx={{ borderColor: "var(--primary)", color: "var(--primary)" }}
          >
            Volver a la Galería
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  const images = gallery.gallery_images || [];
  const videoEmbeds = (gallery.gallery_embeds || []).filter((e) => e.platform === "youtube");
  const musicEmbeds = (gallery.gallery_embeds || []).filter((e) => e.platform === "soundcloud");

  const hasImages = images.length > 0;
  const hasVideos = videoEmbeds.length > 0;
  const hasMusic = musicEmbeds.length > 0;
  const totalItems = images.length + videoEmbeds.length + musicEmbeds.length;

  const tabs = [];
  if (hasImages) tabs.push({ label: `Imágenes (${images.length})`, icon: <ImageIcon sx={{ fontSize: 18 }} /> });
  if (hasVideos) tabs.push({ label: `Videos (${videoEmbeds.length})`, icon: <VideoIcon sx={{ fontSize: 18 }} /> });
  if (hasMusic) tabs.push({ label: `Audios (${musicEmbeds.length})`, icon: <MusicIcon sx={{ fontSize: 18 }} /> });

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 }, flex: 1 }}>
        {/* Enlace Retorno */}
        <Box sx={{ mb: 4 }}>
          <Link
            href="/gallery"
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
            <span>Volver a las galerías</span>
          </Link>
        </Box>

        {/* Ficha Principal de la Colección */}
        <Box
          sx={{
            textAlign: "center",
            mb: { xs: 5, md: 7 },
            p: { xs: 3, md: 5 },
            bgcolor: "var(--background-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            boxShadow: "var(--card-shadow)",
            position: "relative",
          }}
        >
          <Typography
            variant="overline"
            sx={{
              letterSpacing: 3,
              color: "var(--accent-text)",
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: "0.75rem",
              display: "block",
              mb: 1,
            }}
          >
            Galería
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
              fontSize: { xs: "2.2rem", sm: "3rem", md: "3.6rem" },
              fontWeight: 700,
              color: "var(--foreground)",
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            {gallery.title}
          </Typography>

          {gallery.description && (
            <Typography
              sx={{
                fontFamily: "var(--font-serif)",
                fontSize: { xs: "1.05rem", md: "1.2rem" },
                color: "var(--foreground-muted)",
                fontStyle: "italic",
                maxWidth: "760px",
                mx: "auto",
                mb: 3,
                lineHeight: 1.7,
              }}
            >
              {gallery.description}
            </Typography>
          )}

          <Stack
            direction="row"
            spacing={2.5}
            sx={{
              justifyContent: "center",
              alignItems: "center",
              color: "var(--foreground-faint)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <PersonOutlined sx={{ fontSize: 16, color: "var(--primary)" }} />
              <span>{gallery.profiles?.name || "Anónimo"}</span>
            </Box>
            <span>·</span>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarToday sx={{ fontSize: 14, color: "var(--accent-text)" }} />
              <span>
                {new Date(gallery.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </Box>
            <span>·</span>
            <span>{totalItems} {totalItems === 1 ? "elemento" : "elementos"}</span>
          </Stack>
        </Box>

        {/* Pestañas de la Exhibición */}
        {tabs.length > 1 && (
          <Box sx={{ maxWidth: 540, mx: "auto", mb: 5 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="fullWidth"
              sx={{
                bgcolor: "var(--background-card)",
                borderRadius: "4px",
                border: "1px solid var(--border)",
                p: 0.5,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-sans)",
                  color: "var(--foreground-muted)",
                  minHeight: "42px",
                  borderRadius: "3px",
                  "&.Mui-selected": {
                    color: "var(--primary)",
                    bgcolor: "var(--background-parchment)",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "var(--primary)",
                  height: 3,
                },
              }}
            >
              {tabs.map((tab) => (
                <Tab key={tab.label} icon={tab.icon} iconPosition="start" label={tab.label} />
              ))}
            </Tabs>
          </Box>
        )}

        {/* Contenido de la Exhibición */}
        <Box sx={{ maxWidth: "1040px", mx: "auto" }}>
          {/* Imágenes con MasonryGrid */}
          {activeTab === 0 && hasImages && (
            <Box sx={{ p: { xs: 1, md: 3 }, bgcolor: "var(--background-card)", border: "1px solid var(--border)", borderRadius: "4px" }}>
              <MasonryGrid images={images} />
            </Box>
          )}

          {/* Videos */}
          {activeTab === (hasImages ? (hasVideos ? 1 : -1) : 0) && hasVideos && (
            <Stack spacing={4}>
              {videoEmbeds.map((embed) => (
                <Box key={embed.id} sx={{ p: 2, bgcolor: "var(--background-card)", border: "1px solid var(--border)", borderRadius: "4px" }}>
                  <EmbedPlayer
                    platform={embed.platform}
                    embedUrl={embed.embed_url}
                    caption={embed.caption}
                    description={embed.description}
                  />
                </Box>
              ))}
            </Stack>
          )}

          {/* Música / Audios */}
          {activeTab === (hasImages ? (hasVideos ? 2 : 1) : (hasVideos ? 1 : 0)) && hasMusic && (
            <Stack spacing={3}>
              {musicEmbeds.map((embed) => (
                <Box key={embed.id} sx={{ p: 2, bgcolor: "var(--background-card)", border: "1px solid var(--border)", borderRadius: "4px" }}>
                  <EmbedPlayer
                    platform={embed.platform}
                    embedUrl={embed.embed_url}
                    caption={embed.caption}
                    description={embed.description}
                  />
                </Box>
              ))}
            </Stack>
          )}

          {/* Sin contenido */}
          {tabs.length === 0 && (
            <Box sx={{ textAlign: "center", py: 10, bgcolor: "var(--background-card)", border: "1px dashed var(--border)", borderRadius: "4px" }}>
              <Typography sx={{ fontStyle: "italic", color: "var(--foreground-muted)" }}>
                Esta galería aún no tiene contenido.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Sección de Comentarios de la Galería */}
        <Box sx={{ maxWidth: "860px", mx: "auto", mt: 8, p: { xs: 3, md: 5 }, bgcolor: "var(--background-card)", border: "1px solid var(--border)", borderRadius: "4px" }}>
          <PostEngagement
            targetId={gallery.id}
            targetType="gallery"
            url={`/gallery/${gallery.slug}`}
            title={gallery.title}
          />
          <CommentSection postId={gallery.id} targetType="gallery" />
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
