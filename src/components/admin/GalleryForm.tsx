"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GalleryImage, GalleryEmbed } from "@/lib/types/gallery";
import EmbedListManager from "./EmbedListManager";
import {
  Box,
  Button,
  TextField,
  Typography,
  Stack,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Image as ImageIcon,
  VideoFile as VideoIcon,
  MusicNote as MusicIcon,
} from "@mui/icons-material";

interface ImagePreview {
  file: File;
  preview: string;
  caption: string;
  description: string;
  uploading: boolean;
  uploaded: boolean;
  url?: string;
}

interface GalleryFormProps {
  mode: "create" | "edit";
  galleryId?: string;
  initialTitle?: string;
  initialDescription?: string;
  initialImages?: GalleryImage[];
  initialEmbeds?: GalleryEmbed[];
  initialStatus?: string;
  submitLabel?: string;
}

export default function GalleryForm({
  mode,
  galleryId,
  initialTitle = "",
  initialDescription = "",
  initialImages = [],
  initialEmbeds = [],
  initialStatus = "borrador",
  submitLabel = "Guardar",
}: GalleryFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(
    initialTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
  const [description, setDescription] = useState(initialDescription);
  const [status, setStatus] = useState(initialStatus);
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [existingImages, setExistingImages] = useState<GalleryImage[]>(initialImages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragSection, setDragSection] = useState<"existing" | "new" | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [videoEmbeds, setVideoEmbeds] = useState<GalleryEmbed[]>(
    initialEmbeds.filter((e) => e.platform === "youtube")
  );
  const [musicEmbeds, setMusicEmbeds] = useState<GalleryEmbed[]>(
    initialEmbeds.filter((e) => e.platform === "soundcloud")
  );
  const [existingEmbedIds, setExistingEmbedIds] = useState<Set<string>>(
    new Set(initialEmbeds.map((e) => e.id))
  );

  useEffect(() => {
    if (initialTitle) {
      setTitle(initialTitle);
      setSlug(
        initialTitle
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
    if (initialDescription) setDescription(initialDescription);
    if (initialStatus) setStatus(initialStatus);
    if (initialImages.length > 0 && existingImages.length === 0) {
      setExistingImages(initialImages);
    }
    if (initialEmbeds.length > 0 && existingEmbedIds.size === 0) {
      setVideoEmbeds(initialEmbeds.filter((e) => e.platform === "youtube"));
      setMusicEmbeds(initialEmbeds.filter((e) => e.platform === "soundcloud"));
      setExistingEmbedIds(new Set(initialEmbeds.map((e) => e.id)));
    }
  }, [initialTitle, initialDescription, initialStatus, initialImages, initialEmbeds]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    const newPreviews: ImagePreview[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      caption: "",
      description: "",
      uploading: false,
      uploaded: false,
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewImage = (index: number) => {
    setImagePreviews((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = async (image: GalleryImage) => {
    if (!confirm("¿Eliminar esta imagen?")) return;
    await supabase.from("gallery_images").delete().eq("id", image.id);
    setExistingImages((prev) => prev.filter((img) => img.id !== image.id));
  };

  const updateCaption = (index: number, caption: string) => {
    setImagePreviews((prev) =>
      prev.map((img, i) => (i === index ? { ...img, caption } : img))
    );
  };

  const updateExistingCaption = async (image: GalleryImage, caption: string) => {
    await supabase.from("gallery_images").update({ caption }).eq("id", image.id);
    setExistingImages((prev) =>
      prev.map((img) => (img.id === image.id ? { ...img, caption } : img))
    );
  };

  const updateDescription = (index: number, description: string) => {
    setImagePreviews((prev) =>
      prev.map((img, i) => (i === index ? { ...img, description } : img))
    );
  };

  const updateExistingDescription = async (image: GalleryImage, description: string) => {
    await supabase.from("gallery_images").update({ description }).eq("id", image.id);
    setExistingImages((prev) =>
      prev.map((img) => (img.id === image.id ? { ...img, description } : img))
    );
  };

  const reorderExisting = async (fromIndex: number, toIndex: number) => {
    setExistingImages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const reorderNew = (fromIndex: number, toIndex: number) => {
    setImagePreviews((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleDragStart = (index: number, section: "existing" | "new") => {
    setDraggingIndex(index);
    setDragSection(section);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number, section: "existing" | "new") => {
    e.preventDefault();
    if (draggingIndex === null || dragSection !== section) {
      setDragOverIndex(null);
      setDraggingIndex(null);
      setDragSection(null);
      return;
    }
    if (section === "existing") {
      reorderExisting(draggingIndex, toIndex);
    } else {
      reorderNew(draggingIndex, toIndex);
    }
    setDragOverIndex(null);
    setDraggingIndex(null);
    setDragSection(null);
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
    setDraggingIndex(null);
    setDragSection(null);
  };

  const uploadImages = async (): Promise<{ image_url: string; caption: string; description: string; sort_order: number }[]> => {
    const uploaded: { image_url: string; caption: string; description: string; sort_order: number }[] = [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return uploaded;

    for (let i = 0; i < imagePreviews.length; i++) {
      const img = imagePreviews[i];
      if (img.uploaded && img.url) {
        uploaded.push({
          image_url: img.url,
          caption: img.caption,
          description: img.description,
          sort_order: existingImages.length + i,
        });
        continue;
      }

      setImagePreviews((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, uploading: true } : p))
      );
      setUploadingCount((prev) => prev + 1);

      const fileExt = img.file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(fileName, img.file);

      if (uploadError) {
        setError(`Error subiendo imagen: ${uploadError.message}`);
        setUploadingCount((prev) => prev - 1);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(fileName);

      uploaded.push({
        image_url: publicUrl,
        caption: img.caption,
        description: img.description,
        sort_order: existingImages.length + i,
      });

      setImagePreviews((prev) =>
        prev.map((p, idx) =>
          idx === i ? { ...p, uploading: false, uploaded: true, url: publicUrl } : p
        )
      );
      setUploadingCount((prev) => prev - 1);
    }

    return uploaded;
  };

  const handleSubmit = async () => {
    if (!title) {
      setError("El título es obligatorio.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      let postId = galleryId;

      if (mode === "create") {
        const { data: newPost, error: postError } = await supabase
          .from("gallery_posts")
          .insert({
            title,
            slug: generatedSlug,
            description: description || null,
            author_id: user.id,
            status,
          })
          .select()
          .single();

        if (postError) throw postError;
        postId = newPost.id;
      } else {
        const { error: updateError } = await supabase
          .from("gallery_posts")
          .update({
            title,
            slug: generatedSlug,
            description: description || null,
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", galleryId);

        if (updateError) throw updateError;

        await supabase.from("gallery_images").delete().eq("gallery_post_id", galleryId);
      }

      const uploadedImages = await uploadImages();

      const allImages = [
        ...existingImages.map((img, i) => ({
          image_url: img.image_url,
          caption: img.caption || "",
          description: img.description || "",
          sort_order: i,
        })),
        ...uploadedImages,
      ];

      if (allImages.length > 0) {
        const imagesToInsert = allImages.map((img) => ({
          gallery_post_id: postId,
          image_url: img.image_url,
          caption: img.caption || null,
          description: img.description || null,
          sort_order: img.sort_order,
        }));

        const { error: imagesError } = await supabase
          .from("gallery_images")
          .insert(imagesToInsert);

        if (imagesError) throw imagesError;
      }

      // Guardar embeds (videos + música)
      const allEmbeds = [
        ...videoEmbeds.map((e, i) => ({ ...e, sort_order: i })),
        ...musicEmbeds.map((e, i) => ({ ...e, sort_order: videoEmbeds.length + i })),
      ];

      // Eliminar embeds existentes si estamos en modo edición
      if (mode === "edit" && existingEmbedIds.size > 0) {
        await supabase
          .from("gallery_embeds")
          .delete()
          .eq("gallery_post_id", galleryId);
      }

      // Insertar embeds nuevos
      if (allEmbeds.length > 0) {
        const embedsToInsert = allEmbeds.map((e) => ({
          gallery_post_id: postId,
          platform: e.platform,
          url: e.url,
          embed_url: e.embed_url,
          caption: e.caption || null,
          sort_order: e.sort_order,
        }));

        const { error: embedsError } = await supabase
          .from("gallery_embeds")
          .insert(embedsToInsert);

        if (embedsError) throw embedsError;
      }

      router.push("/admin/gallery");
    } catch (err: any) {
      setError(err.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={4}>
      {error && (
        <Alert severity="error" sx={{ borderRadius: 0, border: '1px solid #ffcdd2', bgcolor: '#fff9f9' }}>
          {error}
        </Alert>
      )}

      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 0, bgcolor: 'white', border: '1px solid #eee' }}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            variant="standard"
            placeholder="Título de la galería..."
            value={title}
            onChange={handleTitleChange}
            autoFocus
            slotProps={{
              input: {
                disableUnderline: true,
                sx: {
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  fontWeight: 800,
                  fontFamily: '"Lora", serif',
                  lineHeight: 1.2,
                  color: '#1a1a1a',
                  '& input::placeholder': { opacity: 0.15, fontStyle: 'normal' }
                }
              }
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: '#ccc', textTransform: 'uppercase', letterSpacing: 2 }}>
              Enlace:
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: 'primary.main', opacity: 0.7, fontStyle: 'italic' }}>
              literudo.com/gallery/{slug || '...'}
            </Typography>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={2}
            variant="standard"
            placeholder="Describe la galería (opcional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            slotProps={{
              input: {
                disableUnderline: true,
                sx: {
                  fontSize: '1.1rem',
                  fontFamily: '"Lora", serif',
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                  color: '#555',
                  '& textarea::placeholder': { opacity: 0.3 }
                }
              }
            }}
          />
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 0, bgcolor: 'white', border: '1px solid #eee' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            mb: 3,
            borderBottom: "1px solid #eee",
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.9rem" },
          }}
        >
          <Tab icon={<ImageIcon />} iconPosition="start" label="Imágenes" />
          <Tab icon={<VideoIcon />} iconPosition="start" label="Videos" />
          <Tab icon={<MusicIcon />} iconPosition="start" label="Música" />
        </Tabs>

        {/* Pestaña de Imágenes */}
        {activeTab === 0 && (
          <Stack spacing={3}>
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: '"Lora", serif' }}>
                Imágenes
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<UploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ borderRadius: 0, textTransform: 'none' }}
              >
                Agregar imágenes
              </Button>
            </Stack>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              hidden
              ref={fileInputRef}
              onChange={handleFileSelect}
            />

            {existingImages.length === 0 && imagePreviews.length === 0 && (
              <Box sx={{
                p: 6,
                border: '2px dashed #ddd',
                borderRadius: 0,
                textAlign: 'center',
                color: '#999'
              }}>
                <UploadIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                <Typography sx={{ fontFamily: '"Lora", serif', fontStyle: 'italic' }}>
                  Arrastra imágenes aquí o haz clic en "Agregar imágenes"
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.5 }}>
                  JPEG, PNG, WebP, GIF — Arrastra para cambiar el orden — La primera será la portada
                </Typography>
              </Box>
            )}

            {existingImages.length > 0 && (
              <Stack spacing={2}>
                {existingImages.map((image, index) => (
                  <Paper
                    key={image.id}
                    elevation={0}
                    draggable
                    onDragStart={() => handleDragStart(index, "existing")}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index, "existing")}
                    onDragEnd={handleDragEnd}
                    sx={{
                      p: 2,
                      border: '1px solid #eee',
                      borderRadius: 0,
                      cursor: 'grab',
                      opacity: draggingIndex === index && dragSection === "existing" ? 0.4 : 1,
                      bgcolor: dragOverIndex === index && dragSection === "existing" ? '#f5f5f5' : 'white',
                      transition: 'background-color 0.15s',
                      '&:active': { cursor: 'grabbing' },
                    }}
                  >
                    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                      <DragIcon sx={{ mt: 1, opacity: 0.3 }} />
                      <Box sx={{ position: 'relative', width: 100, height: 80, flexShrink: 0 }}>
                        {index === 0 && (
                          <Chip
                            label="Portada"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -8,
                              left: 0,
                              zIndex: 1,
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 900,
                              bgcolor: '#1a1a1a',
                              color: 'white',
                              borderRadius: 0,
                            }}
                          />
                        )}
                        <Box sx={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '2px' }}>
                          <img src={image.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          variant="standard"
                          placeholder="Pie de foto..."
                          value={image.caption || ""}
                          onChange={(e) => updateExistingCaption(image, e.target.value)}
                          slotProps={{
                            input: { disableUnderline: true, sx: { fontSize: '0.9rem', fontStyle: 'italic' } }
                          }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          variant="standard"
                          placeholder="Proceso creativo, inspiración..."
                          value={image.description || ""}
                          onChange={(e) => updateExistingDescription(image, e.target.value)}
                          slotProps={{
                            input: { disableUnderline: true, sx: { fontSize: '0.8rem', color: '#666', mt: 1 } }
                          }}
                        />
                      </Box>
                      <IconButton size="small" color="error" onClick={() => removeExistingImage(image)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}

            {imagePreviews.length > 0 && (
              <Stack spacing={2}>
                {imagePreviews.map((preview, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    draggable
                    onDragStart={() => handleDragStart(index, "new")}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index, "new")}
                    onDragEnd={handleDragEnd}
                    sx={{
                      p: 2,
                      border: '1px solid #eee',
                      borderRadius: 0,
                      cursor: 'grab',
                      opacity: draggingIndex === index && dragSection === "new" ? 0.4 : 1,
                      bgcolor: dragOverIndex === index && dragSection === "new" ? '#f5f5f5' : 'white',
                      transition: 'background-color 0.15s',
                      '&:active': { cursor: 'grabbing' },
                    }}
                  >
                    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                      <DragIcon sx={{ mt: 1, opacity: 0.3 }} />
                      <Box sx={{ position: 'relative', width: 100, height: 80, flexShrink: 0 }}>
                        {index === 0 && (
                          <Chip
                            label="Portada"
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: -8,
                              left: 0,
                              zIndex: 1,
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 900,
                              bgcolor: '#1a1a1a',
                              color: 'white',
                              borderRadius: 0,
                            }}
                          />
                        )}
                        <Box sx={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: '2px' }}>
                          <img src={preview.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          variant="standard"
                          placeholder="Pie de foto..."
                          value={preview.caption}
                          onChange={(e) => updateCaption(index, e.target.value)}
                          slotProps={{
                            input: { disableUnderline: true, sx: { fontSize: '0.9rem', fontStyle: 'italic' } }
                          }}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          multiline
                          rows={2}
                          variant="standard"
                          placeholder="Proceso creativo, inspiración..."
                          value={preview.description}
                          onChange={(e) => updateDescription(index, e.target.value)}
                          slotProps={{
                            input: { disableUnderline: true, sx: { fontSize: '0.8rem', color: '#666', mt: 1 } }
                          }}
                        />
                        {preview.uploading && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: 'center' }}>
                            <CircularProgress size={14} />
                            <Typography variant="caption" color="text.secondary">Subiendo...</Typography>
                          </Stack>
                        )}
                        {preview.uploaded && (
                          <Chip label="Subida" size="small" color="success" sx={{ mt: 1, height: 20, fontSize: '0.7rem' }} />
                        )}
                      </Box>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeNewImage(index)}
                        disabled={preview.uploading}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Stack>
        )}

        {/* Pestaña de Videos */}
        {activeTab === 1 && (
          <EmbedListManager
            platform="youtube"
            embeds={videoEmbeds}
            onChange={setVideoEmbeds}
          />
        )}

        {/* Pestaña de Música */}
        {activeTab === 2 && (
          <EmbedListManager
            platform="soundcloud"
            embeds={musicEmbeds}
            onChange={setMusicEmbeds}
          />
        )}
      </Paper>

      <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          onClick={handleSubmit}
          disabled={loading || uploadingCount > 0}
          sx={{
            borderRadius: 0,
            px: 6,
            py: 1.5,
            bgcolor: '#1a1a1a',
            fontWeight: 'bold',
            '&:hover': { bgcolor: '#000' }
          }}
        >
          {loading ? "Guardando..." : submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
}
