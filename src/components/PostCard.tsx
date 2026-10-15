"use client";

import Link from "next/link";
import { ArrowForward, AutoStories } from "@mui/icons-material";
import PostEngagement from "@/components/engagement/PostEngagement";

interface PostCardProps {
  id?: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  slug: string;
  comment_count?: number;
  like_count?: number;
  liked?: boolean;
}

export default function PostCard({
  id,
  title,
  excerpt,
  category,
  date,
  slug,
  comment_count = 0,
  like_count = 0,
  liked = false,
}: PostCardProps) {
  return (
    <article
      className="book-card"
      style={{
        padding: "2rem 1.8rem",
        borderRadius: "4px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--background-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--card-shadow)",
        transition: "var(--transition)",
        position: "relative",
      }}
    >
      {/* Marcador superior */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.2rem",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--primary)",
            background: "var(--primary-faint)",
            border: "1px solid rgba(107, 29, 34, 0.2)",
            padding: "3px 10px",
            borderRadius: "3px",
            fontFamily: "var(--font-sans)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <AutoStories sx={{ fontSize: 13 }} />
          {category || "Literatura"}
        </span>

        <span
          style={{
            fontSize: "0.78rem",
            color: "var(--foreground-faint)",
            fontFamily: "var(--font-sans)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {date}
        </span>
      </div>

      {/* Título de la Obra */}
      <h3
        style={{
          fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
          fontSize: "1.45rem",
          fontWeight: 700,
          lineHeight: 1.3,
          marginBottom: "0.85rem",
          color: "var(--foreground)",
        }}
      >
        <Link
          href={`/posts/${slug}`}
          style={{
            color: "inherit",
            textDecoration: "none",
            transition: "color 0.2s",
          }}
        >
          {title}
        </Link>
      </h3>

      {/* Resumen */}
      <p
        style={{
          color: "var(--foreground-muted)",
          fontSize: "0.98rem",
          lineHeight: 1.7,
          fontFamily: "var(--font-serif)",
          marginBottom: "1.8rem",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {excerpt}
      </p>

      {id && (
        <PostEngagement
          targetId={id}
          targetType="post"
          commentCount={comment_count}
          likeCount={like_count}
          liked={liked}
          url={`/posts/${slug}`}
          title={title}
        />
      )}

      {/* Enlace al final */}
      <Link
        href={`/posts/${slug}`}
        style={{
          marginTop: "auto",
          color: "var(--primary)",
          fontWeight: 700,
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: "0.92rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          textDecoration: "none",
          transition: "gap 0.2s",
        }}
      >
        <span>Abrir lectura</span>
        <ArrowForward sx={{ fontSize: 16 }} />
      </Link>
    </article>
  );
}
