"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  profiles: { name: string } | null;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(name)")
      .order("created_at", { ascending: false });

    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
      await supabase.from("posts").delete().eq("id", id);
      fetchPosts();
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Gestión de Artículos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Escribe, edita y publica historias para la comunidad Literudo.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          component={Link}
          href="/admin/posts/new"
          sx={{ borderRadius: 0, px: 3 }}
        >
          Nuevo Artículo
        </Button>
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: "1px solid #eee" }}>
        <Table sx={{ tableLayout: 'fixed' }}>
          <TableHead sx={{ bgcolor: "#f9f9f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "40%" }}>Título</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "20%" }}>Autor</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: "bold", width: "15%" }}>Fecha</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: "10%" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {posts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                  <Typography color="text.secondary">No hay artículos escritos todavía.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{post.title}</Typography>
                    <Typography variant="caption" color="text.secondary">/{post.slug}</Typography>
                  </TableCell>
                  <TableCell>{post.profiles?.name || "Desconocido"}</TableCell>
                  <TableCell>
                    <Chip
                      label={post.status === "publicado" ? "Publicado" : "Borrador"}
                      size="small"
                      color={post.status === "publicado" ? "success" : "default"}
                      sx={{ borderRadius: 0, fontWeight: "bold" }}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(post.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton size="small" component={Link} href={`/admin/posts/edit/${post.id}`}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(post.id)}>
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
