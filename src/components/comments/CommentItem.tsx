"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Avatar,
  Typography,
  Button,
  TextField,
  Stack,
  CircularProgress,
} from "@mui/material";
import ReplyIcon from "@mui/icons-material/Reply";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { CommentWithProfile, CommentItemProps } from "@/lib/types/comment";
import { timeAgo } from "@/lib/utils/timeAgo";
import CommentActions from "./CommentActions";
import CommentForm from "./CommentForm";

const REPLY_DEPTH_COLORS = ["#e3f2fd", "#f3e5f5", "#e8f5e9", "#fff3e0"];

export default function CommentItem({
  comment,
  depth = 0,
  maxDepth = 3,
  currentUserId,
  isAdmin = false,
  onReply,
  onEdit,
  onDelete,
  replyingTo,
  onCancelReply,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editLoading, setEditLoading] = useState(false);
  const [showReplies, setShowReplies] = useState(depth < 2);
  const supabase = createClient();

  const isAuthor = currentUserId === comment.user_id;
  const hasReplies = comment.replies && comment.replies.length > 0;
  const canReply = depth < maxDepth - 1;
  const isReplying = replyingTo === comment.id;

  const handleEdit = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === comment.content) {
      setIsEditing(false);
      return;
    }

    setEditLoading(true);
    const { error } = await supabase
      .from("comments")
      .update({ content: trimmed, updated_at: new Date().toISOString() })
      .eq("id", comment.id);

    if (!error) {
      onEdit?.(comment.id, trimmed);
      setIsEditing(false);
    }
    setEditLoading(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", comment.id);

    if (!error) {
      onDelete?.(comment.id);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleEdit();
    }
    if (e.key === "Escape") {
      setEditContent(comment.content);
      setIsEditing(false);
    }
  };

  const bgColor = depth > 0 ? REPLY_DEPTH_COLORS[Math.min(depth - 1, REPLY_DEPTH_COLORS.length - 1)] : "transparent";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        position: "relative",
        ...(depth > 0 && {
          ml: 2.5,
          pl: 2,
          borderLeft: `3px solid ${bgColor === "transparent" ? "#e0e0e0" : bgColor.replace("0.15)", "0.5)")}`,
          "&::before": {
            content: '""',
            position: "absolute",
            left: -3,
            top: 0,
            bottom: 0,
            width: 3,
            bgcolor: bgColor === "transparent" ? "#e0e0e0" : bgColor.replace("0.15)", "0.4)"),
            borderRadius: 2,
          },
        }),
      }}
    >
      <Avatar
        src={comment.user_avatar || undefined}
        alt={comment.user_name}
        sx={{
          width: depth === 0 ? 44 : 36,
          height: depth === 0 ? 44 : 36,
          mt: 0.5,
          bgcolor: "#1a1a1a",
          fontSize: "0.9rem",
          fontWeight: 600,
        }}
      >
        {comment.user_name?.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            bgcolor: "#f5f5f5",
            borderRadius: "18px",
            px: 2,
            py: 1.2,
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  fontFamily: '"Inter", sans-serif',
                  lineHeight: 1.3,
                }}
              >
                {comment.user_name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "#888",
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                {timeAgo(comment.created_at)}
                {comment.updated_at && comment.updated_at !== comment.created_at && (
                  <Box component="span" sx={{ ml: 0.5, fontStyle: "italic" }}>
                    (editado)
                  </Box>
                )}
              </Typography>
            </Box>

            <CommentActions
              isAuthor={isAuthor}
              isAdmin={isAdmin}
              onEdit={() => {
                setEditContent(comment.content);
                setIsEditing(true);
              }}
              onDelete={handleDelete}
            />
          </Box>

          {isEditing ? (
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                multiline
                size="small"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleEditKeyDown}
                autoFocus
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontSize: "0.95rem",
                    fontFamily: '"Inter", sans-serif',
                    bgcolor: "#fff",
                  },
                }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                  size="small"
                  onClick={handleEdit}
                  disabled={editLoading || !editContent.trim()}
                  startIcon={editLoading ? <CircularProgress size={14} /> : <CheckIcon />}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.8rem",
                    bgcolor: "#1a1a1a",
                    color: "#fff",
                    "&:hover": { bgcolor: "#333" },
                    px: 2,
                  }}
                >
                  Guardar
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setEditContent(comment.content);
                    setIsEditing(false);
                  }}
                  disabled={editLoading}
                  startIcon={<CloseIcon />}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.8rem",
                    color: "#666",
                  }}
                >
                  Cancelar
                </Button>
              </Stack>
            </Box>
          ) : (
            <Typography
              sx={{
                mt: 0.5,
                fontSize: "0.95rem",
                lineHeight: 1.6,
                fontFamily: '"Inter", sans-serif',
                color: "#333",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {comment.content}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            mt: 0.5,
            ml: 1.5,
          }}
        >
          {canReply && currentUserId && (
            <Button
              size="small"
              onClick={() => onReply?.(comment.id)}
              startIcon={<ReplyIcon sx={{ fontSize: "1rem !important" }} />}
              sx={{
                textTransform: "none",
                fontSize: "0.8rem",
                color: "#666",
                fontWeight: 600,
                minWidth: "auto",
                px: 0,
                "&:hover": { bgcolor: "transparent", color: "#1a1a1a" },
              }}
            >
              Responder
            </Button>
          )}
        </Box>

        {isReplying && (
          <Box sx={{ mt: 1.5, mb: 1 }}>
            <CommentForm
              postId={comment.post_id}
              parentId={comment.id}
              onSubmit={() => {
                onCancelReply?.();
                setShowReplies(true);
              }}
              onCancel={onCancelReply}
              placeholder={`Responder a ${comment.user_name}...`}
              autoFocus
            />
          </Box>
        )}

        {hasReplies && (
          <Box sx={{ mt: 1 }}>
            {!showReplies ? (
              <Button
                size="small"
                onClick={() => setShowReplies(true)}
                sx={{
                  textTransform: "none",
                  fontSize: "0.85rem",
                  color: "#666",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "transparent", color: "#1a1a1a" },
                }}
              >
                Ver {comment.replies!.length}{" "}
                {comment.replies!.length === 1 ? "respuesta" : "respuestas"}
              </Button>
            ) : (
              <Box>
                {depth < maxDepth - 1 && (
                  <Button
                    size="small"
                    onClick={() => setShowReplies(false)}
                    sx={{
                      textTransform: "none",
                      fontSize: "0.85rem",
                      color: "#666",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "transparent", color: "#1a1a1a" },
                    }}
                  >
                    Ocultar respuestas
                  </Button>
                )}

                {comment.replies!.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                    currentUserId={currentUserId}
                    isAdmin={isAdmin}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    replyingTo={replyingTo}
                    onCancelReply={onCancelReply}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
