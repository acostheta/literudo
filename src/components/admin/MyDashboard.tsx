"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getCurrentProfile } from "@/lib/permissions";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  Article as ArticleIcon,
  Image as ImageIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import MyProfileModal, { MyProfile } from "@/components/admin/MyProfileModal";

interface Item {
  id: string;
  title: string;
  status: string;
  created_at: string;
  type: "articulo" | "galeria";
  href: string;
}

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

export default function MyDashboard() {
  const supabase = createClient();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileData, { data: posts }, { data: galleries }] = await Promise.all([
        getCurrentProfile(supabase),
        supabase.from("posts").select("id, title, status, created_at").eq("author_id", user.id),
        supabase.from("gallery_posts").select("id, title, status, created_at").eq("author_id", user.id),
      ]);

      const articles: Item[] = (posts || []).map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        created_at: p.created_at,
        type: "articulo",
        href: `/admin/posts/edit/${p.id}`,
      }));
      const gallery: Item[] = (galleries || []).map((g) => ({
        id: g.id,
        title: g.title,
        status: g.status,
        created_at: g.created_at,
        type: "galeria",
        href: `/admin/gallery/edit/${g.id}`,
      }));

      setProfile(profileData);
      setItems([...articles, ...gallery].sort((a, b) => b.created_at.localeCompare(a.created_at)));
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 10 }}>
        <CircularProgress color="inherit" />
      </Box>
    );
  }

  const articles = items.filter((i) => i.type === "articulo");
  const galleries = items.filter((i) => i.type === "galeria");
  const published = items.filter((i) => i.status === "publicado").length;
  const drafts = items.length - published;

  const StatCard = ({ title, value, subValue, icon }: { title: string; value: number; subValue: string; icon: React.ReactNode }) => (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: "1px solid #eee", height: "100%", position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", top: -10, right: -10, opacity: 0.05 }}>{icon}</Box>
      <Typography variant="overline" sx={{ letterSpacing: 2, color: "text.secondary", fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ fontWeight: 800, my: 1, fontFamily: '"Lora", serif' }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
        {subValue}
      </Typography>
    </Paper>
  );

  return (
    <Box sx={{ py: { xs: 1, md: 2 } }}>
      {profile && (
        <MyProfileModal
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          profile={profile}
          onSaved={setProfile}
        />
      )}

      <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: -1, fontSize: { xs: "1.5rem", md: "2.125rem" } }}>
        Hola, {profile?.name || "usuario"}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: { xs: 3, md: 6 } }}>
        Aquí tienes tus datos y tu actividad en Literudo.
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 0, border: "1px solid #eee", height: "100%" }}>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
              <Avatar src={profile?.avatar_url || undefined} sx={{ width: 64, height: 64, border: "1px solid #eee" }}>
                {profile?.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>{profile?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{profile?.email}</Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <Chip label={profile?.role} size="small" color="primary" sx={{ borderRadius: 0 }} />
              <Chip
                label={profile?.status === "activo" ? "Activo" : "Inactivo"}
                size="small"
                color={profile?.status === "activo" ? "success" : "default"}
                sx={{ borderRadius: 0 }}
              />
            </Stack>

            <Divider sx={{ mb: 2 }} />
            <Typography variant="overline" sx={{ letterSpacing: 2, color: "text.secondary", fontWeight: 700 }}>
              Sobre mí
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, whiteSpace: "pre-line" }}>
              {profile?.about_me || "Aún no has escrito nada sobre ti."}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Miembro desde {profile ? formatDate(profile.created_at) : "—"}
            </Typography>

            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setOpenEdit(true)} disabled={!profile} sx={{ borderRadius: 0 }}>
              Editar mis datos
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard title="Artículos" value={articles.length} subValue={`${articles.filter((a) => a.status === "publicado").length} publicados`} icon={<ArticleIcon sx={{ fontSize: 100 }} />} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard title="Galerías" value={galleries.length} subValue={`${galleries.filter((g) => g.status === "publicado").length} publicadas`} icon={<ImageIcon sx={{ fontSize: 100 }} />} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StatCard title="Borradores" value={drafts} subValue={`${published} publicados en total`} icon={<EditIcon sx={{ fontSize: 100 }} />} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 0, border: "1px solid #eee" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Tu actividad reciente</Typography>
                <Divider sx={{ mb: 1 }} />
                <List sx={{ p: 0 }}>
                  {items.slice(0, 5).map((item) => (
                    <ListItem key={`${item.type}-${item.id}`} disableGutters divider secondaryAction={
                      <Button component={Link} href={item.href} size="small" sx={{ borderRadius: 0 }}>
                        Editar
                      </Button>
                    }>
                      <ListItemText
                        primary={<Typography sx={{ fontWeight: 700 }}>{item.title}</Typography>}
                        secondary={`${item.type === "articulo" ? "Artículo" : "Galería"} · ${item.status === "publicado" ? "Publicado" : "Borrador"} · ${formatDate(item.created_at)}`}
                      />
                    </ListItem>
                  ))}
                  {items.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
                      Aún no tienes artículos ni galerías.
                    </Typography>
                  )}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
