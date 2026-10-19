"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import NavDrawer from "./NavDrawer";
import {
  Menu as MenuIcon,
  AdminPanelSettings,
  PersonOutlined,
  ExpandMore,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Menu, MenuItem, Avatar, Box, Divider, Stack, Typography } from "@mui/material";
import { createClient, getCurrentUser } from "@/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const closeMenu = () => setMenuAnchor(null);

  const handleSignOut = async () => {
    closeMenu();
    const supabase = createClient();
    await supabase.auth.signOut();
    document.cookie = "literudo_remember=; path=/; max-age=0; samesite=lax";
    window.location.href = "/login";
  };

  useEffect(() => {
    if (!user) {
      setProfileName(null);
      setProfileAvatar(null);
      return;
    }
    let active = true;
    createClient()
      .from("profiles")
      .select("name, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (!active) return;
        setProfileName(data?.name ?? null);
        setProfileAvatar(data?.avatar_url ?? null);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const displayName = profileName || user?.email?.split("@")[0] || "Mi cuenta";

  useEffect(() => {
    const supabase = createClient();
    getCurrentUser().then(setUser);

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/posts", label: "Artículos" },
    { href: "/gallery", label: "Galería" },
    { href: "/noticias", label: "Noticias" },
    { href: "/sobre-nosotros", label: "Sobre Nosotros" },
    { href: "/contacto", label: "Contáctanos" },
  ];

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          zIndex: 900,
          backgroundColor: "rgba(245, 238, 230, 0.96)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "0 2px 10px rgba(60, 40, 25, 0.05)",
        }}
      >
        {/* Línea dorada superior como lomo de libro encuadernado */}
        <div
          style={{
            height: "3px",
            background: "linear-gradient(90deg, #6b1d22 0%, #b88228 35%, #d49b38 50%, #b88228 65%, #6b1d22 100%)",
            width: "100%",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0.75rem 1.5rem",
          }}
        >
          {/* Logo y Menú Móvil */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", justifySelf: "start" }}>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú"
              className="mobile-menu"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                cursor: "pointer",
                padding: "0.35rem 0.5rem",
                color: "var(--foreground)",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <MenuIcon sx={{ fontSize: 22 }} />
            </button>

            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <img
                src="/logo_literudo.png"
                alt="Literudo"
                style={{ width: "44px", height: "44px", objectFit: "contain" }}
              />

              <div>
                <span
                  style={{
                    fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
                    fontSize: "1.35rem",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    color: "var(--primary)",
                    display: "block",
                    lineHeight: 1.1,
                  }}
                >
                  LITERUDO
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.68rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--foreground-muted)",
                    display: "block",
                    fontWeight: 600,
                  }}
                >
                  Online
                </span>
              </div>
            </Link>
          </div>

          {/* Enlaces de Navegación de Escritorio */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}
            className="desktop-nav"
          >
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: isActive ? "var(--primary)" : "var(--foreground-muted)",
                    fontFamily: "var(--font-serif)",
                    fontSize: "0.95rem",
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: "none",
                    position: "relative",
                    padding: "0.3rem 0",
                    transition: "color 0.2s",
                  }}
                >
                  {link.label}
                  {isActive && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: "15%",
                        right: "15%",
                        height: "2px",
                        background: "var(--primary)",
                        borderRadius: "2px",
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Acciones del Lector / Acceso */}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", justifySelf: "end" }}>
            {user ? (
              <>
                <button
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  aria-haspopup="menu"
                  aria-expanded={Boolean(menuAnchor)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.45rem 0.9rem",
                    background: "var(--primary-faint)",
                    color: "var(--primary)",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    border: "1px solid rgba(107, 29, 34, 0.3)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Avatar
                    src={profileAvatar ?? undefined}
                    alt={displayName}
                    sx={{
                      width: 26,
                      height: 26,
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      bgcolor: "var(--primary)",
                      color: "#fcf8f2",
                      border: "1px solid rgba(107, 29, 34, 0.25)",
                    }}
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </Avatar>
                  <span>{displayName}</span>
                  <ExpandMore sx={{ fontSize: 16 }} />
                </button>

                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={closeMenu}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1,
                        minWidth: 220,
                        bgcolor: "#ffffff",
                        backgroundImage: "none",
                        border: "1px solid var(--border)",
                        boxShadow:
                          "0 10px 30px -6px rgba(60, 40, 25, 0.28), 0 2px 6px rgba(60, 40, 25, 0.12)",
                      },
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5, minWidth: 220 }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Avatar
                        src={profileAvatar ?? undefined}
                        alt={displayName}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "var(--primary)",
                          color: "#fcf8f2",
                          fontWeight: 700,
                          border: "1px solid rgba(107, 29, 34, 0.25)",
                        }}
                      >
                        {displayName.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
                          {displayName}
                        </Typography>
                        {user.email && (
                          <Typography variant="caption" noWrap sx={{ color: "var(--foreground-muted)", display: "block" }}>
                            {user.email}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                  <Divider sx={{ mb: 0.5 }} />
                  <MenuItem component={Link} href="/perfil" onClick={closeMenu}>
                    <PersonOutlined sx={{ fontSize: 18, mr: 1.5, color: "var(--foreground-muted)" }} />
                    Mi perfil
                  </MenuItem>
                  <MenuItem component={Link} href="/admin" onClick={closeMenu}>
                    <AdminPanelSettings sx={{ fontSize: 18, mr: 1.5, color: "var(--foreground-muted)" }} />
                    Panel
                  </MenuItem>
                  <MenuItem onClick={handleSignOut}>
                    <LogoutIcon sx={{ fontSize: 18, mr: 1.5, color: "var(--foreground-muted)" }} />
                    Cerrar Sesión
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.45rem 0.9rem",
                    background: "transparent",
                    color: "var(--foreground-muted)",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    textDecoration: "none",
                    border: "1px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <PersonOutlined sx={{ fontSize: 18 }} />
                  <span>Ingresar</span>
                </Link>

                <Link
                  href="/login?mode=register"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.45rem 1rem",
                    background: "var(--primary-faint)",
                    color: "var(--primary)",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    textDecoration: "none",
                    border: "1px solid rgba(107, 29, 34, 0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  Unirse
                </Link>
              </>
            )}
          </div>
        </div>

        <style jsx>{`
          .mobile-menu {
            display: none;
          }
          @media (max-width: 1024px) {
            .desktop-nav {
              display: none !important;
            }
            .mobile-menu {
              display: flex;
            }
          }
        `}</style>
      </header>

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
