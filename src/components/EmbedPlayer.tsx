"use client";

import { Box, Typography } from "@mui/material";

interface EmbedPlayerProps {
  platform: string;
  embedUrl: string;
  caption?: string | null;
}

export default function EmbedPlayer({ platform, embedUrl, caption }: EmbedPlayerProps) {
  const platformColor = platform === "youtube" ? "#FF0000" : "#FF5500";
  const platformLabel = platform === "youtube" ? "YouTube" : "SoundCloud";

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          position: "relative",
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
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
        <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: platformColor,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontStyle: "italic" }}
          >
            {caption || platformLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
