"use client";

import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import GalleryForm from "@/components/admin/GalleryForm";
import Link from "next/link";

export default function NewGalleryPage() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fcfcfb', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 6 }}>
          <Breadcrumbs sx={{ mb: 1.5, '& .MuiBreadcrumbs-li': { fontSize: '0.7rem', letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.5 } }}>
            <MuiLink component={Link} href="/admin/gallery" underline="hover" color="inherit">
              Galerías
            </MuiLink>
            <Typography color="text.primary" sx={{ fontSize: '0.7rem', fontWeight: 700 }}>Nueva Galería</Typography>
          </Breadcrumbs>
          <Typography variant="h3" sx={{
            fontFamily: '"Lora", serif',
            fontWeight: 800,
            color: '#1a1a1a',
            letterSpacing: -1
          }}>
            Crear galería
          </Typography>
        </Box>

        <GalleryForm mode="create" submitLabel="Crear Galería" />
      </Container>
    </Box>
  );
}
