"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Box,
  Button,
  TextField,
  Typography,
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
  password?: string;
  avatar_url?: string;
  about_me?: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<UserProfile>({
    name: user?.name || "",
    email: user?.email || "",
    password: user?.password || "",
    role: user?.role || "Usuario",
    avatar_url: user?.avatar_url || "",
    about_me: user?.about_me || "",
    status: user?.status || "activo",
  });

  // Update form data when user prop changes (e.g. when opening for edit)
  useState(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: user.password || "",
        role: user.role,
        avatar_url: user.avatar_url || "",
        about_me: user.about_me || "",
        status: user.status,
      });
    }
  });

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
      alert("Error al subir el avatar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user?.id) {
      const { data, error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", user.id)
        .select();

      if (error) alert(error.message);
      else if (data) {
        onSuccess(data[0]);
        onClose();
      }
    } else {
      const { data, error } = await supabase
        .from("profiles")
        .insert([formData])
        .select();

      if (error) alert(error.message);
      else if (data) {
        onSuccess(data[0]);
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 'bold', pt: 3 }}>
        {user?.id ? "Editar Perfil de Usuario" : "Crear Nuevo Usuario"}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Stack spacing={4} sx={{ py: 1 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
              <Box sx={{ textAlign: 'center' }}>
                <Avatar src={formData.avatar_url} sx={{ width: 120, height: 120, mb: 2, mx: 'auto', border: '2px solid #eee' }}>
                  <PersonIcon sx={{ fontSize: 70 }} />
                </Avatar>
                <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileUpload} disabled={uploading} />
                <Button size="small" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {uploading ? "Cambiar Foto" : "Subir Foto"}
                </Button>
              </Box>
              
              <Stack spacing={2} flex={1}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField fullWidth label="Nombre Completo" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  <TextField fullWidth label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </Stack>
                <TextField fullWidth label="Contraseña" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
              </Stack>
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select value={formData.role} label="Rol" onChange={(e) => setFormData({ ...formData, role: e.target.value as string })}>
                  <MenuItem value="Administrador">Administrador</MenuItem>
                  <MenuItem value="Usuario">Usuario</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Estatus</InputLabel>
                <Select value={formData.status} label="Estatus" onChange={(e) => setFormData({ ...formData, status: e.target.value as string })}>
                  <MenuItem value="activo">Activo</MenuItem>
                  <MenuItem value="inactivo">Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <TextField fullWidth multiline rows={4} label="Sobre mí" value={formData.about_me} onChange={(e) => setFormData({ ...formData, about_me: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} color="inherit">Cancelar</Button>
          <Button type="submit" variant="contained" color="success" disabled={uploading} sx={{ px: 4 }}>
            {user?.id ? "Guardar Cambios" : "Crear Usuario"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
