"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import {
  approveContent,
  clearReviewFlag,
  publishContent,
  rejectContent,
  submitForReview,
  unpublishContent,
} from "@/app/admin/review-actions";
import { POST_STATUS } from "@/lib/permissions";

interface ReviewActionsProps {
  target: "post" | "gallery";
  id: string;
  status: string;
  needsReview?: boolean;
  reviewNote?: string | null;
  isAdmin: boolean;
  onChanged?: () => void;
  size?: "small" | "medium";
}

export default function ReviewActions({
  target,
  id,
  status,
  needsReview = false,
  reviewNote,
  isAdmin,
  onChanged,
  size = "small",
}: ReviewActionsProps) {
  const [openReject, setOpenReject] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo completar la acción.");
      return false;
    }
    onChanged?.();
    return true;
  };

  const handleReject = async () => {
    const ok = await run(() => rejectContent(target, id, note));
    if (ok) {
      setOpenReject(false);
      setNote("");
    }
  };

  return (
    <Stack spacing={1} sx={{ alignItems: "flex-start" }}>
      {status === POST_STATUS.rejected && reviewNote && (
        <Alert severity="warning" sx={{ py: 0, width: "100%" }}>
          Motivo del rechazo: {reviewNote}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ py: 0, width: "100%" }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
        {(status === POST_STATUS.draft || status === POST_STATUS.rejected) && (
          <Button
            size={size}
            variant="outlined"
            disabled={busy}
            onClick={() => run(() => submitForReview(target, id))}
          >
            Enviar a revisión
          </Button>
        )}

        {isAdmin && status === POST_STATUS.inReview && (
          <>
            <Button
              size={size}
              variant="contained"
              color="success"
              disabled={busy}
              onClick={() => run(() => approveContent(target, id))}
            >
              Aprobar
            </Button>
            <Button
              size={size}
              variant="outlined"
              color="error"
              disabled={busy}
              onClick={() => setOpenReject(true)}
            >
              Rechazar
            </Button>
          </>
        )}

        {status === POST_STATUS.approved && (
          <Button
            size={size}
            variant="contained"
            disabled={busy}
            onClick={() => run(() => publishContent(target, id))}
          >
            Publicar
          </Button>
        )}

        {status === POST_STATUS.published && (
          <Button
            size={size}
            variant="outlined"
            disabled={busy}
            onClick={() => run(() => unpublishContent(target, id))}
          >
            Despublicar
          </Button>
        )}

        {isAdmin && needsReview && (
          <Button
            size={size}
            variant="outlined"
            color="warning"
            disabled={busy}
            onClick={() => run(() => clearReviewFlag(target, id))}
          >
            Marcar como revisado
          </Button>
        )}
      </Stack>

      <Dialog open={openReject} onClose={() => !busy && setOpenReject(false)} fullWidth maxWidth="sm">
        <DialogTitle>Rechazar {target === "post" ? "artículo" : "galería"}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Explica al autor qué debe corregir. El motivo es obligatorio y él lo verá en su panel.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Motivo del rechazo"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button disabled={busy} onClick={() => setOpenReject(false)}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={busy || !note.trim()}
            onClick={handleReject}
          >
            Rechazar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
