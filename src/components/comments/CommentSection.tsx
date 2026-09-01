"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Typography,
  Button,
  Stack,
  CircularProgress,
  Divider,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import LoginIcon from "@mui/icons-material/Login";
import Link from "next/link";
import { CommentWithProfile, CommentSectionProps } from "@/lib/types/comment";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

const PAGE_SIZE = 20;

function buildTree(
  comments: CommentWithProfile[],
  parentId: string | null = null
): CommentWithProfile[] {
  return comments
    .filter((c) => c.parent_id === parentId)
    .map((c) => ({
      ...c,
      replies: buildTree(comments, c.id),
      is_collapsed: false,
    }));
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentWithProfile[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const supabase = createClient();

  const fetchUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setCurrentUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "Administrador") {
        setIsAdmin(true);
      }
    }
  }, [supabase]);

  const fetchComments = useCallback(
    async (offset: number = 0, append: boolean = false) => {
      const { data, error } = await supabase.rpc("get_comments_with_profile", {
        p_post_id: postId,
        p_limit: PAGE_SIZE,
        p_offset: offset,
      });

      if (!error && data) {
        if (append) {
          setComments((prev) => [...prev, ...data]);
        } else {
          setComments(data);
        }
        setHasMore(data.length === PAGE_SIZE);
      }

      const { count } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);

      setTotalCount(count || 0);
      setLoading(false);
      setLoadingMore(false);
    },
    [postId, supabase]
  );

  useEffect(() => {
    fetchUser();
    fetchComments();
  }, [fetchUser, fetchComments]);

  const handleNewComment = () => {
    fetchComments();
  };

  const handleLoadMore = () => {
    setLoadingMore(true);
    fetchComments(comments.length, true);
  };

  const handleEdit = (commentId: string, newContent: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, content: newContent, updated_at: new Date().toISOString() } : c
      )
    );
  };

  const handleDelete = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };

  const commentTree = buildTree(comments);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={24} color="inherit" />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Stack direction="row" spacing={1.5} sx={{ mb: 3, alignItems: "center" }}>
        <ChatBubbleOutlineIcon sx={{ fontSize: "1.3rem", opacity: 0.6 }} />
        <Typography
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 700,
            fontSize: "1.1rem",
            letterSpacing: "-0.01em",
          }}
        >
          {totalCount} {totalCount === 1 ? "comentario" : "comentarios"}
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3, opacity: 0.15 }} />

      {currentUser ? (
        <CommentForm postId={postId} onSubmit={handleNewComment} />
      ) : (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            py: 3,
            px: 3,
            bgcolor: "#f5f5f5",
            borderRadius: "20px",
            mb: 3,
          }}
        >
          <LoginIcon sx={{ fontSize: "1.2rem", opacity: 0.5 }} />
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.95rem",
              color: "#666",
            }}
          >
            Inicia sesión para participar en la conversación
          </Typography>
          <Button
            component={Link}
            href="/login"
            size="small"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "#1a1a1a",
              fontFamily: '"Inter", sans-serif',
              ml: "auto",
            }}
          >
            Iniciar sesión
          </Button>
        </Box>
      )}

      <Stack spacing={2.5} sx={{ mt: 3 }}>
        {commentTree.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            depth={0}
            maxDepth={3}
            currentUserId={currentUser?.id}
            isAdmin={isAdmin}
            onReply={(parentId) => setReplyingTo(parentId)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            replyingTo={replyingTo}
            onCancelReply={() => setReplyingTo(null)}
          />
        ))}
      </Stack>

      {hasMore && comments.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            sx={{
              textTransform: "none",
              fontFamily: '"Inter", sans-serif',
              fontWeight: 600,
              color: "#666",
              "&:hover": { bgcolor: "transparent", color: "#1a1a1a" },
            }}
          >
            {loadingMore ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              `Ver más comentarios`
            )}
          </Button>
        </Box>
      )}

      {comments.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            opacity: 0.5,
          }}
        >
          <ChatBubbleOutlineIcon sx={{ fontSize: "2.5rem", mb: 2, opacity: 0.3 }} />
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: "0.95rem",
              color: "#888",
            }}
          >
            Sé el primero en comentar
          </Typography>
        </Box>
      )}
    </Box>
  );
}
