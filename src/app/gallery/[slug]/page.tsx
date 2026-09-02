"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GalleryPost } from "@/lib/types/gallery";
import MasonryGrid from "@/components/MasonryGrid";
import EmbedPlayer from "@/components/EmbedPlayer";
import CommentSection from "@/components/comments/CommentSection";
import { Tabs, Tab, Box, Typography } from "@mui/material";
import {
  Image as ImageIcon,
  VideoFile as VideoIcon,
  MusicNote as MusicIcon,
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

        // Si no hay imágenes pero hay embeds, activar la primera pestaña con contenido
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--background)',
        color: '#999'
      }}>
        Cargando...
      </div>
    );
  }

  if (!gallery) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--background)',
        padding: '2rem'
      }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', marginBottom: '1rem' }}>
          Galería no encontrada
        </h2>
        <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
          Volver al inicio
        </Link>
      </div>
    );
  }

  const images = gallery.gallery_images || [];
  const videoEmbeds = (gallery.gallery_embeds || []).filter((e) => e.platform === "youtube");
  const musicEmbeds = (gallery.gallery_embeds || []).filter((e) => e.platform === "soundcloud");

  const hasImages = images.length > 0;
  const hasVideos = videoEmbeds.length > 0;
  const hasMusic = musicEmbeds.length > 0;
  const totalItems = images.length + videoEmbeds.length + musicEmbeds.length;

  // Determinar qué pestañas mostrar
  const tabs = [];
  if (hasImages) tabs.push({ label: "Imágenes", icon: <ImageIcon sx={{ fontSize: 18 }} /> });
  if (hasVideos) tabs.push({ label: "Videos", icon: <VideoIcon sx={{ fontSize: 18 }} /> });
  if (hasMusic) tabs.push({ label: "Música", icon: <MusicIcon sx={{ fontSize: 18 }} /> });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href="/"
          style={{
            color: 'var(--foreground-muted)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Inicio
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'var(--foreground)',
          marginBottom: '0.5rem'
        }}>
          {gallery.title}
        </h1>

        {gallery.description && (
          <p style={{
            fontFamily: 'var(--font-lora)',
            fontSize: '1.1rem',
            color: 'var(--foreground-muted)',
            fontStyle: 'italic',
            maxWidth: '700px',
            margin: '1rem auto 0',
            lineHeight: 1.6
          }}>
            {gallery.description}
          </p>
        )}

        <div style={{
          marginTop: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--foreground-muted)'
        }}>
          <span style={{ fontWeight: '600' }}>{gallery.profiles?.name || 'Anónimo'}</span>
          <span style={{ margin: '0 0.5rem' }}>·</span>
          <span>
            {new Date(gallery.created_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
          <span style={{ margin: '0 0.5rem' }}>·</span>
          <span>{totalItems} {totalItems === 1 ? 'elemento' : 'elementos'}</span>
        </div>
      </div>

      {/* Pestañas */}
      {tabs.length > 1 && (
        <Box sx={{ maxWidth: 600, mx: "auto", mb: 4 }}>
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

      {/* Contenido */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Imágenes */}
        {activeTab === 0 && hasImages && (
          <MasonryGrid images={images} />
        )}

        {/* Videos */}
        {activeTab === (hasImages ? (hasVideos ? 1 : -1) : 0) && hasVideos && (
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
        {activeTab === (hasImages ? (hasVideos ? 2 : 1) : (hasVideos ? 1 : 0)) && hasMusic && (
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

        {/* Sin contenido */}
        {tabs.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10, color: "text.secondary" }}>
            <Typography sx={{ fontStyle: "italic" }}>
              Esta galería no tiene contenido todavía.
            </Typography>
          </Box>
        )}
      </div>

      <div style={{ maxWidth: '800px', margin: '3rem auto 0' }}>
        <CommentSection postId={gallery.id} />
      </div>
    </div>
  );
}
