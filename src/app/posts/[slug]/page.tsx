"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommentSection from "@/components/comments/CommentSection";
import PostEngagement from "@/components/engagement/PostEngagement";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Container,
  Typography,
  Stack,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  AutoStories,
  PersonOutlined,
  CalendarToday,
} from "@mui/icons-material";

// Renderizador tipográfico literario para contenido TipTap
const PublicPoeticRenderer = ({ content }: { content: any }) => {
  if (!content) return null;

  const renderNode = (node: any, index: number): React.ReactNode => {
    if (!node) return null;
    const key = `${node.type}-${index}`;

    switch (node.type) {
      case "doc":
        return node.content?.map((child: any, i: number) => renderNode(child, i));

      case "heading": {
        const level = node.attrs?.level || 1;
        return (
          <Typography
            key={key}
            variant={`h${level}` as any}
            sx={{
              fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
              fontWeight: 700,
              mt: level === 1 ? 7 : level === 2 ? 5 : 4,
              mb: 2.5,
              textAlign: level === 1 ? "center" : "left",
              lineHeight: 1.25,
              color: "var(--foreground)",
              fontSize:
                level === 1
                  ? { xs: "2.1rem", md: "2.8rem" }
                  : level === 2
                  ? { xs: "1.6rem", md: "2rem" }
                  : { xs: "1.3rem", md: "1.5rem" },
            }}
          >
            {node.content?.map((child: any, i: number) => renderNode(child, i))}
          </Typography>
        );
      }

      case "paragraph":
        return (
          <Typography
            key={key}
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: { xs: "1.1rem", md: "1.2rem" },
              lineHeight: 2.1,
              mb: 3.5,
              color: "#2a1e18",
              textAlign: "justify",
              textJustify: "inter-word",
              letterSpacing: "0.01em",
            }}
          >
            {node.content?.map((child: any, i: number) => renderNode(child, i))}
          </Typography>
        );

      case "blockquote":
        return (
          <Box
            key={key}
            sx={{
              my: 5,
              py: 2,
              px: { xs: 3, md: 5 },
              borderLeft: "3px solid var(--primary)",
              fontStyle: "italic",
              bgcolor: "rgba(107, 29, 34, 0.04)",
              borderRadius: "0 4px 4px 0",
              borderTop: "1px solid var(--border-light)",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "1.25rem", md: "1.45rem" },
                fontFamily: "var(--font-serif)",
                color: "var(--foreground)",
                lineHeight: 1.7,
              }}
            >
              {node.content?.map((child: any, i: number) => renderNode(child, i))}
            </Typography>
          </Box>
        );

      case "text": {
        let text: React.ReactNode = node.text;
        if (node.marks) {
          node.marks.forEach((mark: any) => {
            if (mark.type === "bold") text = <strong style={{ fontWeight: 800 }}>{text}</strong>;
            if (mark.type === "italic") text = <em style={{ fontStyle: "italic" }}>{text}</em>;
            if (mark.type === "underline") text = <u style={{ textDecoration: "underline" }}>{text}</u>;
            if (mark.type === "highlight")
              text = (
                <mark
                  style={{
                    backgroundColor: "rgba(212, 155, 56, 0.25)",
                    color: "inherit",
                    padding: "0 4px",
                    borderRadius: "2px",
                  }}
                >
                  {text}
                </mark>
              );
            if (mark.type === "link")
              text = (
                <a
                  href={mark.attrs.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--primary)", textDecoration: "underline" }}
                >
                  {text}
                </a>
              );
          });
        }
        return <span key={key}>{text}</span>;
      }

      case "bulletList":
        return (
          <ul
            key={key}
            style={{
              paddingLeft: "2.5rem",
              marginBottom: "2.5rem",
              listStyleType: "circle",
              color: "var(--foreground)",
            }}
          >
            {node.content?.map((child: any, i: number) => renderNode(child, i))}
          </ul>
        );

      case "listItem":
        return (
          <li
            key={key}
            style={{
              marginBottom: "1rem",
              fontFamily: "var(--font-serif)",
              fontSize: "1.1rem",
              lineHeight: 1.9,
              color: "#2a1e18",
            }}
          >
            {node.content?.map((child: any, i: number) => renderNode(child, i))}
          </li>
        );

      case "horizontalRule":
        return (
          <Box key={key} sx={{ display: "flex", alignItems: "center", justifyContent: "center", my: 8, gap: 2 }}>
            <span style={{ height: "1px", width: "60px", background: "var(--border)" }} />
            <span style={{ color: "var(--accent)", fontSize: "1.2rem" }}>❧</span>
            <span style={{ height: "1px", width: "60px", background: "var(--border)" }} />
          </Box>
        );

      default:
        return null;
    }
  };

  return <Box>{renderNode(content, 0)}</Box>;
};

