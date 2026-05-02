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
            <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
              <Chip 
                label={user.role} 
                color={user.role === "Administrador" ? "primary" : "default"} 
                icon={<RoleIcon />}
              />
              <Chip 
                label={user.status} 
                color={user.status === "activo" ? "success" : "warning"} 
                variant="outlined"
              />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ mb: 4 }} />

        <Stack spacing={4}>
          <Box>
            <Typography variant="overline" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon fontSize="small" /> Email de contacto
            </Typography>
            <Typography variant="h6">{user.email}</Typography>
          </Box>

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
               ID del Usuario: {user.id}
             </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
