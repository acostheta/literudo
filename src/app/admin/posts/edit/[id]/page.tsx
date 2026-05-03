"use client";

import { useState, useEffect, use } from "react";
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
  CircularProgress,
  Link as MuiLink,
} from "@mui/material";
import { Save as SaveIcon, ArrowBack as BackIcon } from "@mui/icons-material";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@/components/admin/Editor"), { ssr: false });
import Link from "next/link";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState<any>(null);
  const [status, setStatus] = useState("borrador");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setExcerpt(data.excerpt || "");
        setContent(data.content);
        setStatus(data.status);
      } else if (error) {
        setError("No se pudo cargar el artículo: " + error.message);
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  const handleSave = async () => {
    if (!title || !slug || !content) {
      setError("Por favor completa el título y el contenido.");
      return;
    }

    setSaving(true);
    setError(null);

    const { error: saveError } = await supabase
      .from("posts")
      .update({
        title,
        slug,
        excerpt,
        content,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
    } else {
      router.push("/admin/posts");
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress color="inherit" size={30} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#fcfcfb', 
      py: 4 
    }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 8 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Breadcrumbs sx={{ mb: 1.5, '& .MuiBreadcrumbs-li': { fontSize: '0.7rem', letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.5 } }}>
                <MuiLink component={Link} href="/admin/posts" underline="hover" color="inherit">
                  Artículos
                </MuiLink>
                <Typography color="text.primary" sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Editar Obra</Typography>
              </Breadcrumbs>
              <Typography variant="h3" sx={{ 
                fontFamily: '"Lora", serif', 
                fontWeight: 800, 
                color: '#1a1a1a',
                letterSpacing: -1
              }}>
                Editar contenido
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
                Cancelar
              </MuiLink>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                onClick={handleSave}
                disabled={saving}
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
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </Stack>
          </Stack>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 0, border: '1px solid #ffcdd2', bgcolor: '#fff9f9' }}>{error}</Alert>}

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
            <TextField
              fullWidth
              variant="standard"
              placeholder="Título de la obra..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: { 
                    fontSize: { xs: '2.5rem', md: '3.5rem' }, 
                    fontWeight: 800,
                    fontFamily: '"Lora", serif',
                    lineHeight: 1.1,
                    color: '#1a1a1a',
                  }
                }
              }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#ccc', textTransform: 'uppercase', letterSpacing: 2 }}>
                Slug:
              </Typography>
              <TextField
                variant="standard"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                slotProps={{
                  input: {
                    disableUnderline: true,
                    sx: { fontSize: '0.8rem', color: 'primary.main', opacity: 0.7, fontStyle: 'italic' }
                  }
                }}
              />
            </Box>

            <Divider sx={{ my: 4, borderColor: '#f0f0f0' }} />

            <TextField
              fullWidth
              multiline
              rows={2}
              variant="standard"
              placeholder="Resumen..."
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
                  }
                }
              }}
            />

            <Box sx={{ pt: 4 }}>
              <Editor content={content} onChange={setContent} />
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
