"use client";

import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ROLES, STATUS } from "@/lib/permissions";
import { createUser, updateUser } from "@/app/admin/users/actions";
import {
  Alert,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  CloudUpload as UploadIcon,
} from "@mui/icons-material";

interface UserProfile {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
  about_me?: string | null;
  status: string;
}

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  user?: UserProfile | null;
  onSuccess: (updatedUser: any) => void;
}

export default function UserFormModal({ open, onClose, user, onSuccess }: UserFormModalProps) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UserProfile>({
    name: "",
    email: "",
    role: ROLES.user,
    avatar_url: "",
    about_me: "",
    status: STATUS.active,
  });

  // Update form data when user prop changes (e.g. when opening for edit)
  useEffect(() => {
    setError(null);
    setPassword("");
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url || "",
        about_me: user.about_me || "",
        status: user.status,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: ROLES.user,
        avatar_url: "",
        about_me: "",
        status: STATUS.active,
      });
    }
  }, [user, open]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setFormData({ ...formData, avatar_url: publicUrl });
    } catch (error: any) {
      setError("Error al subir el avatar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (user?.id) {
        const result = await updateUser(user.id, {
          name: formData.name,
          about_me: formData.about_me || "",
          avatar_url: formData.avatar_url || "",
          role: formData.role,
          status: formData.status,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onSuccess({ ...user, ...formData });
      } else {
        const result = await createUser({
          name: formData.name,
          email: formData.email,
          password,
          role: formData.role,
        });
        if (!result.ok) {
          setError(result.error);
          return;
        }
        onSuccess(null);
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 'bold', pt: 3 }}>
        {user?.id ? "Editar Perfil de Usuario" : "Crear Nuevo Usuario"}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }} onClose={() => setError(null)}>{error}</Alert>}
          <Stack spacing={4} sx={{ py: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ alignItems: "center" }}>
              <Box sx={{ textAlign: 'center' }}>
                <Avatar src={formData.avatar_url || undefined} sx={{ width: 120, height: 120, mb: 2, mx: 'auto', border: '2px solid #eee' }}>
                  <PersonIcon sx={{ fontSize: 70 }} />
                </Avatar>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileUpload} disabled={uploading} />
                <Button size="small" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? "Cambiar Foto" : "Subir Foto"}
                </Button>
              </Box>
              
              <Stack spacing={2} sx={{ flex: 1 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField fullWidth label="Nombre Completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!user?.id}
                    helperText={user?.id ? "El correo se cambia desde Supabase Auth." : undefined}
                    required
                  />
                </Stack>
                {!user?.id && (
                  <TextField
                    fullWidth
                    label="Contraseña inicial"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    helperText="Mínimo 8 caracteres. El usuario podrá cambiarla luego."
                    required
                  />
                )}
              </Stack>
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select value={formData.role} label="Rol" onChange={(e) => setFormData({ ...formData, role: e.target.value as string })}>
                  <MenuItem value={ROLES.admin}>{ROLES.admin}</MenuItem>
                  <MenuItem value={ROLES.user}>{ROLES.user}</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Estatus</InputLabel>
                <Select value={formData.status} label="Estatus" onChange={(e) => setFormData({ ...formData, status: e.target.value as string })}>
                  <MenuItem value={STATUS.active}>Activo</MenuItem>
                  <MenuItem value={STATUS.inactive}>Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TextField fullWidth multiline rows={4} label="Sobre mí" value={formData.about_me} onChange={(e) => setFormData({ ...formData, about_me: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" color="success" disabled={uploading || saving} sx={{ px: 4 }}>
            {saving ? "Guardando..." : user?.id ? "Guardar Cambios" : "Crear Usuario"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
