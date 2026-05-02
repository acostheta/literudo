"use client";

import { ReactNode } from "react";
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
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

const drawerWidth = 240;

const navItems = [
  { name: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
  { name: "Users", href: "/admin/users", icon: <PeopleIcon /> },
  { name: "Posts", href: "/admin/posts", icon: <ArticleIcon /> },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`, 
          bgcolor: "white", 
          color: "text.primary", 
          boxShadow: "none", 
          borderBottom: "1px solid #eee",
          borderRadius: 0
        }}
      >
        <Toolbar sx={{ justifyContent: 'center' }}>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: "bold", textAlign: 'center' }}>
            {navItems.find(item => item.href === pathname)?.name || "Literudo Admin"}
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "primary.main",
            color: "white",
            borderRadius: 0,
            border: "none",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 3, width: '100%', textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <Box 
            component="img"
            src="/Logo_UDO.svg"
            alt="Logo UDO"
            sx={{ width: 60, height: 60, mb: 1, mx: "auto", display: "block" }}
          />
          <Box sx={{ width: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5, letterSpacing: 1, textAlign: 'center' }}>
              Literudo
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center', display: 'block' }}>
              Admin Panel
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
        <List sx={{ mt: 2, p: 0 }}>
          {navItems.map((item) => (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                sx={{
                  py: 1.5,
                  px: 3,
                  flexDirection: 'column',
                  alignItems: 'center',
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
                <ListItemIcon sx={{ color: "inherit", minWidth: 0, mb: 0.5 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography 
                      variant="body2" 
                      component="span"
                      sx={{ 
                        fontWeight: pathname === item.href ? "bold" : "normal",
                        fontSize: "0.85rem",
                        fontFamily: "inherit",
                        textAlign: 'center',
                        display: 'block'
                      }}
                    >
                      {item.name}
                    </Typography>
                  } 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 'auto', p: 0 }}>
          <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={async () => {
                const supabase = (await import('@/lib/supabase/client')).createClient();
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              sx={{
                py: 2,
                px: 3,
                flexDirection: 'column',
                alignItems: 'center',
                "&:hover": {
                  bgcolor: "rgba(220, 53, 69, 0.2)", // Subtle red hover
                },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 0, mb: 0.5 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="body2" component="span" sx={{ fontSize: "0.85rem", textAlign: 'center', display: 'block' }}>
                    Cerrar Sesión
                  </Typography>
                } 
              />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, bgcolor: "background.default", p: 3, mt: 8, minHeight: "100vh" }}
      >
        {children}
      </Box>
    </Box>
  );
}
