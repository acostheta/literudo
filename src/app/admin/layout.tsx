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
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, bgcolor: "white", color: "text.primary", boxShadow: "none", borderBottom: "1px solid #eee" }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: "bold" }}>
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
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
            Literudo
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            Student Admin Panel
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.1)" }} />
        <List sx={{ px: 1, mt: 2 }}>
          {navItems.map((item) => (
            <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                sx={{
                  borderRadius: 0,
                  "&.Mui-selected": {
                    bgcolor: "rgba(255,255,255,0.15)",
                  },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
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
