"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  avatar_url?: string;
  about_me?: string;
  status: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Usuario",
    avatar_url: "",
    about_me: "",
    status: "activo",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

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
    if (!formData.name || !formData.email) return;

    if (isEditing) {
      const { data, error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", isEditing)
        .select();

      if (error) {
        alert("Error updating user: " + error.message);
      } else if (data) {
        setUsers(users.map(u => u.id === isEditing ? data[0] : u));
        resetForm();
      }
    } else {
      const { data, error } = await supabase
        .from("profiles")
        .insert([formData])
        .select();

      if (error) {
        alert("Error adding user: " + error.message);
      } else if (data) {
        setUsers([data[0], ...users]);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "Usuario",
      avatar_url: "",
      about_me: "",
      status: "activo",
    });
    setIsAdding(false);
    setIsEditing(null);
  };

  const handleEditClick = (user: UserProfile) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || "",
      role: user.role,
      avatar_url: user.avatar_url || "",
      about_me: user.about_me || "",
      status: user.status,
    });
    setIsEditing(user.id);
    setIsAdding(true);
  };

  const deleteUser = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Error deleting user: " + error.message);
      } else {
        setUsers(users.filter(u => u.id !== id));
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: "bold", color: "primary.main" }}>
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={isAdding ? <CloseIcon /> : <AddIcon />}
          onClick={() => {
            if (isAdding) resetForm();
            else setIsAdding(true);
          }}
          color={isAdding ? "error" : "primary"}
        >
          {isAdding ? "Cancelar" : "Nuevo Usuario"}
        </Button>
      </Stack>

      <Collapse in={isAdding}>
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 4 }}>{isEditing ? "Editar Perfil" : "Crear Perfil Completo"}</Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    src={formData.avatar_url} 
                    sx={{ width: 100, height: 100, mb: 2, mx: 'auto', border: '2px solid #eee' }}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleFileUpload} disabled={uploading} />
                  <Button size="small" variant="outlined" startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? "Subiendo..." : "Subir Foto"}
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

              <TextField fullWidth multiline rows={3} label="Sobre mí" placeholder="Cuéntanos un poco sobre ti..." value={formData.about_me} onChange={(e) => setFormData({ ...formData, about_me: e.target.value })} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" color="success" size="large" sx={{ minWidth: '150px' }} disabled={uploading}>
                  {isEditing ? "Actualizar Usuario" : "Guardar Usuario"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Collapse>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "grey.100" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Estatus</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}><CircularProgress size={40} /></TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow 
                  key={user.id} 
                  hover 
                  onClick={() => router.push(`/admin/users/${user.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={user.avatar_url} alt={user.name} sx={{ border: '1px solid #eee' }}>{user.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" color={user.role === "Administrador" ? "primary" : "default"} />
                  </TableCell>
                  <TableCell>
                    <Chip label={user.status} size="small" color={user.status === "activo" ? "success" : "warning"} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(user);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton size="small" color="error" onClick={(e) => deleteUser(e, user.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
