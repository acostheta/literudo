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
  Select,
  MenuItem,
  FormControl,
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
  const [status, setStatus] = useState("borrador");
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
      status,
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
      bgcolor: '#fcfcfb', // Un blanco roto más cálido
      py: 4 
    }}>
      <Container maxWidth="md">
        {/* Cabecera Minimalista */}
        <Box sx={{ mb: 8 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Breadcrumbs sx={{ mb: 1.5, '& .MuiBreadcrumbs-li': { fontSize: '0.7rem', letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.5 } }}>
                <MuiLink component={Link} href="/admin/posts" underline="hover" color="inherit">
                  Artículos
                </MuiLink>
                <Typography color="text.primary" sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Nueva Obra</Typography>
              </Breadcrumbs>
              <Typography variant="h3" sx={{ 
                fontFamily: '"Lora", serif', 
                fontWeight: 800, 
                color: '#1a1a1a',
                letterSpacing: -1
              }}>
                Crear contenido
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
              <FormControl size="small" variant="standard">
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  sx={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold', 
                    color: status === "publicado" ? "success.main" : "text.secondary",
                    '&:before, &:after': { display: 'none' }
                  }}
                >
                  <MenuItem value="borrador">Borrador</MenuItem>
                  <MenuItem value="publicado">Publicado</MenuItem>
                </Select>
              </FormControl>

              <MuiLink 
                component="button"
                onClick={() => router.back()}
                sx={{ 
                  color: 'text.secondary', 
                  fontSize: '0.9rem', 
                  textDecoration: 'none',
                  '&:hover': { color: 'error.main' } 
                }}
              >
                Cerrar
              </MuiLink>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={loading}
                sx={{ 
                  borderRadius: 0, 
                  px: 4, 
                  py: 1.2,
                  bgcolor: '#1a1a1a',
                  boxShadow: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  '&:hover': { bgcolor: '#000', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }
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
            border: '1px solid #eee',
            boxShadow: '0 10px 40px rgba(0,0,0,0.02)',
            position: 'relative',
          }}
        >
          <Stack spacing={2}>
            {/* Título Principal */}
            <TextField
              fullWidth
              variant="standard"
              placeholder="Escribe el título aquí..."
              value={title}
              onChange={handleTitleChange}
              autoFocus
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: { 
                    fontSize: { xs: '2.5rem', md: '3.5rem' }, 
                    fontWeight: 800,
                    fontFamily: '"Lora", serif',
                    lineHeight: 1.1,
                    color: '#1a1a1a',
                    '& input::placeholder': { opacity: 0.15, fontStyle: 'normal' }
                  }
                }
              }}
            />
            
            {/* Slug y Meta info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#ccc', textTransform: 'uppercase', letterSpacing: 2 }}>
                Enlace:
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: 'primary.main', opacity: 0.7, fontStyle: 'italic' }}>
                literudo.com/blog/{slug || '...'}
              </Typography>
            </Box>

            <Divider sx={{ my: 4, borderColor: '#f0f0f0' }} />

            {/* Resumen / Bajada de título */}
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="standard"
              placeholder="Añade un breve resumen que atrape al lector..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: { 
                    fontSize: '1.4rem', 
                    fontFamily: '"Lora", serif',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    color: '#555',
                    '& textarea::placeholder': { opacity: 0.3 }
                  }
                }
              }}
            />

            <Box sx={{ pt: 4 }}>
              <Editor onChange={setContent} />
            </Box>
          </Stack>
        </Paper>

        {/* Footer info */}
        <Box sx={{ mt: 6, display: 'flex', justifyContent: 'center', opacity: 0.2 }}>
          <Typography variant="caption" sx={{ letterSpacing: 4, textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 700 }}>
            Literudo Editorial Engine — v1.0
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

import { CircularProgress } from "@mui/material";
