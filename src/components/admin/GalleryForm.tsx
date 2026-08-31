"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GalleryImage } from "@/lib/types/gallery";
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
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";

interface ImagePreview {
  file: File;
  preview: string;
  caption: string;
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
  initialStatus?: string;
  submitLabel?: string;
}

export default function GalleryForm({
  mode,
  galleryId,
  initialTitle = "",
  initialDescription = "",
  initialImages = [],
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
  }, [initialTitle, initialDescription, initialStatus, initialImages]);

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

  const uploadImages = async (): Promise<{ image_url: string; caption: string; sort_order: number }[]> => {
    const uploaded: { image_url: string; caption: string; sort_order: number }[] = [];
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return uploaded;

    for (let i = 0; i < imagePreviews.length; i++) {
      const img = imagePreviews[i];
      if (img.uploaded && img.url) {
        uploaded.push({
          image_url: img.url,
          caption: img.caption,
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
          sort_order: i,
        })),
        ...uploadedImages,
      ];

      if (allImages.length > 0) {
        const imagesToInsert = allImages.map((img) => ({
          gallery_post_id: postId,
          image_url: img.image_url,
          caption: img.caption || null,
          sort_order: img.sort_order,
        }));

        const { error: imagesError } = await supabase
          .from("gallery_images")
          .insert(imagesToInsert);

        if (imagesError) throw imagesError;
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
                JPEG, PNG, WebP, GIF — Sin límite de cantidad
              </Typography>
            </Box>
          )}

          {existingImages.length > 0 && (
            <Stack spacing={2}>
              {existingImages.map((image) => (
                <Paper key={image.id} elevation={0} sx={{ p: 2, border: '1px solid #eee', borderRadius: 0 }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                    <Box sx={{ width: 100, height: 80, flexShrink: 0, overflow: 'hidden', borderRadius: '2px' }}>
                      <img src={image.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                <Paper key={index} elevation={0} sx={{ p: 2, border: '1px solid #eee', borderRadius: 0 }}>
                  <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
                    <DragIcon sx={{ mt: 1, opacity: 0.3 }} />
                    <Box sx={{ width: 100, height: 80, flexShrink: 0, overflow: 'hidden', borderRadius: '2px' }}>
                      <img src={preview.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
