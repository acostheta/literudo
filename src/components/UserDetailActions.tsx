"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Stack,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Block as DeactivateIcon,
  CheckCircle as ActivateIcon,
} from "@mui/icons-material";
import UserFormModal from "./UserFormModal";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  avatar_url?: string;
  about_me?: string;
  status: string;
  created_at: string;
}

export default function UserDetailActions({ user }: { user: UserProfile }) {
  const router = useRouter();
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = user.status === "activo" ? "inactivo" : "activo";
    
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus })
      .eq("id", user.id);

    if (error) {
      alert("Error al actualizar estatus: " + error.message);
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
      <Button
        variant="contained"
        startIcon={<EditIcon />}
        onClick={() => setOpenEdit(true)}
      >
        Editar
      </Button>
      
      <Button
        variant="outlined"
        color={user.status === "activo" ? "warning" : "success"}
        startIcon={user.status === "activo" ? <DeactivateIcon /> : <ActivateIcon />}
        onClick={toggleStatus}
        disabled={loading}
      >
        {user.status === "activo" ? "Desactivar" : "Activar"}
      </Button>

      <UserFormModal 
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        user={user}
        onSuccess={() => router.refresh()}
      />
    </Stack>
  );
}
