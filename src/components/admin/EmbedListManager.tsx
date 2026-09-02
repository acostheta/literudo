"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  VideoFile as YouTubeIcon,
  MusicNote as SoundCloudIcon,
} from "@mui/icons-material";
import {
  detectPlatform,
  getEmbedUrl,
} from "@/lib/utils/embed-detector";
import type { GalleryEmbed } from "@/lib/types/gallery";

interface EmbedListManagerProps {
  platform: "youtube" | "soundcloud";
  embeds: GalleryEmbed[];
  onChange: (embeds: GalleryEmbed[]) => void;
}

export default function EmbedListManager({
  platform,
  embeds,
  onChange,
}: EmbedListManagerProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const platformLabel = platform === "youtube" ? "YouTube" : "SoundCloud";
  const PlatformIcon = platform === "youtube" ? YouTubeIcon : SoundCloudIcon;

  const handleAdd = async () => {
    if (!url.trim()) return;

    const detected = detectPlatform(url);
    if (detected !== platform) {
      setError(`Usa un enlace de ${platformLabel}.`);
      return;
    }

    setLoading(true);
    setError("");

    const resolvedEmbedUrl = await getEmbedUrl(url, platform);
    if (!resolvedEmbedUrl) {
      setError("No se pudo resolver el enlace. Verifica que sea correcto.");
      setLoading(false);
      return;
    }

    const newEmbed: GalleryEmbed = {
      id: `temp-${Date.now()}`,
      gallery_post_id: "",
      platform,
      url,
      embed_url: resolvedEmbedUrl,
      caption: null,
      description: null,
      sort_order: embeds.length,
      created_at: new Date().toISOString(),
    };

    onChange([...embeds, newEmbed]);
    setUrl("");
    setLoading(false);
  };

  const handleRemove = (id: string) => {
    onChange(embeds.filter((e) => e.id !== id));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    onChange(
      embeds.map((e) => (e.id === id ? { ...e, caption } : e))
    );
  };

  const handleDescriptionChange = (id: string, description: string) => {
    onChange(
      embeds.map((e) => (e.id === id ? { ...e, description } : e))
    );
  };

  const handleDragStart = (index: number) => {
    (window as any).__embedDragIndex = index;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    const sourceIndex = (window as any).__embedDragIndex;
    if (sourceIndex === undefined || sourceIndex === targetIndex) return;

    const reordered = [...embeds];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    onChange(
      reordered.map((e, i) => ({ ...e, sort_order: i }))
    );
    delete (window as any).__embedDragIndex;
  };

  return (
    <Box>
      {/* Input para agregar nuevo embed */}
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
          placeholder={
            platform === "youtube"
              ? "https://www.youtube.com/watch?v=..."
              : "https://soundcloud.com/artista/pista"
          }
          disabled={loading}
          slotProps={{
            input: {
              startAdornment: loading ? (
                <CircularProgress size={16} sx={{ mr: 1 }} />
              ) : (
                <PlatformIcon sx={{ fontSize: 18, mr: 1, opacity: 0.5 }} />
              ),
            },
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          sx={{ "& .MuiOutlinedInput-root": { fontSize: "0.85rem" } }}
        />
        <Button
          variant="outlined"
          onClick={handleAdd}
          disabled={!url.trim() || loading}
          sx={{ minWidth: 44, px: 1.5 }}
        >
          <AddIcon />
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 2, fontSize: "0.8rem" }}>
          {error}
        </Alert>
      )}

      {/* Lista de embeds agregados */}
      {embeds.length === 0 ? (
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            color: "text.secondary",
            bgcolor: "rgba(0,0,0,0.02)",
            borderRadius: 1,
          }}
        >
          <PlatformIcon sx={{ fontSize: 32, opacity: 0.3, mb: 1 }} />
          <Typography variant="body2" sx={{ fontStyle: "italic", fontSize: "0.85rem" }}>
            No hay {platformLabel === "YouTube" ? "videos" : "pistas"} todavía.
          </Typography>
        </Box>
      ) : (
        <Box>
          {embeds.map((embed, index) => (
            <Box
              key={embed.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                mb: 1,
                bgcolor: "rgba(0,0,0,0.02)",
                borderRadius: 1,
                border: "1px solid transparent",
                "&:hover": { borderColor: "divider" },
                cursor: "grab",
              }}
            >
              <DragIcon sx={{ color: "action.disabled", fontSize: 18 }} />
              <PlatformIcon
                sx={{
                  fontSize: 18,
                  color: platform === "youtube" ? "#FF0000" : "#FF5500",
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.8rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {embed.url}
                </Typography>
                <TextField
                  size="small"
                  placeholder="Caption (opcional)"
                  value={embed.caption || ""}
                  onChange={(e) => handleCaptionChange(embed.id, e.target.value)}
                  variant="standard"
                  sx={{
                    mt: 0.5,
                    "& .MuiInput-input": { fontSize: "0.75rem", fontStyle: "italic" },
                  }}
                />
                <TextField
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Proceso creativo, inspiración..."
                  value={embed.description || ""}
                  onChange={(e) => handleDescriptionChange(embed.id, e.target.value)}
                  variant="standard"
                  sx={{
                    mt: 0.5,
                    "& .MuiInput-input": { fontSize: "0.75rem", color: "#666" },
                  }}
                />
              </Box>
              <IconButton
                size="small"
                onClick={() => handleRemove(embed.id)}
                sx={{ color: "action.active" }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
