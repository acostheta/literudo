"use client";

import { ReactNode, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  Image as ImageIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

const DRAWER_WIDTH = 240;
const COLLAPSED_DRAWER_WIDTH = 80;

const navItems = [
  { name: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
  { name: "Usuarios", href: "/admin/users", icon: <PeopleIcon /> },
  { name: "Artículos", href: "/admin/posts", icon: <ArticleIcon /> },
  { name: "Galería", href: "/admin/gallery", icon: <ImageIcon /> },
];

function DrawerContent({ collapsed, toggleDrawer, pathname, onNavigate }: {
  collapsed: boolean;
  toggleDrawer: () => void;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Box sx={{
        p: 2,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        minHeight: 80
      }}>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              component="img"
              src="/Logo_UDO.svg"
              alt="Logo UDO"
              sx={{ width: 40, height: 40, flexShrink: 0 }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", lineHeight: 1, letterSpacing: 0.5 }}>
                Literudo
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                Admin
              </Typography>
            </Box>
          </Box>
        )}

        {collapsed && (
          <Box
            component="img"
            src="/Logo_UDO.svg"
            alt="Logo UDO"
            sx={{ width: 40, height: 40 }}
          />
        )}

        <IconButton onClick={toggleDrawer} sx={{ color: 'white', ml: collapsed ? 0 : 1 }}>
          {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

      <List sx={{ mt: 2, p: 0 }}>
        {navItems.map((item) => (
          <ListItem key={item.href} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={collapsed ? item.name : ""} placement="right">
              <ListItemButton
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                onClick={onNavigate}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                  py: 1.5,
                  borderRadius: "0 !important",
                  borderLeft: pathname === item.href ? "4px solid #fff" : "4px solid transparent",
                  "&.Mui-selected": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.05)",
                  },
                }}
              >
                <ListItemIcon sx={{
                  color: "inherit",
                  minWidth: 0,
                  mr: collapsed ? 0 : 3,
                  justifyContent: 'center',
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  sx={{ opacity: collapsed ? 0 : 1 }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 0 }}>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />

        <Tooltip title={collapsed ? "Ir a la página" : ""} placement="right">
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              href="/"
              onClick={onNavigate}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'initial',
                px: 2.5,
                py: 1.5,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              <ListItemIcon sx={{
                color: "inherit",
                minWidth: 0,
                mr: collapsed ? 0 : 3,
                justifyContent: 'center',
              }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="Ir a la página"
                sx={{ opacity: collapsed ? 0 : 1 }}
              />
            </ListItemButton>
          </ListItem>
        </Tooltip>

        <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
        <Tooltip title={collapsed ? "Cerrar Sesión" : ""} placement="right">
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              onClick={async () => {
                const supabase = (await import('@/lib/supabase/client')).createClient();
                await supabase.auth.signOut();
                document.cookie = 'literudo_remember=; path=/; max-age=0; samesite=lax';
                window.location.href = '/login';
              }}
              sx={{
                minHeight: 48,
                justifyContent: collapsed ? 'center' : 'initial',
                px: 2.5,
                py: 2,
                "&:hover": {
                  bgcolor: "rgba(220, 53, 69, 0.2)",
                },
              }}
            >
              <ListItemIcon sx={{
                color: "inherit",
                minWidth: 0,
                mr: collapsed ? 0 : 3,
                justifyContent: 'center',
              }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText
                primary="Cerrar Sesión"
                sx={{ opacity: collapsed ? 0 : 1 }}
              />
            </ListItemButton>
          </ListItem>
        </Tooltip>
      </Box>
    </>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setCollapsed((prev) => !prev);
    }
  }, [isMobile]);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const currentDrawerWidth = isMobile ? 0 : (collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH);

  const drawerSx = {
    overflowX: 'hidden',
    bgcolor: "primary.main",
    color: "white",
    borderRadius: 0,
    border: "none",
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { md: `${currentDrawerWidth}px` },
          bgcolor: "white",
          color: "text.primary",
          boxShadow: "none",
          borderBottom: "1px solid #eee",
          borderRadius: 0,
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'center', minHeight: { xs: 56, md: 64 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              sx={{ position: 'absolute', left: 8 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: "bold", textAlign: 'center', fontSize: { xs: '0.95rem', md: '1.25rem' } }}>
            {navItems.find(item => item.href === pathname)?.name || "Panel Administrativo"}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              ...drawerSx,
            },
          }}
        >
          <DrawerContent
            collapsed={false}
            toggleDrawer={handleDrawerToggle}
            pathname={pathname}
            onNavigate={handleDrawerToggle}
          />
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open={!collapsed}
          sx={{
            width: currentDrawerWidth,
            flexShrink: 0,
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
            "& .MuiDrawer-paper": {
              width: currentDrawerWidth,
              transition: (theme) => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              ...drawerSx,
            },
          }}
        >
          <DrawerContent
            collapsed={collapsed}
            toggleDrawer={toggleDrawer}
            pathname={pathname}
          />
        </Drawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: { xs: 1.5, md: 3 },
          mt: { xs: 7, md: 8 },
          minHeight: "100vh",
          transition: (theme) => theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
