"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { CloudUpload as UploadIcon } from "@mui/icons-material";

export interface MyProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
  about_me?: string | null;
  status: string;
  created_at: string;
}

interface MyProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: MyProfile;
  onSaved: (profile: MyProfile) => void;
}

export default function MyProfileModal({ open, onClose, profile, onSaved }: MyProfileModalProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(profile.name);
  const [aboutMe, setAboutMe] = useState(profile.about_me || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    const fileExt = file.name.split(".").pop();
    const filePath = `${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
    if (uploadError) {
      setError("Error al subir el avatar: " + uploadError.message);
    } else {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(publicUrl);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    setSaving(true);
    setError(null);

    const { error: saveError } = await supabase
      .from("profiles")
      .update({
        name: name.trim(),
        about_me: aboutMe.trim(),
        avatar_url: avatarUrl,
      })
      .eq("id", profile.id);

    setSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    // La columna email está revocada para el cliente: el perfil actualizado se
    // arma con lo que se acaba de guardar.
    onSaved({ ...profile, name: name.trim(), about_me: aboutMe.trim(), avatar_url: avatarUrl });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { borderRadius: 0 } } }}>
      <DialogTitle sx={{ fontWeight: "bold", pt: 3 }}>Editar mis datos</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>{error}</Alert>}

          <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
            <Avatar src={avatarUrl || undefined} sx={{ width: 72, height: 72, border: "1px solid #eee" }}>
              {name.charAt(0)}
            </Avatar>
            <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileUpload} disabled={uploading} />
            <Button
              variant="outlined"
              size="small"
              startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{ borderRadius: 0 }}
            >
              {uploading ? "Subiendo..." : "Cambiar foto"}
            </Button>
          </Stack>

          <TextField
            label="Nombre"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Sobre mí"
            fullWidth
            multiline
            minRows={4}
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" color="text.secondary">
            El correo y el rol no se pueden cambiar desde aquí.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit" sx={{ borderRadius: 0 }}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving || uploading} sx={{ px: 4, borderRadius: 0 }}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
