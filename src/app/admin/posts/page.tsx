"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isAdmin, POST_STATUS, POST_STATUS_COLOR, POST_STATUS_LABEL } from "@/lib/permissions";
import ReviewActions from "@/components/admin/ReviewActions";
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
  Alert,
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
  needs_review: boolean;
  review_note: string | null;
  created_at: string;
  profiles: { name: string } | null;
}

const FILTROS = [
  { value: "todos", label: "Todos" },
  { value: "por_revisar", label: "Por revisar" },
  { value: POST_STATUS.inReview, label: "En revisión" },
  { value: "editados", label: "Editados" },
  { value: POST_STATUS.approved, label: "Aprobados" },
  { value: POST_STATUS.published, label: "Publicados" },
  { value: POST_STATUS.rejected, label: "Rechazados" },
  { value: POST_STATUS.draft, label: "Borradores" },
];

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [admin, setAdmin] = useState(false);
  const [filtro, setFiltro] = useState("todos");
  const supabase = createClient();

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Obtener el usuario actual y si es Administrador
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Sin sesión no hay consulta: cortar el spinner y avisar.
        setError("Tu sesión expiró. Vuelve a iniciar sesión.");
        setPosts([]);
        return;
      }

      const admin = await isAdmin(supabase);
      setAdmin(admin);

      // 2. Construir la consulta según el rol
      let query = supabase.from("posts").select("*, profiles(name)");

      if (!admin) {
        // Si es "Usuario", solo ve los suyos
        query = query.eq("author_id", user.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        // PostgrestError es una instancia de clase: sin estos campos el
        // overlay de Next solo muestra "{}" y se pierde la causa real.
        console.error("Error fetching posts:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        setError(error.message || "No se pudieron cargar los artículos.");
        setPosts([]);
        return;
      }

      setPosts(data ?? []);
    } catch (e) {
      // Fallo de red/timeout: supabase-js puede lanzar en vez de devolver error.
      console.error("Error fetching posts:", e);
      setError("No se pudieron cargar los artículos. Revisa tu conexión.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este artículo?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) setError(error.message);
    else fetchPosts();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const filtrados = posts.filter((post) => {
    if (filtro === "todos") return true;
    if (filtro === "por_revisar") {
      return post.status === POST_STATUS.inReview || post.needs_review;
    }
    if (filtro === "editados") return post.needs_review;
    return post.status === filtro;
  });

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: "space-between", alignItems: { xs: 'stretch', sm: "center" }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
            Gestión de Artículos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Escribe, edita y publica historias para la comunidad Literudo.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          component={Link}
          href="/admin/posts/new"
          sx={{
            borderRadius: 0,
            px: 2,
            py: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold',
            bgcolor: '#1a1a1a',
            alignSelf: { xs: 'stretch', sm: 'auto' },
            '&:hover': { bgcolor: '#000' }
          }}
        >
          Nuevo Artículo
        </Button>
      </Stack>

      {/* Error */}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Filtro por estado */}
      <Stack direction="row" spacing={1} useFlexGap sx={{ mb: 3, flexWrap: "wrap" }}>
        {FILTROS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            size="small"
            color={filtro === f.value ? "primary" : "default"}
            variant={filtro === f.value ? "filled" : "outlined"}
            onClick={() => setFiltro(f.value)}
            sx={{ borderRadius: 0, fontWeight: "bold" }}
          />
        ))}
      </Stack>

      {/* Desktop Table */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0, border: "1px solid #eee" }}>
          <Table sx={{ tableLayout: 'fixed' }}>
            <TableHead sx={{ bgcolor: "#f9f9f9" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: "32%" }}>Título</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "14%" }}>Autor</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "30%" }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: "12%" }}>Fecha</TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold", width: "12%" }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                    <Typography color="text.secondary">
                      {posts.length === 0 ? "No hay artículos escritos todavía." : "No hay artículos con este filtro."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((post) => (
                  <TableRow
                    key={post.id}
                    hover
                    onClick={() => router.push(`/admin/posts/${post.slug}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{post.title}</Typography>
                      <Typography variant="caption" color="text.secondary">/{post.slug}</Typography>
                    </TableCell>
                    <TableCell>{post.profiles?.name || "Desconocido"}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                        <Chip
                          label={POST_STATUS_LABEL[post.status] ?? post.status}
                          size="small"
                          color={POST_STATUS_COLOR[post.status] ?? "default"}
                          sx={{ borderRadius: 0, fontWeight: "bold" }}
                        />
                        {post.needs_review && (
                          <Chip
                            label="Editado"
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ borderRadius: 0, fontWeight: "bold" }}
                          />
                        )}
                        <ReviewActions
                          target="post"
                          id={post.id}
                          status={post.status}
                          needsReview={post.needs_review}
                          reviewNote={post.review_note}
                          isAdmin={admin}
                          onChanged={fetchPosts}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      {new Date(post.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <IconButton size="small" component={Link} href={`/admin/posts/${post.slug}`}>
                          <ViewIcon fontSize="small" />
                        </IconButton>
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

      {/* Mobile Cards */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {filtrados.length === 0 ? (
          <Paper elevation={0} sx={{ p: 4, borderRadius: 0, border: "1px solid #eee", textAlign: 'center' }}>
            <Typography color="text.secondary">
              {posts.length === 0 ? "No hay artículos escritos todavía." : "No hay artículos con este filtro."}
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1.5}>
            {filtrados.map((post) => (
              <Paper
                key={post.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 0,
                  border: "1px solid #eee",
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#f9f9f9' },
                }}
                onClick={() => router.push(`/admin/posts/${post.slug}`)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{post.title}</Typography>
                    <Typography variant="caption" color="text.secondary">/{post.slug}</Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, ml: 1 }}>
                    <Chip
                      label={POST_STATUS_LABEL[post.status] ?? post.status}
                      size="small"
                      color={POST_STATUS_COLOR[post.status] ?? "default"}
                      sx={{ borderRadius: 0, fontWeight: "bold" }}
                    />
                    {post.needs_review && (
                      <Chip label="Editado" size="small" color="warning" variant="outlined" sx={{ borderRadius: 0, fontWeight: "bold" }} />
                    )}
                  </Stack>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {post.profiles?.name || "Desconocido"} · {new Date(post.created_at).toLocaleDateString()}
                  </Typography>
                  <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" component={Link} href={`/admin/posts/${post.slug}`}>
                      <ViewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" component={Link} href={`/admin/posts/edit/${post.id}`}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(post.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
                <Box onClick={(e) => e.stopPropagation()} sx={{ mt: 1.5 }}>
                  <ReviewActions
                    target="post"
                    id={post.id}
                    status={post.status}
                    needsReview={post.needs_review}
                    reviewNote={post.review_note}
                    isAdmin={admin}
                    onChanged={fetchPosts}
                  />
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
