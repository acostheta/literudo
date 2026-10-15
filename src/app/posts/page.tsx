"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  TextField,
  InputAdornment,
  Stack,
  Chip,
} from "@mui/material";
import { Search as SearchIcon, AutoStories, ArrowBack } from "@mui/icons-material";

const SAMPLE_POSTS = [
  {
    title: "El Arte de la Brevedad en la Poesía Moderna",
    excerpt: "¿Cómo decir tanto en tan pocas palabras? Analizamos las tendencias actuales de la poesía minimalista y su impacto.",
    category: "Poesía",
    date: "20 de Marzo, 2026",
    slug: "arte-brevedad-poesia",
  },
  {
    title: "Realismo Mágico: Un Puente entre Realidad y Sueño",
    excerpt: "Desde García Márquez hasta Isabel Allende, exploramos el género que definió la literatura e identidad latinoamericana.",
    category: "Ensayo",
    date: "18 de Marzo, 2026",
    slug: "realismo-magico-puente",
  },
  {
    title: "Leer en la rutina diaria",
    excerpt: "Ideas prácticas para encontrar tiempo y constancia en la lectura fuera del horario de clases.",
    category: "Crónica",
    date: "15 de Marzo, 2026",
    slug: "cafe-y-libros",
  },
];

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  useEffect(() => {
    const fetchPosts = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("posts")
        .select("id, title, slug, excerpt, category, created_at")
        .eq("status", "publicado")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const ids = data.map((p) => p.id);
        const [{ data: counts }, { data: { user } }] = await Promise.all([
          supabase.rpc("get_counts", { p_target_ids: ids, p_target_type: "post" }),
          supabase.auth.getUser(),
        ]);
        const countMap = new Map<any, any>((counts || []).map((r: any) => [r.item_id, r]));
        const likedSet = new Set<string>();
        if (user) {
          const { data: mine } = await supabase
            .from("reactions")
            .select("target_id")
            .eq("user_id", user.id)
            .eq("target_type", "post")
            .in("target_id", ids);
          (mine || []).forEach((r: any) => likedSet.add(r.target_id));
        }

        const formatted = data.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt || "Sin resumen disponible...",
          category: p.category || "Literatura",
          comment_count: countMap.get(p.id)?.comments_n ?? 0,
          like_count: countMap.get(p.id)?.likes_n ?? 0,
          liked: likedSet.has(p.id),
          date: new Date(p.created_at).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        }));
        setPosts(formatted);
      } else {
        setPosts(SAMPLE_POSTS);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const categories = ["todas", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "todas" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 }, flex: 1 }}>
        {/* Navegación superior */}
        <Box sx={{ mb: 4 }}>
          <Link
            href="/"
            style={{
              color: "var(--foreground-muted)",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontFamily: "var(--font-serif)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "color 0.2s",
            }}
          >
            <ArrowBack sx={{ fontSize: 16 }} />
            <span>Volver al inicio</span>
          </Link>
        </Box>

        {/* Encabezado del Catálogo */}
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 7 } }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <AutoStories sx={{ color: "var(--primary)", fontSize: 20 }} />
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 3,
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.78rem",
              }}
            >
              Publicaciones
            </Typography>
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
              fontSize: { xs: "2.3rem", sm: "3.2rem", md: "4rem" },
              letterSpacing: "-0.01em",
              color: "var(--foreground)",
              mb: 2,
            }}
          >
            Artículos
          </Typography>

          <Typography
            sx={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: { xs: "1.05rem", md: "1.2rem" },
              color: "var(--foreground-muted)",
              maxWidth: 620,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Explora los artículos, ensayos y textos publicados por nuestra comunidad.
          </Typography>
        </Box>

        {/* Barra de Búsqueda y Filtros de Categoría */}
        <Box
          sx={{
            mb: 6,
            p: { xs: 2.5, md: 3 },
            bgcolor: "var(--background-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <Stack spacing={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por título, temática o palabra clave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "var(--foreground-muted)", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                bgcolor: "var(--background)",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "4px",
                  fontFamily: "var(--font-serif)",
                },
              }}
            />

            {categories.length > 2 && (
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat === "todas" ? "Todas las categorías" : cat}
                    onClick={() => setSelectedCategory(cat)}
                    size="small"
                    sx={{
                      bgcolor:
                        selectedCategory === cat
                          ? "var(--primary)"
                          : "var(--background-parchment)",
                      color: selectedCategory === cat ? "#fcf8f2" : "var(--foreground-muted)",
                      fontWeight: 600,
                      fontFamily: "var(--font-sans)",
                      border: "1px solid var(--border)",
                      "&:hover": {
                        bgcolor:
                          selectedCategory === cat
                            ? "var(--primary-hover)"
                            : "var(--background-warm)",
                      },
                    }}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Box>

        {/* Cuadrícula de Obras */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress sx={{ color: "var(--primary)" }} size={32} />
          </Box>
        ) : filteredPosts.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 10,
              bgcolor: "var(--background-card)",
              borderRadius: "4px",
              border: "1px dashed var(--border)",
            }}
          >
            <Typography sx={{ fontStyle: "italic", color: "var(--foreground-muted)", fontSize: "1.1rem" }}>
              No se encontraron artículos con esos términos.
            </Typography>
          </Box>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "2rem",
            }}
          >
            {filteredPosts.map((post) => (
              <PostCard key={post.slug} {...post} />
            ))}
          </div>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
