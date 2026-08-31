"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GalleryPost } from "@/lib/types/gallery";

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
        const authorIds = [...new Set(posts.map(p => p.author_id))];
        const { data: profiles } = await supabaseRef.current
          .from("profiles")
          .select("id, name")
          .in("id", authorIds);

        const profileMap: Record<string, string> = {};
        profiles?.forEach(p => { profileMap[p.id] = p.name; });

        const postIds = posts.map(p => p.id);
        const { data: images } = await supabaseRef.current
          .from("gallery_images")
          .select("gallery_post_id, image_url")
          .in("gallery_post_id", postIds);

        const coverMap: Record<string, string> = {};
        images?.forEach(img => {
          if (!coverMap[img.gallery_post_id]) {
            coverMap[img.gallery_post_id] = img.image_url;
          }
        });

        const countMap: Record<string, number> = {};
        images?.forEach(img => {
          countMap[img.gallery_post_id] = (countMap[img.gallery_post_id] || 0) + 1;
        });

        const enriched = posts.map(p => ({
          ...p,
          profiles: { name: profileMap[p.author_id] || "Anónimo" },
          gallery_images: coverMap[p.id]
            ? [{ image_url: coverMap[p.id] }]
            : [],
          _imageCount: countMap[p.id] || 0
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
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '2.5rem',
          fontWeight: '700',
          color: 'var(--foreground)',
          marginBottom: '0.5rem'
        }}>
          Galería
        </h1>
        <p style={{
          fontFamily: 'var(--font-lora)',
          fontSize: '1.1rem',
          color: 'var(--foreground-muted)',
          fontStyle: 'italic'
        }}>
          Fotografías, dibujos y pinturas de nuestra comunidad
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
          Cargando galerías...
        </div>
      ) : galleries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#999', fontStyle: 'italic' }}>
          No hay galerías publicadas todavía.
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {galleries.map((gallery) => {
            const coverImage = gallery.gallery_images?.[0]?.image_url;
            return (
              <Link
                key={gallery.id}
                href={`/gallery/${gallery.slug}`}
                style={{
                  display: 'block',
                  textDecoration: 'none',
                  color: 'inherit',
                  background: 'white',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: coverImage ? `url(${coverImage}) center/cover` : '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {!coverImage && (
                    <span style={{ color: '#ccc', fontSize: '2rem' }}>📷</span>
                  )}
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h2 style={{
                    fontFamily: 'var(--font-playfair)',
                    fontSize: '1.3rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: 'var(--foreground)'
                  }}>
                    {gallery.title}
                  </h2>
                  {gallery.description && (
                    <p style={{
                      fontFamily: 'var(--font-lora)',
                      fontSize: '0.9rem',
                      color: 'var(--foreground-muted)',
                      marginBottom: '0.75rem',
                      lineHeight: 1.5,
                      fontStyle: 'italic'
                    }}>
                      {gallery.description.substring(0, 100)}
                      {gallery.description.length > 100 ? '...' : ''}
                    </p>
                  )}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    color: 'var(--foreground-muted)'
                  }}>
                    <span>{gallery.profiles?.name || 'Anónimo'}</span>
                    <span>{(gallery as any)._imageCount || gallery.gallery_images?.length || 0} fotos</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
