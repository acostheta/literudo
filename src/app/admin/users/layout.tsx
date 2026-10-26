import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, isAdminRole } from "@/lib/permissions";

// La seguridad real es el RLS; esto solo evita que un Usuario vea una pantalla
// vacía o a medias cuando entra a /admin/users.
export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const profile = await getCurrentProfile(supabase);

  if (!isAdminRole(profile?.role)) {
    return (
      <Box sx={{ py: 10, textAlign: "center" }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
          403
        </Typography>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Acceso restringido
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Solo un Administrador puede gestionar usuarios.
        </Typography>
        <Button component={Link} href="/admin" variant="contained" sx={{ borderRadius: 0 }}>
          Volver al panel
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}
