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
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#fafafa', // Gris muy claro para resaltar el papel
      py: 6 
    }}>
      <Container maxWidth="md">
        {/* Cabecera Minimalista */}
        <Box sx={{ mb: 6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Breadcrumbs sx={{ mb: 1, '& .MuiBreadcrumbs-li': { fontSize: '0.8rem', letterSpacing: 1, textTransform: 'uppercase', opacity: 0.6 } }}>
                <MuiLink component={Link} href="/admin/posts" underline="hover" color="inherit">
                  Artículos
                </MuiLink>
                <Typography color="text.primary" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>Nueva Obra</Typography>
              </Breadcrumbs>
              <Typography variant="h3" sx={{ 
                fontFamily: '"Lora", serif', 
                fontWeight: 700, 
                color: '#1a1a1a',
                letterSpacing: -0.5
              }}>
                Crear contenido
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="text"
                onClick={() => router.back()}
                sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
              >
                Cerrar
              </Button>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={loading}
                sx={{ 
                  borderRadius: 0, 
                  px: 4, 
                  py: 1,
                  bgcolor: '#1a1a1a',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#333', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                }}
              >
                {loading ? "Guardando..." : "Publicar"}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 0, border: '1px solid #ffcdd2', bgcolor: '#fff9f9' }}>{error}</Alert>}

        {/* El Papel (Documento) */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 4, md: 10 }, 
            borderRadius: 0, 
            bgcolor: 'white',
            border: '1px solid #e0e0e0',
            boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
            position: 'relative',
            '&::before': { // Efecto de borde sutil para parecer papel
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              bgcolor: 'primary.main',
              opacity: 0.8
            }
          }}
        >
          <Stack spacing={4}>
            {/* Título Principal */}
            <TextField
              fullWidth
              variant="standard"
              placeholder="Escribe el título aquí..."
              value={title}
              onChange={handleTitleChange}
              InputProps={{
                sx: { 
                  fontSize: { xs: '2.5rem', md: '3.5rem' }, 
                  fontWeight: 800,
                  fontFamily: '"Lora", serif',
                  lineHeight: 1.2,
                  color: '#1a1a1a',
                  '&:before, &:after': { display: 'none' },
                  '& input::placeholder': { opacity: 0.2, fontStyle: 'italic' }
                }
              }}
            />
            
            {/* Slug y Meta info */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ 
                px: 1.5, 
                py: 0.5, 
                bgcolor: '#f5f5f5', 
                borderRadius: 1, 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 1 }}>
                  Slug:
                </Typography>
                <Typography sx={{ fontSize: '0.85rem', color: 'primary.main', fontStyle: 'italic' }}>
                  literudo.com/blog/{slug || '...'}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2, opacity: 0.5 }} />

            {/* Resumen / Bajada de título */}
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="standard"
              placeholder="Añade un breve resumen que atrape al lector..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              InputProps={{
                sx: { 
                  fontSize: '1.25rem', 
                  fontFamily: '"Lora", serif',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  color: '#666',
                  '&:before, &:after': { display: 'none' },
                  '& textarea::placeholder': { opacity: 0.4 }
                }
              }}
            />

            <Box sx={{ py: 4 }}>
              <Editor onChange={setContent} />
            </Box>
          </Stack>
        </Paper>

        {/* Footer info */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', opacity: 0.3 }}>
          <Typography variant="caption" sx={{ letterSpacing: 2, textTransform: 'uppercase' }}>
            Literudo Editorial Engine
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

import { CircularProgress } from "@mui/material";
