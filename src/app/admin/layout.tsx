"use client";

import { ReactNode, useState } from "react";
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
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";

const DRAWER_WIDTH = 240;
const COLLAPSED_DRAWER_WIDTH = 80;

const navItems = [
  { name: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
  { name: "Usuarios", href: "/admin/users", icon: <PeopleIcon /> },
  { name: "Artículos", href: "/admin/posts", icon: <ArticleIcon /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const toggleDrawer = () => {
    setCollapsed(!collapsed);
  };

  const currentDrawerWidth = collapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ 
          width: `calc(100% - ${currentDrawerWidth}px)`, 
          ml: `${currentDrawerWidth}px`, 
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
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: "bold", textAlign: 'center' }}>
            {navItems.find(item => item.href === pathname)?.name || "Panel Administrativo"}
          </Typography>
        </Toolbar>
      </AppBar>
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
            overflowX: 'hidden',
            bgcolor: "primary.main",
            color: "white",
            borderRadius: 0,
            border: "none",
          },
        }}
      >
        {/* Header con Logo y Toggle */}
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
          <Tooltip title={collapsed ? "Cerrar Sesión" : ""} placement="right">
            <ListItem disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={async () => {
                  const supabase = (await import('@/lib/supabase/client')).createClient();
                  await supabase.auth.signOut();
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
      </Drawer>
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          bgcolor: "background.default", 
          p: 3, 
          mt: 8, 
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
