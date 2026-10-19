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
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  AutoStories,
  CollectionsBookmark,
  PhotoCamera,
  Newspaper,
  Groups,
  Mail,
  AdminPanelSettings,
  Login,
} from "@mui/icons-material";

interface NavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { href: "/", label: "Inicio", icon: AutoStories },
  { href: "/posts", label: "Artículos", icon: CollectionsBookmark },
  { href: "/gallery", label: "Galería", icon: PhotoCamera },
  { href: "/noticias", label: "Noticias", icon: Newspaper },
  { href: "/sobre-nosotros", label: "Sobre Nosotros", icon: Groups },
  { href: "/contacto", label: "Contáctanos", icon: Mail },
  { href: "/admin", label: "Panel", icon: AdminPanelSettings },
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
            width: 300,
            bgcolor: "#fbf5ec",
            color: "#241812",
            borderRight: "1px solid #d8c8b4",
            backgroundImage: "linear-gradient(to bottom, #fdfaf5, #f7efe4)",
          },
        },
      }}
    >
      {/* Cabecera del Drawer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2.5,
          py: 2.5,
          borderBottom: "1px solid #d8c8b4",
          bgcolor: "#3a2820",
          color: "#fcf8f2",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            component="img"
            src="/Logo_UDO.svg"
            alt="Logo UDO"
            sx={{ width: 32, height: 32, filter: "brightness(1.1)" }}
          />
          <Box>
            <Typography
              sx={{
                fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
                fontSize: "1.2rem",
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "#fcf8f2",
                lineHeight: 1.1,
              }}
            >
              LITERUDO
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "var(--font-sans)",
                fontSize: "0.68rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#d49b38",
                display: "block",
              }}
            >
              Online
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "rgba(252, 248, 242, 0.7)", "&:hover": { color: "#fff" } }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Lista de Navegación */}
      <List sx={{ px: 1.5, pt: 2, flex: 1 }}>
        <Typography
          variant="overline"
          sx={{
            px: 1.5,
            color: "#8a7568",
            fontSize: "0.68rem",
            letterSpacing: "0.15em",
            fontWeight: 700,
          }}
        >
          Secciones
        </Typography>

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
                borderRadius: "4px",
                my: 0.5,
                py: 1.1,
                px: 1.5,
                bgcolor: isActive ? "rgba(107, 29, 34, 0.1)" : "transparent",
                border: isActive ? "1px solid rgba(107, 29, 34, 0.2)" : "1px solid transparent",
                "&:hover": {
                  bgcolor: "rgba(107, 29, 34, 0.06)",
                  borderColor: "rgba(107, 29, 34, 0.12)",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 38,
                  color: isActive ? "#6b1d22" : "#5e4a3e",
                }}
              >
                <Icon sx={{ fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "0.92rem",
                      fontWeight: isActive ? 700 : 500,
                      fontFamily: "var(--font-serif)",
                      color: isActive ? "#6b1d22" : "#241812",
                    },
                  },
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* Acceso Rápido y Pie de Drawer */}
      <Box sx={{ p: 2, borderTop: "1px solid #d8c8b4", bgcolor: "#f5eee6" }}>
        <ListItemButton
          component={Link}
          href="/login"
          onClick={onClose}
          sx={{
            borderRadius: "4px",
            border: "1px solid #d8c8b4",
            bgcolor: "#fcf8f2",
            mb: 2,
            "&:hover": { bgcolor: "#f5eee6" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "#6b1d22" }}>
            <Login sx={{ fontSize: 19 }} />
          </ListItemIcon>
          <ListItemText
            primary="Iniciar Sesión"
            slotProps={{
              primary: {
                sx: {
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  fontFamily: "var(--font-sans)",
                  color: "#241812",
                },
              },
            }}
          />
        </ListItemButton>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: "#8a7568",
            fontSize: "0.72rem",
            fontStyle: "italic",
            fontFamily: "var(--font-serif)",
          }}
        >
          Literudo · Universidad de Oriente
        </Typography>
      </Box>
    </Drawer>
  );
}
