"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Article as PostIcon,
} from "@mui/icons-material";
// import PostFormModal from "@/components/PostFormModal"; // We will create this next

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  created_at: string;
  cover_url?: string;
  author_id: string;
  profiles?: {
    name: string;
  };
}

export default function PostsPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select(`
        *,
        profiles (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) console.error("Error:", error);
    else setPosts(data || []);
    setLoading(false);
  };

  const deletePost = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este post?")) {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) alert(error.message);
      else fetchPosts();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" sx={{ mb: 4, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main", flexGrow: 1 }}>
          Artículos del Blog
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => alert("Próximamente: Modal de creación")}
        >
          Nuevo Artículo
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650, tableLayout: 'fixed' }}>
          <TableHead sx={{ backgroundColor: "grey.100" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "45%", py: 2 }}>Artículo</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "15%", py: 2 }}>Categoría</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "15%", py: 2 }}>Estatus</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "15%", py: 2 }}>Autor</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: "10%", py: 2 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
            ) : posts.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 5 }}>No hay artículos todavía.</TableCell></TableRow>
            ) : (
              posts.map((post) => (
                <TableRow key={post.id} hover>
                  <TableCell sx={{ py: 2, width: "45%" }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box 
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          bgcolor: 'grey.200', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        {post.cover_url ? (
                          <img src={post.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <PostIcon color="action" />
                        )}
                      </Box>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{post.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>{post.slug}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2, width: "15%" }}>
                    <Chip label={post.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2, width: "15%" }}>
                    <Chip 
                      label={post.status} 
                      size="small" 
                      color={post.status === "publicado" ? "success" : "warning"} 
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2, width: "15%" }}>
                    <Typography variant="caption">{post.profiles?.name || "Anónimo"}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2, width: "10%" }}>
                    <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                      <IconButton size="small" color="primary">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => deletePost(post.id)}>
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
    </Container>
  );
}
