"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import { GalleryPost } from "@/lib/types/gallery";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
} from "@mui/material";
import { PhotoCamera, ArrowBack, Collections } from "@mui/icons-material";

export default function GalleryListPage() {
  const [galleries, setGalleries] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const fetchGalleries = async () => {
      const { data: posts } = await supabaseRef.current
        .from("gallery_posts")
        .select("*")
        .eq("status", "publicado")
        .order("created_at", { ascending: false });

      if (posts && posts.length > 0) {
        const authorIds = [...new Set(posts.map((p) => p.author_id))];
        const { data: profiles } = await supabaseRef.current
          .from("profiles")
          .select("id, name")
          .in("id", authorIds);

        const profileMap: Record<string, string> = {};
        profiles?.forEach((p) => {
          profileMap[p.id] = p.name;
        });

        const postIds = posts.map((p) => p.id);
        const [{ data: images }, { data: embeds }] = await Promise.all([
          supabaseRef.current
            .from("gallery_images")
            .select("gallery_post_id, image_url, caption, description")
            .in("gallery_post_id", postIds),
          supabaseRef.current
            .from("gallery_embeds")
            .select("gallery_post_id")
            .in("gallery_post_id", postIds),
        ]);

        const coverMap: Record<string, string> = {};
        const countMap: Record<string, number> = {};

        images?.forEach((img) => {
          if (!coverMap[img.gallery_post_id]) {
            coverMap[img.gallery_post_id] = img.image_url;
          }
          countMap[img.gallery_post_id] = (countMap[img.gallery_post_id] || 0) + 1;
        });

        embeds?.forEach((emb) => {
          countMap[emb.gallery_post_id] = (countMap[emb.gallery_post_id] || 0) + 1;
        });

        const enriched = posts.map((p) => ({
          ...p,
          profiles: { name: profileMap[p.author_id] || "Anónimo" },
          gallery_images: coverMap[p.id] ? [{ image_url: coverMap[p.id] }] : [],
          _itemCount: countMap[p.id] || 0,
        }));

        setGalleries(enriched);
      } else {
        setGalleries(posts || []);
      }
      setLoading(false);
    };

    fetchGalleries();
  }, []);

  return (
    <Box sx={{ bgcolor: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 }, flex: 1 }}>
        {/* Enlace de Retorno */}
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

        {/* Encabezado del Gabinete */}
        <Box sx={{ textAlign: "center", mb: { xs: 5, md: 8 } }}>
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1, mb: 1.5 }}>
            <PhotoCamera sx={{ color: "var(--accent-text)", fontSize: 20 }} />
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 3,
                color: "var(--accent-text)",
                fontWeight: 700,
                fontSize: "0.78rem",
              }}
            >
              Galería
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
            Galería
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
            Imágenes, videos y audios creados por nuestra comunidad.
          </Typography>
        </Box>

        {/* Listado de Galerías */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
            <CircularProgress sx={{ color: "var(--primary)" }} size={32} />
          </Box>
        ) : galleries.length === 0 ? (
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
            <Collections sx={{ fontSize: 44, color: "var(--accent)", mb: 2, opacity: 0.6 }} />
            <Typography variant="h5" sx={{ mb: 1, color: "var(--foreground)" }}>
              Aún no hay galerías
            </Typography>
            <Typography sx={{ fontStyle: "italic", color: "var(--foreground-muted)" }}>
              Pronto se publicarán nuevas galerías.
            </Typography>
          </Box>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "2.5rem",
            }}
          >
            {galleries.map((gallery) => {
              const coverImage = gallery.gallery_images?.[0]?.image_url;
              const itemCount = (gallery as any)._itemCount || 0;

              return (
                <Link
                  key={gallery.id}
                  href={`/gallery/${gallery.slug}`}
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <article
                    className="book-card"
                    style={{
                      height: "100%",
                      backgroundColor: "var(--background-card)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "var(--card-shadow)",
                      transition: "var(--transition)",
                    }}
                  >
                    {/* Cuadro / Marco de Imagen */}
                    <div
                      style={{
                        width: "100%",
                        height: "230px",
                        backgroundColor: "#eee4d3",
                        backgroundImage: coverImage ? `url(${coverImage})` : "none",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderBottom: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {!coverImage && (
                        <PhotoCamera sx={{ color: "var(--accent)", fontSize: 40, opacity: 0.4 }} />
                      )}
                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                          background: "rgba(36, 24, 18, 0.75)",
                          backdropFilter: "blur(4px)",
                          color: "#fcf8f2",
                          fontSize: "0.72rem",
                          fontFamily: "var(--font-sans)",
                          fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: "3px",
                        }}
                      >
                        {itemCount} {itemCount === 1 ? "elemento" : "elementos"}
                      </div>
                    </div>

                    {/* Ficha descriptiva */}
                    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flex: 1 }}>
                      <h2
                        style={{
                          fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
                          fontSize: "1.35rem",
                          fontWeight: 700,
                          lineHeight: 1.3,
                          marginBottom: "0.6rem",
                          color: "var(--foreground)",
                        }}
                      >
                        {gallery.title}
                      </h2>

                      {gallery.description && (
                        <p
                          style={{
                            fontFamily: "var(--font-serif)",
                            fontSize: "0.92rem",
                            color: "var(--foreground-muted)",
                            lineHeight: 1.6,
                            marginBottom: "1.2rem",
                            fontStyle: "italic",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {gallery.description}
                        </p>
                      )}

                      <div
                        style={{
                          marginTop: "auto",
                          paddingTop: "0.8rem",
                          borderTop: "1px solid var(--border-light)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.8rem",
                          color: "var(--foreground-faint)",
                          fontFamily: "var(--font-sans)",
                        }}
                      >
                        <span>{gallery.profiles?.name || "Anónimo"}</span>
                        <span>
                          {new Date(gallery.created_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </Container>

      <Footer />
    </Box>
  );
}
