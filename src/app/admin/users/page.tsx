"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
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
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newUser, setNewUser] = useState({
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
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Debes seleccionar una imagen para subir.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setNewUser({ ...newUser, avatar_url: publicUrl });
    } catch (error: any) {
      alert("Error al subir el avatar: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const { data, error } = await supabase
      .from("profiles")
      .insert([newUser])
      .select();

    if (error) {
      alert("Error adding user: " + error.message);
    } else if (data) {
      setUsers([data[0], ...users]);
      resetForm();
      setIsAdding(false);
    }
  };

  const resetForm = () => {
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "Usuario",
      avatar_url: "",
      about_me: "",
      status: "activo",
    });
  };

  const deleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
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
          onClick={() => setIsAdding(!isAdding)}
          color={isAdding ? "error" : "primary"}
        >
          {isAdding ? "Cancelar" : "Nuevo Usuario"}
        </Button>
      </Stack>

      <Collapse in={isAdding}>
        <Paper sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 4 }}>Crear Perfil Completo</Typography>
          <Box component="form" onSubmit={handleAddUser}>
            <Stack spacing={4}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    src={newUser.avatar_url} 
                    sx={{ width: 100, height: 100, mb: 2, mx: 'auto', border: '2px solid #eee' }}
                  >
                    <PersonIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <Button 
                    size="small" 
                    variant="outlined" 
                    startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? "Subiendo..." : "Subir Foto"}
                  </Button>
                </Box>
                
                <Stack spacing={2} flex={1}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Nombre Completo"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </Stack>
              </Stack>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={newUser.role}
                    label="Rol"
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as string })}
                  >
                    <MenuItem value="Administrador">Administrador</MenuItem>
                    <MenuItem value="Usuario">Usuario</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Estatus</InputLabel>
                  <Select
                    value={newUser.status}
                    label="Estatus"
                    onChange={(e) => setNewUser({ ...newUser, status: e.target.value as string })}
                  >
                    <MenuItem value="activo">Activo</MenuItem>
                    <MenuItem value="inactivo">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Sobre mí"
                placeholder="Cuéntanos un poco sobre ti..."
                value={newUser.about_me}
                onChange={(e) => setNewUser({ ...newUser, about_me: e.target.value })}
              />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="success" 
                  size="large" 
                  sx={{ minWidth: '150px' }}
                  disabled={uploading}
                >
                  Guardar Usuario
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
              <TableCell sx={{ fontWeight: "bold" }}>Info</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar src={user.avatar_url} alt={user.name} sx={{ border: '1px solid #eee' }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small"
                      color={user.role === "Administrador" ? "primary" : "default"}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status} 
                      size="small"
                      color={user.status === "activo" ? "success" : "warning"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {user.about_me && (
                      <Tooltip title={user.about_me}>
                        <IconButton size="small">
                          <InfoIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => deleteUser(user.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
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
