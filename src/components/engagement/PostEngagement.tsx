"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, IconButton, Tooltip } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlined";
import ShareIcon from "@mui/icons-material/Share";
import CheckIcon from "@mui/icons-material/Check";
import { createClient, getCurrentUser } from "@/lib/supabase/client";

interface PostEngagementProps {
  targetId: string;
  targetType: "post" | "gallery";
  // Si no se pasan, el componente los trae (páginas de detalle de un solo ítem)
  commentCount?: number;
  likeCount?: number;
  liked?: boolean;
  url: string;
  title: string;
  dense?: boolean;
}

function Metric({
  icon,
  label,
  active = false,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  label: string | number;
  active?: boolean;
  onClick?: () => void;
  title: string;
}) {
  const body = (
    <Box
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        color: active ? "var(--primary)" : "var(--foreground-faint)",
        fontSize: "0.85rem",
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        ...(onClick && {
          cursor: "pointer",
          borderRadius: "20px",
          px: 1,
          py: 0.25,
          mx: -1,
          transition: "background-color 0.2s, color 0.2s",
          "&:hover": {
            bgcolor: "var(--primary-faint)",
            color: "var(--primary)",
          },
        }),
      }}
    >
      {icon}
      <span>{label}</span>
    </Box>
  );

  return onClick ? <Tooltip title={title}>{body}</Tooltip> : body;
}

export default function PostEngagement({
  targetId,
  targetType,
  commentCount,
  likeCount,
  liked = false,
  url,
  title,
  dense = false,
}: PostEngagementProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLiked, setIsLiked] = useState(liked);
  const [likes, setLikes] = useState(likeCount ?? 0);
  const [comments, setComments] = useState(commentCount ?? 0);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (commentCount !== undefined && likeCount !== undefined) return;

    (async () => {
      const [c, r, user] = await Promise.all([
        supabase.rpc("get_comment_count", { p_post_id: targetId, p_target_type: targetType }),
        supabase.rpc("get_reaction_count", { p_post_id: targetId, p_target_type: targetType }),
        getCurrentUser(),
      ]);
      if (typeof c.data === "number") setComments(c.data);
      if (typeof r.data === "number") setLikes(r.data);

      if (user) {
        const { data: mine } = await supabase
          .from("reactions")
          .select("target_id")
          .eq("user_id", user.id)
          .eq("target_id", targetId)
          .eq("target_type", targetType)
          .maybeSingle();
        setIsLiked(!!mine);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, targetType]);

  const handleLike = async () => {
    if (busy) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    setBusy(true);
    const next = !isLiked;
    setIsLiked(next);
    setLikes((n) => Math.max(0, n + (next ? 1 : -1)));

    const request = next
      ? supabase.from("reactions").insert({
          target_id: targetId,
          target_type: targetType,
          user_id: user.id,
        })
      : supabase
          .from("reactions")
          .delete()
          .eq("target_id", targetId)
          .eq("target_type", targetType)
          .eq("user_id", user.id);

    const { error } = await request;
    if (error) {
      setIsLiked(!next);
      setLikes((n) => Math.max(0, n + (next ? -1 : 1)));
    }
    setBusy(false);
  };

  const handleShare = async () => {
    const full = new URL(url, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, url: full });
      } catch {
        /* compartido cancelado por el usuario */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sin portapapeles ni Web Share: nada que hacer */
    }
  };

  const heart = isLiked ? (
    <FavoriteIcon sx={{ fontSize: dense ? "1rem" : "1.15rem", color: "var(--primary)" }} />
  ) : (
    <FavoriteBorderIcon sx={{ fontSize: dense ? "1rem" : "1.15rem" }} />
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: dense ? 2.5 : 3.5,
        flexWrap: "wrap",
        pt: dense ? 1.5 : 2,
        borderTop: dense ? "none" : "1px solid var(--border-light)",
        mt: dense ? 0 : 1,
      }}
    >
      <Metric
        icon={heart}
        label={likes}
        active={isLiked}
        onClick={handleLike}
        title={isLiked ? "Quitar me gusta" : "Me gusta"}
      />

      <Metric
        icon={<ChatBubbleOutlineIcon sx={{ fontSize: dense ? "1rem" : "1.15rem" }} />}
        label={comments}
        title="Comentarios"
      />

      <Tooltip title={copied ? "Enlace copiado" : "Compartir"}>
        <IconButton
          onClick={handleShare}
          size="small"
          sx={{
            color: copied ? "var(--library-green)" : "var(--foreground-faint)",
            ml: "auto",
            transition: "color 0.2s",
            "&:hover": { bgcolor: "transparent", color: "var(--primary)" },
          }}
          aria-label="Compartir"
        >
          {copied ? (
            <CheckIcon sx={{ fontSize: "1.1rem" }} />
          ) : (
            <ShareIcon sx={{ fontSize: "1.1rem" }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}