export default function PublicPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchPost = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*, profiles(name, avatar_url)")
        .eq("slug", slug)
        .eq("status", "publicado")
        .single();

      if (data) setPost(data);
      setLoading(false);
    };

    fetchPost();
  }, [slug, supabase]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "var(--background)", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", py: 12 }}>
          <CircularProgress sx={{ color: "var(--primary)" }} size={32} />
        </Box>
        <Footer />
      </Box>
    );
  }

  if (!post) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "var(--background)", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <Container maxWidth="sm" sx={{ py: 15, textAlign: "center", flex: 1 }}>
          <AutoStories sx={{ fontSize: 50, color: "var(--accent)", mb: 2, opacity: 0.7 }} />
          <Typography
            variant="h3"
            sx={{
              fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
              mb: 2,
              color: "var(--foreground)",
            }}
          >
            Página no encontrada
          </Typography>
          <Typography sx={{ mb: 5, color: "var(--foreground-muted)", fontFamily: "var(--font-serif)" }}>
            El artículo que buscas no existe o aún no ha sido publicado.
          </Typography>
          <Button
            component={Link}
            href="/"
            variant="outlined"
            sx={{
              borderColor: "var(--primary)",
              color: "var(--primary)",
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
            }}
          >
            Volver al inicio
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 }, flex: 1 }}>
        {/* Navegación Retorno */}
        <Box sx={{ mb: 4 }}>
          <Link
            href="/posts"
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
            <BackIcon sx={{ fontSize: 16 }} />
            <span>Volver a los artículos</span>
          </Link>
        </Box>

        {/* Folio de Lectura (Papel Pergamino de Biblioteca) */}
        <Box
          component="article"
          sx={{
            bgcolor: "var(--background-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            boxShadow: "0 6px 30px -4px rgba(60, 40, 25, 0.08)",
            p: { xs: 3.5, sm: 6, md: 8 },
            position: "relative",
          }}
        >
          {/* Sello de Sección / Categoría */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", justifyContent: "center", mb: 3 }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--primary)",
                background: "var(--primary-faint)",
                border: "1px solid rgba(107, 29, 34, 0.2)",
                padding: "4px 12px",
                borderRadius: "3px",
              }}
            >
              {post.category || "Sin categoría"}
            </span>
          </Stack>

          {/* Título de la Obra */}
          <Typography
            variant="h1"
            sx={{
              fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
              fontWeight: 800,
              fontSize: { xs: "2.4rem", sm: "3.2rem", md: "4rem" },
              textAlign: "center",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              color: "var(--foreground)",
              mb: 3,
            }}
          >
            {post.title}
          </Typography>

          {/* Datos del Autor y Fecha */}
          <Stack
            direction="row"
            spacing={3}
            sx={{
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              color: "var(--foreground-muted)",
              fontFamily: "var(--font-sans)",
              fontSize: "0.85rem",
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <PersonOutlined sx={{ fontSize: 16, color: "var(--primary)" }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {post.profiles?.name || "Anónimo"}
              </Typography>
            </Box>

            <span>·</span>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
              <CalendarToday sx={{ fontSize: 15, color: "var(--accent-text)" }} />
              <Typography variant="body2">
                {new Date(post.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </Typography>
            </Box>
          </Stack>

          {/* Divisor Ornamental */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", my: 5, gap: 2 }}>
            <span style={{ height: "1px", width: "40px", background: "var(--border)" }} />
            <span style={{ color: "var(--accent)", fontSize: "1.1rem" }}>❦</span>
            <span style={{ height: "1px", width: "40px", background: "var(--border)" }} />
          </Box>

          {/* Resumen / Epígrafe */}
          {post.excerpt && (
            <Typography
              sx={{
                fontFamily: "var(--font-serif)",
                fontSize: { xs: "1.2rem", md: "1.35rem" },
                fontStyle: "italic",
                textAlign: "center",
                color: "var(--foreground-muted)",
                lineHeight: 1.75,
                maxWidth: "680px",
                mx: "auto",
                mb: 6,
                px: { xs: 1, md: 3 },
              }}
            >
              «{post.excerpt}»
            </Typography>
          )}

          {/* Cuerpo Principal del Manuscrito */}
          <Box sx={{ width: "100%", mt: 4 }}>
            <PublicPoeticRenderer content={post.content} />
          </Box>

          {/* Colofón Final / Ex-Libris */}
          <Box
            sx={{
              mt: 10,
              pt: 5,
              borderTop: "1px solid var(--border)",
              textAlign: "center",
              bgcolor: "var(--background-warm)",
              borderRadius: "4px",
              p: 4,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                letterSpacing: 3,
                textTransform: "uppercase",
                color: "var(--accent-text)",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                display: "block",
                mb: 1,
              }}
            >
              Fin del artículo
            </Typography>

            <Typography
              sx={{
                fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "var(--foreground)",
                mb: 0.5,
              }}
            >
              {post.profiles?.name || "Anónimo"}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "var(--foreground-muted)",
                fontStyle: "italic",
                fontFamily: "var(--font-serif)",
              }}
            >
              Publicado el{" "}
              {new Date(post.created_at).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Typography>
          </Box>
        </Box>

        {/* Sección de Discusión y Comentarios */}
        <Box sx={{ mt: 8, bgcolor: "var(--background-card)", p: { xs: 3, sm: 5 }, borderRadius: "4px", border: "1px solid var(--border)" }}>
          <PostEngagement
            targetId={post.id}
            targetType="post"
            url={`/posts/${post.slug}`}
            title={post.title}
          />
          <CommentSection postId={post.id} />
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
