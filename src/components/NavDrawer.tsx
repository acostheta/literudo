"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Home as HomeIcon,
  Article as ArticleIcon,
  Image as ImageIcon,
  EmojiEmotions as MemeIcon,
} from "@mui/icons-material";

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/posts", label: "Artículos", icon: ArticleIcon },
  { href: "/gallery", label: "Galería", icon: ImageIcon },
  { href: "/memes", label: "Memes", icon: MemeIcon },
];

export default function NavDrawer({ open, onClose }: NavDrawerProps) {
  const pathname = usePathname();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 280,
            bgcolor: "#1a1a2e",
            color: "#fff",
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Lora", serif',
            fontSize: "1.3rem",
            fontWeight: 800,
            letterSpacing: -0.5,
          }}
        >
          Literudo
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "rgba(255,255,255,0.6)" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Nav Items */}
      <List sx={{ px: 1, pt: 1.5 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              onClick={onClose}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                bgcolor: isActive ? "rgba(220,53,69,0.2)" : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: isActive ? "#dc3545" : "rgba(255,255,255,0.7)" }}>
                <Icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "0.95rem",
                      fontWeight: isActive ? 700 : 400,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.8)",
                    },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ mt: "auto", p: 2, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <Typography
          variant="caption"
          sx={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", letterSpacing: 1 }}
        >
          © {new Date().getFullYear()} Literudo
        </Typography>
      </Box>
    </Drawer>
  );
}
