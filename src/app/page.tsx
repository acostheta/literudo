import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FeedCard from "@/components/FeedCard";
import {
  Box,
  Container,
  Typography,
  Stack,
} from "@mui/material";
import { AutoStories } from "@mui/icons-material";

interface FeedItem {
  id: string;
  type: "post" | "gallery";
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  created_at: string;
  author: { name: string | null; avatar_url: string | null } | null;
  cover_url: string | null;
  image_count: number;
  embed_count: number;
  comment_count: number;
  like_count: number;
  liked: boolean;
}

export default async function Home() {
  // Se consulta en el servidor: el usuario recibe el HTML con el feed ya
  // pintado, sin esperar el viaje navegador->Supabase (~400 ms).
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_home_feed");
  if (error) console.error("get_home_feed:", error);

  const items: FeedItem[] = (data || []).map((r: any) => ({
    id: r.item_id,
    type: r.item_type,
    title: r.title,
    slug: r.slug,
    excerpt: r.excerpt,
    description: r.description,
    created_at: r.created_at,
    author: r.author_name
      ? { name: r.author_name, avatar_url: r.author_avatar }
      : null,
    cover_url: r.cover_url,
    image_count: r.image_count,
    embed_count: r.embed_count,
    comment_count: r.comments_n,
    like_count: r.likes_n,
    liked: r.liked,
  }));

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Frontispicio de la Biblioteca */}
      <Box
        component="section"
        sx={{
          pt: { xs: 6, md: 9 },
          pb: { xs: 5, md: 7 },
          textAlign: "center",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          bgcolor: "var(--background-warm)",
          backgroundImage: "radial-gradient(#e0d2c0 0.8px, transparent 0.8px)",
          backgroundSize: "24px 24px",
        }}
      >
        <Container maxWidth="md">
          {/* Lema Universitario */}
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, mb: 2 }}>
            <span style={{ height: "1px", width: "24px", background: "var(--accent)" }} />
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 3,
                color: "var(--accent-text)",
                fontWeight: 700,
                fontSize: "0.75rem",
              }}
            >
              Agrupación Estudiantil · Universidad de Oriente
            </Typography>
            <span style={{ height: "1px", width: "24px", background: "var(--accent)" }} />
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
              fontWeight: 800,
              fontSize: { xs: "2.75rem", sm: "3.75rem", md: "5rem" },
              letterSpacing: "-0.01em",
              color: "var(--foreground)",
              lineHeight: 1.08,
              mb: 2,
            }}
          >
            Literudo
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: { xs: "1.1rem", md: "1.35rem" },
              color: "var(--foreground-muted)",
              maxWidth: "680px",
              mx: "auto",
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            Artículos, poesía, ensayos y galería visual de la comunidad de la Universidad de Oriente.
          </Typography>
        </Container>
      </Box>

      {/* Catálogo de Obras */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 }, flex: 1 }}>
        {items.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 12,
              px: 3,
              bgcolor: "var(--background-card)",
              borderRadius: "4px",
              border: "1px dashed var(--border)",
            }}
          >
            <AutoStories sx={{ fontSize: 44, color: "var(--accent)", mb: 2, opacity: 0.6 }} />
            <Typography variant="h5" sx={{ mb: 1, color: "var(--foreground)" }}>
              Aún no hay publicaciones
            </Typography>
            <Typography sx={{ fontStyle: "italic", color: "var(--foreground-muted)", maxWidth: 440, mx: "auto" }}>
              No hay publicaciones todavía. Vuelve pronto.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={{ xs: 3, md: 4 }}>
            {items.map((item) => (
              <FeedCard
                key={`${item.type}-${item.id}`}
                id={item.id}
                type={item.type}
                title={item.title}
                slug={item.slug}
                text={
                  item.type === "gallery"
                    ? item.description || "Imágenes y videos de la comunidad universitaria."
                    : item.excerpt || "Sin resumen disponible para esta entrada..."
                }
                date={new Date(item.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "America/Caracas",
                })}
                coverUrl={item.type === "gallery" ? item.cover_url : null}
                author={item.author}
                itemCount={
                  item.type === "gallery" ? item.image_count + item.embed_count : undefined
                }
                commentCount={item.comment_count}
                likeCount={item.like_count}
                liked={item.liked}
              />
            ))}
          </Stack>
        )}
      </Container>

      <Footer />
    </Box>
  );
}