"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Stack,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Block as DeactivateIcon,
  CheckCircle as ActivateIcon,
} from "@mui/icons-material";
import UserFormModal from "./UserFormModal";
import { STATUS } from "@/lib/permissions";
import { setUserStatus } from "@/app/admin/users/actions";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
  about_me?: string | null;
  status: string;
  created_at: string;
}

export default function UserDetailActions({ user }: { user: UserProfile }) {
  const router = useRouter();
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const nuevo = user.status === STATUS.active ? STATUS.inactive : STATUS.active;
      const result = await setUserStatus(user.id, nuevo);
      if (!result.ok) setError(result.error);
      else router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} sx={{ mt: 2, alignItems: { xs: "center", sm: "flex-start" } }}>
      {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setOpenEdit(true)}
        >
          Editar
        </Button>

        <Button
          variant="outlined"
          color={user.status === STATUS.active ? "warning" : "success"}
          startIcon={user.status === STATUS.active ? <DeactivateIcon /> : <ActivateIcon />}
          onClick={toggleStatus}
          disabled={loading}
        >
          {user.status === STATUS.active ? "Desactivar" : "Activar"}
        </Button>
      </Stack>

      <UserFormModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        user={user}
        onSuccess={() => router.refresh()}
      />
    </Stack>
  );
}
