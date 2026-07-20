"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock as LockIcon,
} from "@mui/icons-material";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setHasSession(true);
      }
      setCheckingSession(false);
    };
    checkSession();
  }, [supabase]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess("¡Contraseña actualizada! Redirigiendo al panel...");
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    }
  };

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
                NUEVA CONTRASEÑA
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", textAlign: "center" }}>
                Elige una nueva contraseña para tu cuenta
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ width: "100%", borderRadius: 0 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ width: "100%", borderRadius: 0 }}>{success}</Alert>}

            {checkingSession ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : !hasSession ? (
              <Alert severity="warning" sx={{ width: "100%", borderRadius: 0 }}>
                El enlace de recuperación no es válido o ha expirado.{" "}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => router.push("/login")}
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                >
                  Volver al inicio de sesión
                </Button>
              </Alert>
            ) : (
              <Box component="form" onSubmit={handleResetPassword} sx={{ width: "100%" }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Nueva Contraseña"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                  />

                  <TextField
                    fullWidth
                    label="Confirmar Contraseña"
                    type={showConfirmPassword ? "text" : "password"}
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0 } }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: 0,
                      fontWeight: "bold",
                      boxShadow: "none",
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "ACTUALIZAR CONTRASEÑA"}
                  </Button>
                </Stack>
              </Box>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 4, textAlign: "center", display: "block", width: "100%" }}>
              © {new Date().getFullYear()} Agrupación Estudiantil Literudo
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
