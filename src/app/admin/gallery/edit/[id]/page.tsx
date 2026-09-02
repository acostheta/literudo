"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { GalleryImage, GalleryEmbed } from "@/lib/types/gallery";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  CircularProgress,
} from "@mui/material";
import GalleryForm from "@/components/admin/GalleryForm";
import Link from "next/link";

export default function EditGalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [initialTitle, setInitialTitle] = useState("");
  const [initialDescription, setInitialDescription] = useState("");
  const [initialImages, setInitialImages] = useState<GalleryImage[]>([]);
  const [initialEmbeds, setInitialEmbeds] = useState<GalleryEmbed[]>([]);
  const [initialStatus, setInitialStatus] = useState("borrador");

  useEffect(() => {
    const fetchGallery = async () => {
      const { data: gallery } = await supabase
        .from("gallery_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (gallery) {
        setInitialTitle(gallery.title);
        setInitialDescription(gallery.description || "");
        setInitialStatus(gallery.status);

        const [{ data: images }, { data: embeds }] = await Promise.all([
          supabase
            .from("gallery_images")
            .select("*")
            .eq("gallery_post_id", id)
            .order("sort_order"),
          supabase
            .from("gallery_embeds")
            .select("*")
            .eq("gallery_post_id", id)
            .order("sort_order"),
        ]);

        if (images) setInitialImages(images);
        if (embeds) setInitialEmbeds(embeds);
      }
      setLoading(false);
    };

    fetchGallery();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color="inherit" size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fcfcfb', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 6 }}>
          <Breadcrumbs sx={{ mb: 1.5, '& .MuiBreadcrumbs-li': { fontSize: '0.7rem', letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.5 } }}>
            <MuiLink component={Link} href="/admin/gallery" underline="hover" color="inherit">
              Galerías
            </MuiLink>
            <Typography color="text.primary" sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Editar</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{
            fontFamily: '"Lora", serif',
            fontWeight: 800,
            color: '#1a1a1a',
            letterSpacing: -1
          }}>
            Editar galería
          </Typography>
        </Box>

        <GalleryForm
          mode="edit"
          galleryId={id}
          initialTitle={initialTitle}
          initialDescription={initialDescription}
          initialImages={initialImages}
          initialEmbeds={initialEmbeds}
          initialStatus={initialStatus}
          submitLabel="Guardar Cambios"
        />
      </Container>
    </Box>
  );
}
