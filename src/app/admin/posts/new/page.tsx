"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Container,
  TextField,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  Breadcrumbs,
  Divider,
  Link as MuiLink,
} from "@mui/material";
import { Save as SaveIcon, ArrowBack as BackIcon } from "@mui/icons-material";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@/components/admin/Editor"), { ssr: false });
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generar slug automático a partir del título
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  const handleSave = async () => {
    if (!title || !slug || !content) {
      setError("Por favor completa el título y el contenido.");
      return;
    }

    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();

    const { error: saveError } = await supabase.from("posts").insert({
      title,
      slug,
      excerpt,
      content,
      author_id: user?.id,
      status: "borrador",
    });

    if (saveError) {
      setError(saveError.message);
      setLoading(false);
    } else {
      router.push("/admin/posts");
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} href="/admin/posts" underline="hover" color="inherit">
            Artículos
          </MuiLink>
          <Typography color="text.primary">Nuevo Artículo</Typography>
        </Breadcrumbs>
        
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Escribir Artículo
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => router.back()}
              sx={{ borderRadius: 0 }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{ borderRadius: 0, px: 4 }}
            >
              {loading ? "Guardando..." : "Guardar Borrador"}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>{error}</Alert>}

      <Stack spacing={3}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 0, border: "1px solid #eee" }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              variant="standard"
              placeholder="Título del Artículo"
              value={title}
              onChange={handleTitleChange}
              InputProps={{
                sx: { 
                  fontSize: '2.5rem', 
                  fontWeight: 700,
                  fontFamily: '"Lora", serif',
                  '&:before, &:after': { display: 'none' }
                }
              }}
            />
            
            <TextField
              fullWidth
              variant="standard"
              placeholder="URL amigable (slug)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, opacity: 0.5 }}>literudo.com/blog/</Typography>,
                sx: { fontSize: '0.9rem', color: 'text.secondary', '&:before, &:after': { display: 'none' } }
              }}
            />

            <Divider />

            <TextField
              fullWidth
              multiline
              rows={2}
              variant="standard"
              placeholder="Resumen corto (opcional)"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              InputProps={{
                sx: { fontSize: '1.1rem', fontStyle: 'italic', '&:before, &:after': { display: 'none' } }
              }}
            />
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: 4, borderRadius: 0, border: "1px solid #eee", minHeight: 600 }}>
          <Editor onChange={setContent} />
        </Paper>
      </Stack>
    </Container>
  );
}
