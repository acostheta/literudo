"use client";

import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ArrowForward, AutoStories, PhotoCamera } from "@mui/icons-material";
import PostEngagement from "@/components/engagement/PostEngagement";

interface FeedCardProps {
  id?: string;
  type: "post" | "gallery";
  title: string;
  slug: string;
  text: string;
  date: string;
  coverUrl?: string | null;
  itemCount?: number;
  commentCount?: number;
  likeCount?: number;
  liked?: boolean;
  compact?: boolean;
}

// Tarjeta blanca compartida por portada, /posts y /gallery.
export default function FeedCard({
  id,
  type,
  title,
  slug,
  text,
  date,
  coverUrl,
  itemCount,
  commentCount,
  likeCount,
  liked,
  compact = false,
}: FeedCardProps) {
  const isGallery = type === "gallery";
  const href = isGallery ? `/gallery/${slug}` : `/posts/${slug}`;

  return (
    <Box
      component="article"
      className="book-card"
      sx={{
        p: compact ? { xs: 2.5, sm: 3 } : { xs: 3, sm: 4, md: 5 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#ffffff",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        boxShadow: "0 3px 14px -2px rgba(60, 40, 25, 0.10), 0 1px 2px rgba(60, 40, 25, 0.06)",
        position: "relative",
        transition: "var(--transition)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "4px",
          bgcolor: isGallery ? "var(--accent)" : "var(--primary)",
        },
      }}
    >
      {/* Meta superior */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.2rem 0.6rem",
              borderRadius: "3px",
              fontSize: "0.72rem",
              fontWeight: 700,
              fontFamily: "var(--font-sans)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              backgroundColor: isGallery ? "var(--accent-faint)" : "var(--primary-faint)",
              color: isGallery ? "var(--accent)" : "var(--primary)",
              border: `1px solid ${
                isGallery ? "rgba(184, 130, 40, 0.3)" : "rgba(107, 29, 34, 0.2)"
              }`,
            }}
          >
            {isGallery ? (
              <>
                <PhotoCamera sx={{ fontSize: 13 }} />
                Galería
              </>
            ) : (
              <>
                <AutoStories sx={{ fontSize: 13 }} />
                Artículo
              </>
            )}
          </span>

          {isGallery && itemCount !== undefined && (
            <Typography
              variant="caption"
              sx={{ color: "var(--foreground-faint)", fontSize: "0.78rem" }}
            >
              · {itemCount} elementos
            </Typography>
          )}
        </Box>

        <Typography
          variant="caption"
          sx={{
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--foreground-faint)",
            fontFamily: "var(--font-sans)",
            fontSize: "0.75rem",
          }}
        >
          {date}
        </Typography>
      </Stack>

      {/* Portada para galerías */}
      {isGallery && coverUrl && (
        <Box
          component={Link}
          href={href}
          sx={{
            display: "block",
            width: "100%",
            height: compact ? 200 : { xs: 220, md: 320 },
            backgroundImage: `url(${coverUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: "3px",
            border: "1px solid var(--border)",
            mb: 3,
            textDecoration: "none",
            transition: "opacity 0.25s, transform 0.25s",
            "&:hover": { opacity: 0.92, transform: "scale(1.005)" },
          }}
        />
      )}

      {/* Título */}
      <Typography
        variant="h3"
        component={Link}
        href={href}
        sx={{
          fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
          fontWeight: 700,
          fontSize: compact
            ? { xs: "1.4rem", sm: "1.55rem" }
            : { xs: "1.65rem", sm: "2rem", md: "2.35rem" },
          lineHeight: 1.22,
          textDecoration: "none",
          color: "var(--foreground)",
          display: "block",
          mb: 2,
          transition: "color 0.2s",
          "&:hover": { color: "var(--primary)" },
        }}
      >
        {title}
      </Typography>

      {/* Resumen o descripción */}
      <Typography
        sx={{
          fontFamily: "var(--font-serif)",
          fontSize: compact ? "0.98rem" : { xs: "1.02rem", md: "1.12rem" },
          color: "var(--foreground-muted)",
          lineHeight: 1.8,
          mb: compact ? 2 : 3,
        }}
      >
        {text}
      </Typography>

      {/* Enlace */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", mt: "auto" }}>
        <Button
          component={Link}
          href={href}
          endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
          sx={{
            color: "var(--primary)",
            fontWeight: 700,
            fontFamily: "var(--font-serif)",
            fontSize: "0.95rem",
            fontStyle: "italic",
            px: 0,
            "&:hover": {
              bgcolor: "transparent",
              color: "var(--primary-hover)",
              transform: "translateX(4px)",
            },
            transition: "all 0.2s",
          }}
        >
          {isGallery ? "Ver galería" : "Leer más"}
        </Button>
      </Box>

      {id && (
        <PostEngagement
          targetId={id}
          targetType={type}
          commentCount={commentCount}
          likeCount={likeCount}
          liked={liked}
          url={href}
          title={title}
        />
      )}
    </Box>
  );
}
