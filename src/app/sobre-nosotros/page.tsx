import type { Metadata } from "next";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { EditNote, Event, Instagram, MenuBook } from "@mui/icons-material";

export const metadata: Metadata = {
  title: "Sobre Nosotros · Literudo",
  description:
    "Literudo es una agrupación estudiantil de la Universidad de Oriente, Núcleo de Monagas, dedicada a la literatura, la poesía, la narrativa y la difusión cultural.",
};

const display = "var(--font-cinzel), var(--font-playfair), Georgia, serif";

const actividades = [
  {
    icon: <MenuBook sx={{ fontSize: 20 }} />,
    titulo: "Círculos de lectura",
    texto:
      "Elegimos un libro y fijamos un periodo para leerlo. Al terminar, nos reunimos un día acordado para discutirlo en conjunto: qué nos dejó, qué nos hizo pensar, qué no nos convenció. De esa conversación sale la conclusión del libro y la elección del siguiente.",
  },
  {
    icon: <EditNote sx={{ fontSize: 20 }} />,
    titulo: "Creación y difusión literaria",
    texto:
      "Publicamos y leemos artículos, poemas y narrativa, y acompañamos los textos de sus autores.",
  },
  {
    icon: <Event sx={{ fontSize: 20 }} />,
    titulo: "Eventos y plataforma",
    texto:
      "Participamos en el Día del Libro y del Idioma, jornadas académicas, conversatorios y espacios de expresión artística; compartimos todo en Literudo Online y en nuestras redes.",
  },
];

const equipo = [
  { rol: "Coordinación General", nombre: "Emiliano Martínez" },
  { rol: "Coordinación de Artes", nombre: "Tiffany Viloria" },
  { rol: "Coordinación de Logística", nombre: "Gabriela" },
  { rol: "Coordinación de Comunicaciones", nombre: "Juls" },
  { rol: "Coordinación de Escritura", nombre: "Emi" },
  { rol: "Tutor", nombre: "Prof. Rolando Rojas" },
];

const parrafo = {
  fontFamily: "var(--font-serif)",
  fontSize: { xs: "1.05rem", md: "1.12rem" },
  lineHeight: 1.95,
  color: "var(--foreground-muted)",
  mb: 2.5,
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="h2"
      sx={{
        fontFamily: display,
        fontWeight: 700,
        fontSize: { xs: "1.7rem", md: "2.1rem" },
        color: "var(--foreground)",
        mb: 3,
      }}
    >
      {children}
    </Typography>
  );
}

function Section({ children, first = false }: { children: ReactNode; first?: boolean }) {
  return (
    <Box
      sx={
        first
          ? undefined
          : { borderTop: "1px solid var(--border)", mt: 7, pt: 7 }
      }
    >
      {children}
    </Box>
  );
}

export default function SobreNosotrosPage() {
  return (
    <Box
      sx={{
        bgcolor: "var(--background)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Navbar />

      <Container maxWidth="md" sx={{ py: { xs: 5, md: 9 }, flex: 1 }}>
        <Section first>
          <Typography
            component="h1"
            sx={{
              fontFamily: display,
              fontWeight: 800,
              fontSize: { xs: "2.3rem", md: "3.2rem" },
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              color: "var(--foreground)",
              mb: 3,
            }}
          >
            Quiénes somos
          </Typography>

          <Typography sx={parrafo}>
            Literudo es una agrupación estudiantil dedicada a la literatura, la poesía, la
            narrativa y la difusión cultural, vinculada a la Universidad de Oriente (UDO), con
            presencia activa en el Núcleo de Monagas.
          </Typography>

          <Typography sx={{ ...parrafo, mb: 0 }}>
            Fundada en junio de 2025, nació con una idea sencilla: que leer y escribir sean una
            práctica cotidiana y compartida dentro de la universidad. Desde entonces reúne a
            estudiantes en torno a los libros y a la creación literaria.
          </Typography>
        </Section>

        <Section>
          <SectionTitle>Qué hacemos</SectionTitle>

          <Stack spacing={3.5}>
            {actividades.map((actividad) => (
              <Box key={actividad.titulo} sx={{ display: "flex", gap: 2 }}>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "var(--primary-faint)",
                    color: "var(--primary)",
                  }}
                >
                  {actividad.icon}
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontFamily: display,
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      color: "var(--foreground)",
                      mb: 0.5,
                    }}
                  >
                    {actividad.titulo}
                  </Typography>
                  <Typography sx={{ ...parrafo, fontSize: "1rem", mb: 0 }}>
                    {actividad.texto}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Section>

        <Section>
          <SectionTitle>Equipo</SectionTitle>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            {equipo.map((persona) => (
              <Box
                key={persona.rol + persona.nombre}
                sx={{
                  bgcolor: "#ffffff",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--accent-text)",
                  }}
                >
                  {persona.rol}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: display,
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "var(--foreground)",
                  }}
                >
                  {persona.nombre}
                </Typography>
              </Box>
            ))}
          </Box>
        </Section>

        <Section>
          <SectionTitle>Síguenos</SectionTitle>

          <Typography sx={{ ...parrafo, mb: 2.5 }}>
            Todo lo que hacemos se publica aquí y en Instagram.
          </Typography>

          <Button
            component="a"
            href="https://instagram.com/literudo"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            color="primary"
            startIcon={<Instagram />}
            sx={{ fontWeight: 700, fontFamily: "var(--font-sans)" }}
          >
            @literudo
          </Button>
        </Section>
      </Container>

      <Footer />
    </Box>
  );
}
