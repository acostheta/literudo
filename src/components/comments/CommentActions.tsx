"use client";

import { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface CommentActionsProps {
  isAuthor: boolean;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CommentActions({
  isAuthor,
  isAdmin,
  onEdit,
  onDelete,
}: CommentActionsProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleMenuClose();
    onEdit();
  };

  const handleDeleteClick = () => {
    handleMenuClose();
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    setConfirmDelete(false);
    onDelete();
  };

  if (!isAuthor && !isAdmin) return null;

  return (
    <>
      <IconButton
        size="small"
        onClick={handleMenuOpen}
        sx={{
          opacity: 0.4,
          "&:hover": { opacity: 1 },
          p: 0.5,
        }}
      >
        <MoreHorizIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 160,
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
            },
          },
        }}
      >
        {isAuthor && (
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Editar"
              slotProps={{ primary: { sx: { fontSize: "0.9rem" } } }}
            />
          </MenuItem>
        )}

        <MenuItem onClick={handleDeleteClick} sx={{ color: "#d32f2f" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: "#d32f2f" }} />
          </ListItemIcon>
            <ListItemText
              primary="Eliminar"
              slotProps={{ primary: { sx: { fontSize: "0.9rem", color: "#d32f2f" } } }}
            />
        </MenuItem>
      </Menu>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 600 }}>
          Eliminar comentario
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: '"Inter", sans-serif' }}>
            ¿Estás seguro de que deseas eliminar este comentario? Esta acción no
            se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button
            onClick={() => setConfirmDelete(false)}
            sx={{ textTransform: "none", fontFamily: '"Inter", sans-serif' }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{ textTransform: "none", fontFamily: '"Inter", sans-serif' }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
