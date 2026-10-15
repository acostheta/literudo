"use client";

import { useState } from "react";
import { GalleryImage } from "@/lib/types/gallery";

interface MasonryGridProps {
  images: GalleryImage[];
  onImageClick?: (index: number) => void;
}

export default function MasonryGrid({ images, onImageClick }: MasonryGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index));
  };

  if (images.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "4rem 2rem",
          color: "var(--foreground-muted)",
          fontFamily: "var(--font-serif)",
          fontSize: "1.05rem",
          fontStyle: "italic",
        }}
      >
        No hay estampas registradas en esta colección.
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="masonry-item"
            onClick={() => onImageClick?.(index)}
            style={{
              cursor: onImageClick ? "pointer" : "default",
              backgroundColor: "var(--background-card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              overflow: "hidden",
              padding: "8px",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div
              style={{
                opacity: loadedImages.has(index) ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              <img
                src={image.image_url}
                alt={image.caption || "Imagen de la galería"}
                loading="lazy"
                onLoad={() => handleImageLoad(index)}
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: "2px",
                  border: "1px solid var(--border-light)",
                }}
              />
              {image.caption && (
                <div
                  style={{
                    padding: "0.85rem 0.3rem 0.25rem",
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.92rem",
                    color: "var(--foreground)",
                    fontStyle: "italic",
                    lineHeight: 1.5,
                  }}
                >
                  {image.caption}
                </div>
              )}
              {image.description && (
                <div
                  style={{
                    padding: "0.2rem 0.3rem 0.6rem",
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.85rem",
                    color: "var(--foreground-muted)",
                    lineHeight: 1.6,
                  }}
                >
                  {image.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .masonry-grid {
          column-count: 1;
          column-gap: 1.25rem;
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1.25rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .masonry-item:hover {
          transform: translateY(-2px);
          box-shadow: var(--card-shadow-hover);
        }
        @media (min-width: 640px) {
          .masonry-grid {
            column-count: 2;
          }
        }
        @media (min-width: 1024px) {
          .masonry-grid {
            column-count: 3;
          }
        }
      `}</style>
    </>
  );
}
