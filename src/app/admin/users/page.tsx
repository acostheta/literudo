"use client";

import { useState, useEffect } from "react";
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
  Typography,
  Stack,
  Chip,
  IconButton,
  CircularProgress,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import UserFormModal from "@/components/UserFormModal";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  about_me?: string;
  status: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error:", error);
    else setUsers(data || []);
    setLoading(false);
  };

  const handleEditClick = (user: UserProfile) => {
    setSelectedUser(user);
    setOpenModal(true);
  };

  const handleAddClick = () => {
    setSelectedUser(null);
    setOpenModal(true);
  };

  const deleteUser = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro?")) {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) alert(error.message);
      else setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Stack direction="row" sx={{ mb: 4, alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main", flexGrow: 1 }}>
          Gestión de Usuarios
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddClick}>
          Nuevo Usuario
        </Button>
      </Stack>

      <UserFormModal 
        open={openModal} 
        onClose={() => setOpenModal(false)} 
        user={selectedUser} 
        onSuccess={fetchUsers} 
      />

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650, tableLayout: 'fixed' }}>
          <TableHead sx={{ backgroundColor: "grey.100" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "40%", py: 2 }}>Usuario</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "20%", py: 2 }}>Rol</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold", width: "20%", py: 2 }}>Estatus</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold", width: "20%", py: 2 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover onClick={() => router.push(`/admin/users/${user.id}`)} sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ py: 2, width: "40%", overflow: 'hidden' }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                      <Avatar src={user.avatar_url} sx={{ border: '1px solid #eee', flexShrink: 0 }}>{user.name.charAt(0)}</Avatar>
                      <Box sx={{ overflow: 'hidden' }}>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ lineHeight: 1, display: 'block' }}>{user.email}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2, width: "20%" }}>
                    <Chip label={user.role} size="small" color={user.role === "Administrador" ? "primary" : "default"} />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 2, width: "20%" }}>
                    <Chip label={user.status} size="small" color={user.status === "activo" ? "success" : "warning"} variant="outlined" />
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2, width: "20%" }}>
                    <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                      <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleEditClick(user); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={(e) => deleteUser(e, user.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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
