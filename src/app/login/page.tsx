"use client";

import { useState } from "react";
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
  Link as MuiLink,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";

type AuthMode = "login" | "register" | "forgot-password";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For registration
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Credenciales incorrectas.");
        setLoading(false);
      } else {
        router.push("/admin");
      }
    } 
    else if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess("¡Cuenta creada! Por favor, revisa tu correo para confirmar (si está habilitado) o intenta iniciar sesión.");
        setLoading(false);
        setMode("login");
      }
    }
    else if (mode === "forgot-password") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Se ha enviado un enlace de recuperación a tu correo.");
      }
      setLoading(false);
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
            {mode !== "login" && (
              <IconButton 
                onClick={() => setMode("login")} 
                sx={{ alignSelf: 'flex-start', mb: -2 }}
              >
                <BackIcon />
              </IconButton>
            )}
            
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
                {mode === "login" ? "INICIAR SESIÓN" : mode === "register" ? "CREAR CUENTA" : "RECUPERAR ACCESO"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", textAlign: "center" }}>
                {mode === "login" 
                  ? '"El conocimiento es la única libertad"' 
                  : mode === "register" 
                    ? "Únete a nuestra comunidad estudiantil" 
                    : "Te enviaremos instrucciones a tu correo"}
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ width: "100%", borderRadius: 0 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ width: "100%", borderRadius: 0 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleAuth} sx={{ width: "100%" }}>
              <Stack spacing={3}>
                {mode === "register" && (
                  <TextField
                    fullWidth
                    label="Nombre Completo"
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>,
                      sx: { borderRadius: 0 }
                    }}
                  />
                )}
                
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>,
                    sx: { borderRadius: 0 }
                  }}
                />

                {mode !== "forgot-password" && (
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                      sx: { borderRadius: 0 }
                    }}
                  />
                )}

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
                  {loading ? <CircularProgress size={24} color="inherit" /> : mode === "login" ? "ENTRAR" : mode === "register" ? "REGISTRARME" : "ENVIAR ENLACE"}
                </Button>

                {mode === "login" && (
                  <Stack spacing={1} sx={{ alignItems: "center" }}>
                    <MuiLink 
                      component="button" 
                      type="button"
                      variant="caption" 
                      onClick={() => setMode("forgot-password")}
                      sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      ¿Olvidaste tu contraseña?
                    </MuiLink>
                    <MuiLink 
                      component="button" 
                      type="button"
                      variant="caption" 
                      onClick={() => setMode("register")}
                      sx={{ color: 'primary.main', fontWeight: 'bold', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      Crear cuenta
                    </MuiLink>
                  </Stack>
                )}
              </Stack>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 4, textAlign: "center", display: "block", width: "100%" }}>
              © {new Date().getFullYear()} Agrupación Estudiantil Literudo
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
