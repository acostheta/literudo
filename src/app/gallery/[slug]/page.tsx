"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GalleryPost } from "@/lib/types/gallery";
import MasonryGrid from "@/components/MasonryGrid";
import CommentSection from "@/components/comments/CommentSection";

export default function GalleryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [gallery, setGallery] = useState<GalleryPost | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const fetchGallery = async () => {
      const { data: post } = await supabaseRef.current
        .from("gallery_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "publicado")
        .single();

      if (post) {
        const { data: profile } = await supabaseRef.current
          .from("profiles")
          .select("name")
          .eq("id", post.author_id)
          .single();

        const { data: images } = await supabaseRef.current
          .from("gallery_images")
          .select("*")
          .eq("gallery_post_id", post.id)
          .order("sort_order");

        setGallery({ ...post, profiles: profile, gallery_images: images || [] });
      }
      setLoading(false);
    };

    fetchGallery();
  }, [slug]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--background)',
        color: '#999'
      }}>
        Cargando...
      </div>
    );
  }

  if (!gallery) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--background)',
        padding: '2rem'
      }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', marginBottom: '1rem' }}>
          Galería no encontrada
        </h2>
        <Link href="/gallery" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
          Volver a la galería
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href="/gallery"
          style={{
            color: 'var(--foreground-muted)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Volver a la galería
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'var(--foreground)',
          marginBottom: '0.5rem'
        }}>
          {gallery.title}
        </h1>

        {gallery.description && (
          <p style={{
            fontFamily: 'var(--font-lora)',
            fontSize: '1.1rem',
            color: 'var(--foreground-muted)',
            fontStyle: 'italic',
            maxWidth: '700px',
            margin: '1rem auto 0',
            lineHeight: 1.6
          }}>
            {gallery.description}
          </p>
        )}

        <div style={{
          marginTop: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--foreground-muted)'
        }}>
          <span style={{ fontWeight: '600' }}>{gallery.profiles?.name || 'Anónimo'}</span>
          <span style={{ margin: '0 0.5rem' }}>·</span>
          <span>
            {new Date(gallery.created_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
          <span style={{ margin: '0 0.5rem' }}>·</span>
          <span>{gallery.gallery_images?.length || 0} fotos</span>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <MasonryGrid images={gallery.gallery_images || []} />
      </div>

      <div style={{ maxWidth: '800px', margin: '3rem auto 0' }}>
        <CommentSection postId={gallery.id} />
      </div>
    </div>
  );
}
