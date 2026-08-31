'use client';

import { useState } from 'react';
import { GalleryImage } from '@/lib/types/gallery';

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
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        color: '#999',
        fontFamily: '"Lora", serif',
        fontSize: '1.1rem',
        fontStyle: 'italic'
      }}>
        No hay imágenes en esta galería.
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
            style={{ cursor: onImageClick ? 'pointer' : 'default' }}
          >
            <div style={{
              opacity: loadedImages.has(index) ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}>
              <img
                src={image.image_url}
                alt={image.caption || ''}
                loading="lazy"
                onLoad={() => handleImageLoad(index)}
                style={{
                  width: '100%',
                  display: 'block',
                  borderRadius: '2px',
                }}
              />
              {image.caption && (
                <div style={{
                  padding: '0.75rem 0.25rem',
                  fontFamily: '"Lora", serif',
                  fontSize: '0.9rem',
                  color: '#555',
                  fontStyle: 'italic',
                  lineHeight: 1.5
                }}>
                  {image.caption}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .masonry-grid {
          column-count: 1;
          column-gap: 1rem;
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1rem;
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
        @media (min-width: 1280px) {
          .masonry-grid {
            column-count: 4;
          }
        }
      `}</style>
    </>
  );
}
