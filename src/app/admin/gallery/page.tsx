"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GalleryPost } from "@/lib/types/gallery";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Stack,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

export default function GalleryListPage() {
  const router = useRouter();
  const [galleries, setGalleries] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  const fetchGalleries = async () => {
    setLoading(true);
    try {
      const supabase = supabaseRef.current;
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      let query = supabase.from("gallery_posts").select("*");

      if (profile?.role !== "Administrador") {
        query = query.eq("author_id", user.id);
      }

      const { data: posts, error: postsError } = await query.order("created_at", { ascending: false });

      if (postsError) {
        console.error("Error fetching galleries:", postsError);
        setLoading(false);
        return;
      }

      if (posts && posts.length > 0) {
        const authorIds = [...new Set(posts.map(p => p.author_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", authorIds);

        const profileMap: Record<string, string> = {};
        profiles?.forEach(p => { profileMap[p.id] = p.name; });

        const postIds = posts.map(p => p.id);
        const { data: images } = await supabase
          .from("gallery_images")
          .select("id, gallery_post_id")
          .in("gallery_post_id", postIds);

        const imageCountMap: Record<string, number> = {};
        images?.forEach(img => {
          imageCountMap[img.gallery_post_id] = (imageCountMap[img.gallery_post_id] || 0) + 1;
        });

        const enriched = posts.map(p => ({
          ...p,
          profiles: { name: profileMap[p.author_id] || "Desconocido" },
          gallery_images: Array(imageCountMap[p.id] || 0).fill(null)
        }));

        setGalleries(enriched);
      } else {
        setGalleries(posts || []);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta galería?")) {
      await supabaseRef.current.from("gallery_posts").delete().eq("id", id);
      fetchGalleries();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Gestión de Galerías
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra tus colecciones de fotografías, dibujos y pinturas.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          component={Link}
          href="/admin/gallery/new"
          sx={{
            borderRadius: 0,
            px: 2,
            py: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            bgcolor: '#1a1a1a',
            '&:hover': { bgcolor: '#000' }
          }}
        >
          Nueva Galería
        </Button>
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: "1px solid #eee" }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead sx={{ bgcolor: "#f9f9f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "30%" }}>Título</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "20%" }}>Autor</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Imágenes</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Fecha</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: "10%" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {galleries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Typography color="text.secondary">No hay galerías todavía.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              galleries.map((gallery) => (
                <TableRow
                  key={gallery.id}
                  hover
                  onClick={() => router.push(`/admin/gallery/${gallery.slug}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{gallery.title}</Typography>
                    <Typography variant="caption" color="text.secondary">/{gallery.slug}</Typography>
                  </TableCell>
                  <TableCell>{gallery.profiles?.name || "Desconocido"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                      <ImageIcon sx={{ fontSize: 16, opacity: 0.5 }} />
                      <Typography variant="body2">{gallery.gallery_images?.length || 0}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Haz clic para cambiar el estatus">
                      <Chip
                        label={gallery.status === "publicado" ? "Publicado" : "Borrador"}
                        size="small"
                        color={gallery.status === "publicado" ? "success" : "default"}
                        onClick={async () => {
                          const newStatus = gallery.status === "publicado" ? "borrador" : "publicado";
                          const { error } = await supabaseRef.current
                            .from("gallery_posts")
                            .update({ status: newStatus })
                            .eq("id", gallery.id);

                          if (error) alert("Error: " + error.message);
                          else fetchGalleries();
                        }}
                        sx={{
                          borderRadius: 0,
                          fontWeight: "bold",
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.8 }
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {new Date(gallery.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <IconButton size="small" component={Link} href={`/admin/gallery/${gallery.slug}`}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" component={Link} href={`/admin/gallery/edit/${gallery.id}`}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(gallery.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
