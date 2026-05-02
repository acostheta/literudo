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
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Credenciales incorrectas o usuario no registrado.");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f4f4f2", // Literary paper white
        backgroundImage: "radial-gradient(#d1d1cf 0.5px, transparent 0.5px)",
        backgroundSize: "20px 20px", // Subtle dot pattern
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 0, // Sharp style
            border: "1px solid #e0e0e0",
            backgroundColor: "white",
            boxShadow: "20px 20px 60px #d9d9d7, -20px -20px 60px #ffffff",
          }}
        >
          <Stack spacing={4} alignItems="center">
            <Box 
              component="img"
              src="/logo.png"
              alt="Logo Literudo"
              sx={{ width: 100, height: 100, mb: 1 }}
            />
            
            <Box textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: "bold", letterSpacing: 1, mb: 1 }}>
                LITERUDO
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                "El conocimiento es la única libertad"
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ width: "100%", borderRadius: 0 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Correo Electrónico"
                  variant="outlined"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 0 }
                  }}
                />
                <TextField
                  fullWidth
                  label="Contraseña"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 0 }
                  }}
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
                    fontSize: "1rem",
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "ENTRAR AL PANEL"}
                </Button>
              </Stack>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
              © {new Date().getFullYear()} Agrupación Estudiantil Literudo
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
