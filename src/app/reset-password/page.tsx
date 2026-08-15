"use client";

import { useRouter } from "next/navigation";
import { Box, Container, Typography, Paper, Stack } from "@mui/material";
import PasswordRecoveryWizard from "@/components/PasswordRecoveryWizard";

export default function ResetPasswordPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f4f4f2",
        backgroundImage: "radial-gradient(#d1d1cf 0.5px, transparent 0.5px)",
        backgroundSize: "20px 20px",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 0,
            border: "1px solid #e0e0e0",
            backgroundColor: "white",
            boxShadow: "20px 20px 60px #d9d9d7, -20px -20px 60px #ffffff",
          }}
        >
          <Stack spacing={4} sx={{ width: "100%", alignItems: "center" }}>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mb: 0 }}>
              <Box
                component="img"
                src="/Logo_UDO.svg"
                alt="Logo UDO"
                sx={{ width: 140, height: 140 }}
              />
            </Box>

            <Box sx={{ width: "100%", textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: "bold", letterSpacing: 1, mb: 1, textAlign: "center" }}>
                RECUPERAR ACCESO
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", textAlign: "center" }}>
                Ingresa tu correo y te enviaremos un código para restablecer tu contraseña
              </Typography>
            </Box>

            <PasswordRecoveryWizard onSuccess={() => router.push("/login")} />

            <Typography variant="caption" color="text.secondary" sx={{ mt: 4, textAlign: "center", display: "block", width: "100%" }}>
              © {new Date().getFullYear()} Agrupación Estudiantil Literudo
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}