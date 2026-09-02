export interface GalleryPost {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  author_id: string;
  status: 'borrador' | 'publicado';
  created_at: string;
  updated_at: string;
  profiles?: { name: string; avatar_url?: string } | null;
  gallery_images?: GalleryImage[];
  gallery_embeds?: GalleryEmbed[];
}

export interface GalleryImage {
  id: string;
  gallery_post_id: string;
  image_url: string;
  caption: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface GalleryEmbed {
  id: string;
  gallery_post_id: string;
  platform: 'youtube' | 'soundcloud';
  url: string;
  embed_url: string;
  caption: string | null;
  description: string | null;
  sort_order: number;
  created_at: string;
}
