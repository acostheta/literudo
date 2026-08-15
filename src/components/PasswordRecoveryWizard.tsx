"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Box,
  Button,
  TextField,
  Stack,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Pin as PinIcon,
} from "@mui/icons-material";

type RecoveryStep = "email" | "code" | "password";

interface PasswordRecoveryWizardProps {
  onSuccess?: () => void;
}

export default function PasswordRecoveryWizard({ onSuccess }: PasswordRecoveryWizardProps) {
  const supabase = createClient();

  const [step, setStep] = useState<RecoveryStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session?.user.email) {
        setEmail(data.session.user.email);
        setStep("password");
      }
    };
    init();
  }, [supabase]);

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    const siteUrl =
      process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${siteUrl}/reset-password`,
      },
    });
    setLoading(false);

    if (error) {
      setError("No se pudo enviar el código. Asegúrate de que el correo esté registrado.");
      return;
    }
    setSuccess("Hemos enviado un código de verificación de 6 dígitos a tu correo.");
    setStep("code");
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Ingresa el código de 6 dígitos que recibiste por correo.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    setLoading(false);

    if (error) {
      setError("El código es incorrecto o ha expirado. Vuelve a intentarlo.");
      return;
    }
    setStep("password");
  };

  const changePassword = async (e: React.FormEvent) => {
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
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }
    setSuccess("¡Contraseña actualizada correctamente!");
    await supabase.auth.signOut();
    setTimeout(() => {
      onSuccess?.();
    }, 1800);
  };

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      {error && <Alert severity="error" sx={{ width: "100%", borderRadius: 0 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ width: "100%", borderRadius: 0 }}>{success}</Alert>}

      {step === "email" && (
        <Box component="form" onSubmit={sendCode} sx={{ width: "100%" }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
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
              sx={{ py: 1.5, borderRadius: 0, fontWeight: "bold", boxShadow: "none" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "ENVIAR CÓDIGO"}
            </Button>
          </Stack>
        </Box>
      )}

      {step === "code" && (
        <Box component="form" onSubmit={verifyCode} sx={{ width: "100%" }}>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", fontStyle: "italic" }}>
              Introduce el código de 6 dígitos enviado a <strong>{email}</strong>
            </Typography>
            <TextField
              fullWidth
              label="Código de verificación"
              variant="outlined"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              autoFocus
              slotProps={{
                htmlInput: { inputMode: "numeric", maxLength: 6 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PinIcon color="action" />
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
              sx={{ py: 1.5, borderRadius: 0, fontWeight: "bold", boxShadow: "none" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "VERIFICAR CÓDIGO"}
            </Button>
            <Button
              type="button"
              fullWidth
              variant="text"
              size="small"
              disabled={loading}
              onClick={sendCode}
              sx={{ textTransform: "none", fontWeight: "bold" }}
            >
              Reenviar código
            </Button>
          </Stack>
        </Box>
      )}

      {step === "password" && (
        <Box component="form" onSubmit={changePassword} sx={{ width: "100%" }}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
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
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
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
              sx={{ py: 1.5, borderRadius: 0, fontWeight: "bold", boxShadow: "none" }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "CAMBIAR CONTRASEÑA"}
            </Button>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}