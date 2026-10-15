"use client";

import { Box, Typography } from "@mui/material";

interface EmbedPlayerProps {
  platform: string;
  embedUrl: string;
  caption?: string | null;
  description?: string | null;
}

export default function EmbedPlayer({ platform, embedUrl, caption, description }: EmbedPlayerProps) {
  const platformColor = platform === "youtube" ? "#8a2a30" : "#b88228";
  const platformLabel = platform === "youtube" ? "Registro Audiovisual (YouTube)" : "Grabación Sonora (SoundCloud)";

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          position: "relative",
          borderRadius: "4px",
          overflow: "hidden",
          border: "1px solid var(--border)",
          bgcolor: "#241812",
          boxShadow: "var(--card-shadow)",
        }}
      >
        {platform === "youtube" ? (
          <Box sx={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <Box
              component="iframe"
              src={embedUrl}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Box>
        ) : (
          <Box
            component="iframe"
            src={embedUrl}
            sx={{ width: "100%", height: 166, border: "none" }}
            allow="autoplay"
            scrolling="no"
          />
        )}
      </Box>

      {(caption || platform) && (
        <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: platformColor,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              color: "var(--foreground-muted)",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: "0.85rem",
            }}
          >
            {caption || platformLabel}
          </Typography>
        </Box>
      )}

      {description && (
        <Typography
          sx={{
            mt: 1,
            fontSize: "0.92rem",
            fontFamily: "var(--font-serif)",
            color: "var(--foreground-muted)",
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
}
