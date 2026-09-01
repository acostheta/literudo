"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Avatar,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { CommentFormProps } from "@/lib/types/comment";

export default function CommentForm({
  postId,
  parentId = null,
  onSubmit,
  onCancel,
  placeholder = "Escribe un comentario...",
  autoFocus = false,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      parent_id: parentId,
      content: trimmed,
    });

    if (!error) {
      setContent("");
      onSubmit?.();
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
    if (e.key === "Escape") {
      onCancel?.();
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        mt: parentId ? 0 : 2,
      }}
    >
      <TextField
        fullWidth
        multiline
        minRows={parentId ? 1 : 2}
        maxRows={6}
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        disabled={loading}
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "20px",
            fontSize: "0.95rem",
            fontFamily: '"Inter", sans-serif',
            bgcolor: "#f5f5f5",
            "& fieldset": {
              borderColor: "transparent",
            },
            "&:hover fieldset": {
              borderColor: "#ccc",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1a1a1a",
              borderWidth: 1,
            },
          },
        }}
      />

      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
        {parentId && (
          <Button
            size="small"
            onClick={onCancel}
            disabled={loading}
            sx={{
              textTransform: "none",
              color: "#888",
              fontSize: "0.85rem",
              minWidth: "auto",
              px: 1,
            }}
          >
            Cancelar
          </Button>
        )}

        <Button
          type="submit"
          size="small"
          disabled={loading || !content.trim()}
          sx={{
            minWidth: "auto",
            width: 36,
            height: 36,
            borderRadius: "50%",
            bgcolor: content.trim() ? "#1a1a1a" : "#e0e0e0",
            color: "#fff",
            "&:hover": {
              bgcolor: content.trim() ? "#333" : "#e0e0e0",
            },
            "&.Mui-disabled": {
              bgcolor: "#e0e0e0",
              color: "#fff",
            },
            transition: "background-color 0.2s",
          }}
        >
          {loading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <SendIcon sx={{ fontSize: 18 }} />
          )}
        </Button>
      </Stack>
    </Box>
  );
}
