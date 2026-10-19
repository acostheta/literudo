"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import PasswordRecoveryWizard from "@/components/PasswordRecoveryWizard";
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
  FormControlLabel,
  Checkbox,
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "forgot-password") {
      setMode("forgot-password");
    } else if (params.get("mode") === "register") {
      setMode("register");
    }
  }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password: password.trim() 
      });
      if (error) {
        setError("Credenciales incorrectas.");
        setLoading(false);
      } else {
        document.cookie = rememberMe
          ? `literudo_remember=1; path=/; max-age=2592000; samesite=lax`
          : `literudo_remember=0; path=/; samesite=lax`;
        router.push("/admin");
      }
    } 
    else if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { name: name.trim() },
        },
      });
      
      if (error) {
        console.error("Auth Error:", error);
        setError(error.message);
        setLoading(false);
      } else {
        if (data.session) {
          router.push("/admin");
        } else {
          setSuccess("¡Cuenta creada! Por favor, revisa tu correo para confirmar y poder entrar.");
          setLoading(false);
        }
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5eee6",
        backgroundImage: "radial-gradient(#d8c8b4 0.6px, transparent 0.6px)",
        backgroundSize: "22px 22px",
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: "4px",
            border: "1px solid #d8c8b4",
            backgroundColor: "#fcf8f2",
            boxShadow: "0 12px 40px rgba(60, 40, 25, 0.12), 0 2px 8px rgba(60, 40, 25, 0.06)",
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, #6b1d22 0%, #b88228 35%, #d49b38 50%, #b88228 65%, #6b1d22 100%)",
            },
          }}
        >
          <Stack spacing={4} sx={{ width: "100%", alignItems: "center" }}>
            {mode !== "login" && (
              <IconButton 
                onClick={() => setMode("login")} 
                sx={{ alignSelf: "flex-start", mb: -2, color: "#5e4a3e" }}
              >
                <BackIcon />
              </IconButton>
            )}
            
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mb: 0 }}>
              <Box
                component="img"
                src="/logo_literudo.png"
                alt="Literudo"
                sx={{ width: 120, height: 120, objectFit: "contain" }}
              />
            </Box>
            
            <Box sx={{ width: "100%", textAlign: "center" }}>
              <Typography
                sx={{
                  fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
                  fontWeight: 700,
                  fontSize: "1.6rem",
                  letterSpacing: "0.06em",
                  mb: 1,
                  color: "#241812",
                }}
              >
                {mode === "login" ? "INICIAR SESIÓN" : mode === "register" ? "CREAR CUENTA" : "RECUPERAR CONTRASEÑA"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontStyle: "italic",
                  color: "#5e4a3e",
                  fontFamily: "var(--font-lora), Georgia, serif",
                }}
              >
                {mode === "login" 
                  ? "Ingresa con tu correo y contraseña" 
                  : mode === "register" 
                    ? "Crea tu cuenta para publicar y comentar" 
                    : "Te enviaremos un código a tu correo para restablecer tu contraseña"}
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ width: "100%", borderRadius: "4px" }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ width: "100%", borderRadius: "4px" }}>{success}</Alert>}

            {mode === "forgot-password" ? (
              <PasswordRecoveryWizard
                onSuccess={() => {
                  setMode("login");
                  setSuccess("¡Contraseña actualizada! Inicia sesión con tu nueva contraseña.");
                }}
              />
            ) : (
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
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "#5e4a3e" }} /></InputAdornment>,
                        }
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                    />
                  )}

                  <TextField
                    fullWidth
                    label="Correo Electrónico"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: "#5e4a3e" }} /></InputAdornment>,
                      }
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                  />

                  <TextField
                    fullWidth
                    label="Contraseña"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "#5e4a3e" }} /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: "4px" } }}
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{ color: "#6b1d22", "&.Mui-checked": { color: "#6b1d22" } }}
                      />
                    }
                    label="Recordarme en este equipo"
                    sx={{ alignSelf: "flex-start", "& .MuiTypography-root": { fontSize: "0.875rem", color: "#5e4a3e" } }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      borderRadius: "4px",
                      fontWeight: 700,
                      fontFamily: "var(--font-inter), sans-serif",
                      bgcolor: "#6b1d22",
                      border: "1px solid #551518",
                      boxShadow: "0 3px 10px rgba(107, 29, 34, 0.2)",
                      "&:hover": { bgcolor: "#551518" },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : mode === "login" ? "INICIAR SESIÓN" : "CREAR CUENTA"}
                  </Button>

                  {mode === "login" && (
                    <Stack spacing={1} sx={{ alignItems: "center" }}>
                      <MuiLink 
                        component="button" 
                        type="button"
                        variant="caption" 
                        onClick={() => setMode("forgot-password")}
                        sx={{ color: "#5e4a3e", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                      >
                        ¿Olvidaste tu contraseña?
                      </MuiLink>
                      <MuiLink 
                        component="button" 
                        type="button"
                        variant="caption" 
                        onClick={() => setMode("register")}
                        sx={{ color: "#6b1d22", fontWeight: "bold", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                      >
                        Crear cuenta
                      </MuiLink>
                    </Stack>
                  )}
                </Stack>
              </Box>
            )}
            
            <Typography variant="caption" sx={{ mt: 4, textAlign: "center", display: "block", width: "100%", color: "#8a7568", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
              © {new Date().getFullYear()} Agrupación Estudiantil Literudo · Universidad de Oriente
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
