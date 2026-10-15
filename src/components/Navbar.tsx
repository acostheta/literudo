"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import NavDrawer from "./NavDrawer";
import {
  Menu as MenuIcon,
  AutoStories,
  CollectionsBookmark,
  AdminPanelSettings,
  PersonOutlined,
} from "@mui/icons-material";
import { createClient } from "@/lib/supabase/client";

export default function Navbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const navLinks = [
    { href: "/", label: "Inicio", icon: <AutoStories sx={{ fontSize: 18 }} /> },
    { href: "/posts", label: "Artículos", icon: <CollectionsBookmark sx={{ fontSize: 18 }} /> },
    { href: "/gallery", label: "Galería", icon: <CollectionsBookmark sx={{ fontSize: 18 }} /> },
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0.75rem 1.5rem",
          }}
        >
          {/* Logo y Menú Móvil */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menú"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                cursor: "pointer",
                padding: "0.35rem 0.5rem",
                color: "var(--foreground)",
                display: "flex",
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
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#fdfbf7",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 4px rgba(60, 40, 25, 0.08)",
                }}
              >
                <img
                  src="/Logo_UDO.svg"
                  alt="Literudo"
                  style={{ width: "24px", height: "24px", objectFit: "contain" }}
                />
              </div>

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
              gap: "2rem",
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
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {user ? (
              <>
                <Link
                  href="/admin"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.45rem 1rem",
                    background: "var(--primary-faint)",
                    color: "var(--primary)",
                    borderRadius: "4px",
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-sans)",
                    fontWeight: 600,
                    textDecoration: "none",
                    border: "1px solid rgba(107, 29, 34, 0.3)",
                  }}
                >
                  <AdminPanelSettings sx={{ fontSize: 17 }} />
                  <span>Panel</span>
                </Link>
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
          @media (max-width: 768px) {
            .desktop-nav {
              display: none !important;
            }
          }
        `}</style>
      </header>

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
