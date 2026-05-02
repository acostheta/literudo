"use client";

import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Editor" });
  const [isAdding, setIsAdding] = useState(false);

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
      setNewUser({ name: "", email: "", role: "Editor" });
      setIsAdding(false);
    }
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
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={isAdding ? <CloseIcon /> : <AddIcon />}
          onClick={() => setIsAdding(!isAdding)}
          color={isAdding ? "error" : "primary"}
        >
          {isAdding ? "Cancel" : "Add New User"}
        </Button>
      </Stack>

      <Collapse in={isAdding}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Create New User</Typography>
          <Box component="form" onSubmit={handleAddUser}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={newUser.role}
                  label="Role"
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as string })}
                >
                  <MenuItem value="Administrator">Administrator</MenuItem>
                  <MenuItem value="Editor">Editor</MenuItem>
                  <MenuItem value="Viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
              <Button type="submit" variant="contained" color="success" sx={{ minWidth: '120px' }}>
                Save User
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Collapse>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: "grey.100" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
              <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={40} />
                  <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
                    Loading users from Supabase...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <PersonIcon color="action" />
                      <Typography variant="body2">{user.name}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small"
                      color={user.role === "Administrator" ? "primary" : "default"}
                      variant={user.role === "Administrator" ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="error" onClick={() => deleteUser(user.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No users found in the database.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
