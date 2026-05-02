import { supabase } from "@/lib/supabase";
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Stack,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Email as EmailIcon,
  Security as RoleIcon,
  Info as BioIcon,
  Settings as StatusIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { notFound } from "next/navigation";
import UserDetailActions from "@/components/UserDetailActions";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !user) {
    notFound();
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        component={Link}
        href="/admin/users"
        startIcon={<BackIcon />}
        sx={{ mb: 4 }}
      >
        Volver a la lista
      </Button>

      <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems="center" sx={{ mb: 5 }}>
          <Avatar
            src={user.avatar_url}
            sx={{ width: 150, height: 150, border: '4px solid #f0f0f0' }}
          >
            {user.name.charAt(0)}
          </Avatar>
          <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
              {user.name}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }} sx={{ mb: 1 }}>
              <Chip 
                label={user.role} 
                size="small"
                color={user.role === "Administrador" ? "primary" : "default"} 
                icon={<RoleIcon fontSize="small" />}
              />
              <Chip 
                label={user.status} 
                size="small"
                color={user.status === "activo" ? "success" : "warning"} 
                variant="outlined"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <EmailIcon sx={{ fontSize: 16 }} /> {user.email}
            </Typography>

            <UserDetailActions user={user} />
          </Box>
        </Stack>

        <Divider sx={{ mb: 4 }} />

        <Stack spacing={4}>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BioIcon fontSize="small" /> Biografía / Sobre mí
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: 'text.primary', fontStyle: 'italic' }}>
              {user.about_me || "Este usuario aún no ha escrito nada sobre sí mismo."}
            </Typography>
          </Box>

          <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
             <Typography variant="caption" color="text.secondary">
               Miembro desde: {new Date(user.created_at).toLocaleDateString('es-ES', {
                 day: 'numeric',
                 month: 'long',
                 year: 'numeric'
               })}
             </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
