"use client";

import { useEffect, useState, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/permissions";
import ReviewActions from "@/components/admin/ReviewActions";
import { GalleryPost } from "@/lib/types/gallery";
import {
  Box,
  Container,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
  Button,
  Tooltip,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  MusicNote as MusicIcon,
} from "@mui/icons-material";
import MasonryGrid from "@/components/MasonryGrid";
import EmbedPlayer from "@/components/EmbedPlayer";
import Link from "next/link";

export default function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [gallery, setGallery] = useState<GalleryPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const fetchGallery = async () => {
      const { data: post } = await supabaseRef.current
        .from("gallery_posts")
        .select("*")
        .eq("slug", slug)
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
      }
      setAdmin(await isAdmin(supabaseRef.current));
      setLoading(false);
    };

    fetchGallery();
  }, [slug]);

  const refreshReview = async () => {
    if (!gallery) return;
    const { data } = await supabaseRef.current
      .from("gallery_posts")
      .select("status, needs_review, review_note")
      .eq("id", gallery.id)
      .single();
    if (data) setGallery({ ...gallery, ...data });
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#fcfcfb' }}>
        <CircularProgress color="inherit" size={30} />
      </Box>
    );
  }

  if (!gallery) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5">Galería no encontrada.</Typography>
        <Button onClick={() => router.back()} sx={{ mt: 2 }}>Volver</Button>
      </Container>
    );
  }

  const images = gallery.gallery_images || [];
  const videoEmbeds = (gallery.gallery_embeds || []).filter((e) => e.platform === "youtube");
  const musicEmbeds = (gallery.gallery_embeds || []).filter((e) => e.platform === "soundcloud");

  const hasImages = images.length > 0;
  const hasVideos = videoEmbeds.length > 0;
  const hasMusic = musicEmbeds.length > 0;

  const tabs = [];
  if (hasImages) tabs.push({ label: "Imágenes", icon: <ImageIcon sx={{ fontSize: 18 }} /> });
  if (hasVideos) tabs.push({ label: "Videos", icon: <VideoIcon sx={{ fontSize: 18 }} /> });
  if (hasMusic) tabs.push({ label: "Música", icon: <MusicIcon sx={{ fontSize: 18 }} /> });

  const getTabIndex = (type: "images" | "videos" | "music") => {
    if (type === "images") return 0;
    if (type === "videos") return hasImages ? 1 : 0;
    if (type === "music") return (hasImages ? 1 : 0) + (hasVideos ? 1 : 0);
    return 0;
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#fdfdfb',
      color: '#1a1a1a',
      pb: 15
    }}>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 200 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ position: 'fixed', top: 20, left: 20, zIndex: 100 }}>
        <Tooltip title="Volver a la lista">
          <IconButton
            onClick={() => router.back()}
            sx={{
              bgcolor: 'white',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #eee',
              '&:hover': { bgcolor: '#fafafa' }
            }}
          >
            <BackIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 100 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
          <ReviewActions
            target="gallery"
            id={gallery.id}
            status={gallery.status}
            needsReview={gallery.needs_review}
            reviewNote={gallery.review_note}
            isAdmin={admin}
            onChanged={refreshReview}
          />

          <Button
            component={Link}
            href={`/admin/gallery/edit/${gallery.id}`}
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              bgcolor: '#1a1a1a',
              borderRadius: 0,
              px: 3,
              '&:hover': { bgcolor: '#000' }
            }}
          >
            Editar
          </Button>
        </Stack>
      </Box>

      <Container maxWidth="lg" sx={{ pt: { xs: 10, md: 20 } }}>
        <Stack spacing={4} sx={{ alignItems: "center" }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Lora", serif',
              fontWeight: 800,
              fontSize: { xs: '2.5rem', md: '4rem' },
              textAlign: 'center',
              lineHeight: 1.1,
              letterSpacing: -2,
              mb: 2
            }}
          >
            {gallery.title}
          </Typography>

          <Box sx={{ width: 40, height: 1, bgcolor: 'primary.main', my: 4, opacity: 0.6 }} />

          {gallery.description && (
            <Typography sx={{
              fontFamily: '"Lora", serif',
              fontSize: '1.3rem',
              fontStyle: 'italic',
              textAlign: 'center',
              color: '#555',
              lineHeight: 1.6,
              maxWidth: '80%',
              mb: 6
            }}>
              {gallery.description}
            </Typography>
          )}

          {/* Pestañas */}
          {tabs.length > 1 && (
            <Box sx={{ width: '100%', maxWidth: 600 }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant="fullWidth"
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  },
                }}
              >
                {tabs.map((tab) => (
                  <Tab key={tab.label} icon={tab.icon} iconPosition="start" label={tab.label} />
                ))}
              </Tabs>
            </Box>
          )}

          <Box sx={{ width: '100%', mt: 4 }}>
            {/* Imágenes */}
            {activeTab === getTabIndex("images") && hasImages && (
              <MasonryGrid images={images} />
            )}

            {/* Videos */}
            {activeTab === getTabIndex("videos") && hasVideos && (
              <Box>
                {videoEmbeds.map((embed) => (
                  <EmbedPlayer
                    key={embed.id}
                    platform={embed.platform}
                    embedUrl={embed.embed_url}
                    caption={embed.caption}
                  />
                ))}
              </Box>
            )}

            {/* Música */}
            {activeTab === getTabIndex("music") && hasMusic && (
              <Box>
                {musicEmbeds.map((embed) => (
                  <EmbedPlayer
                    key={embed.id}
                    platform={embed.platform}
                    embedUrl={embed.embed_url}
                    caption={embed.caption}
                  />
                ))}
              </Box>
            )}
          </Box>

          <Stack spacing={1} sx={{ alignItems: "center", mt: 10 }}>
            <Typography variant="caption" sx={{ letterSpacing: 3, textTransform: 'uppercase', opacity: 0.4 }}>
              Galería de
            </Typography>
            <Typography sx={{ fontFamily: '"Lora", serif', fontSize: '1.2rem', fontWeight: 700 }}>
              {gallery.profiles?.name || "Autor Anónimo"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.3, mt: 1 }}>
              {new Date(gallery.created_at).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
