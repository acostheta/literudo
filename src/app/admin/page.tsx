"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  People as PeopleIcon,
  Article as ArticleIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";

interface Stats {
  activeUsers: number;
  inactiveUsers: number;
  totalPosts: number;
  topUsers: { name: string; avatar_url: string; post_count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Usuarios activos/inactivos
      const { data: profiles } = await supabase
        .from("profiles")
        .select("status");
      
      const active = profiles?.filter(p => p.status === 'activo').length || 0;
      const inactive = (profiles?.length || 0) - active;

      // 2. Total de posts
      const { count: postCount } = await supabase
        .from("posts")
        .select("*", { count: 'exact', head: true });

      // 3. Top 5 usuarios con más posts
      // Nota: Supabase client no soporta GROUP BY fácilmente, usaremos una consulta RPC o cruda si fuera necesario, 
      // pero aquí haremos una lógica simple ya que esperamos pocos usuarios para este demo.
      const { data: topData } = await supabase
        .from("profiles")
        .select("name, avatar_url, posts(id)");

      const sortedUsers = (topData || [])
        .map(u => ({
          name: u.name,
          avatar_url: u.avatar_url,
          post_count: (u.posts as any[]).length
        }))
        .sort((a, b) => b.post_count - a.post_count)
        .slice(0, 5);

      setStats({
        activeUsers: active,
        inactiveUsers: inactive,
        totalPosts: postCount || 0,
        topUsers: sortedUsers
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  const StatCard = ({ title, value, subValue, icon, color }: any) => (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 0, 
        border: '1px solid #eee',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': { boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }
      }}
    >
      <Box sx={{ position: 'absolute', top: -10, right: -10, opacity: 0.05 }}>
        {icon}
      </Box>
      <Typography variant="overline" sx={{ letterSpacing: 2, color: 'text.secondary', fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 800, my: 1, fontFamily: '"Lora", serif' }}>
        {value}
      </Typography>
      {subValue && (
        <Typography variant="caption" sx={{ color: color || 'text.secondary', fontWeight: 600 }}>
          {subValue}
        </Typography>
      )}
    </Paper>
  );

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1 }}>
        Dashboard Administrativo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
        Bienvenido al centro de control de Literudo. Aquí tienes el pulso de la comunidad.
      </Typography>

      <Grid container spacing={4}>
        {/* Estadísticas Rápidas */}
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard 
            title="Usuarios" 
            value={stats?.activeUsers} 
            subValue={`${stats?.inactiveUsers} inactivos`} 
            color="error.main"
            icon={<PeopleIcon sx={{ fontSize: 100 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard 
            title="Obras Escritas" 
            value={stats?.totalPosts} 
            subValue="Crecimiento +12%" 
            color="success.main"
            icon={<ArticleIcon sx={{ fontSize: 100 }} />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard 
            title="Tasa de Actividad" 
            value="85%" 
            subValue="Comunidad vibrante" 
            icon={<TrendingIcon sx={{ fontSize: 100 }} />}
          />
        </Grid>

        {/* Top Usuarios */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 0, border: '1px solid #eee' }}>
            <Stack direction="row" spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
              <TrophyIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Top Autores</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {stats?.topUsers.map((user, index) => (
                <ListItem key={index} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar alt={user.name} src={user.avatar_url} sx={{ bgcolor: 'primary.main', fontWeight: 'bold' }}>
                      {user.name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 700 }}>{user.name}</Typography>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {user.post_count} obras publicadas
                      </Typography>
                    }
                  />
                  <Box sx={{ alignSelf: 'center' }}>
                    <Chip label={`#${index + 1}`} size="small" variant="outlined" sx={{ borderRadius: 0, fontWeight: 800 }} />
                  </Box>
                </ListItem>
              ))}
              {stats?.topUsers.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  Aún no hay autores registrados.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Acciones Rápidas o Más Info */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              borderRadius: 0, 
              border: '1px solid #eee', 
              bgcolor: '#1a1a1a', 
              color: 'white',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h5" sx={{ fontFamily: '"Lora", serif', fontWeight: 700, mb: 2 }}>
              "La literatura es la única libertad que nos queda."
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 4 }}>
              Sigue fomentando la creación de contenido de calidad. Tu gestión es el motor de Literudo.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" sx={{ bgcolor: 'white', color: 'black', borderRadius: 0, '&:hover': { bgcolor: '#eee' } }}>
                Ver Reportes
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
