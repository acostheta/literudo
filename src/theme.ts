"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6b1d22",       // Vino de encuadernación clásica
      light: "#8a2a30",
      dark: "#4a1216",
      contrastText: "#fcf8f2",
    },
    secondary: {
      main: "#b88228",       // Ámbar lámpara de biblioteca / bronce antiguo
      light: "#d49b38",
      dark: "#8f6319",
      contrastText: "#241812",
    },
    background: {
      default: "#f5eee6",    // Pergamino sepia cálido
      paper: "#fcf8f2",      // Papel biblia / lectura cremosa
    },
    text: {
      primary: "#241812",    // Tinta oscura de prensa
      secondary: "#5e4a3e",  // Marrón nuez desvanecido
    },
    divider: "#d8c8b4",
  },
  typography: {
    fontFamily: "var(--font-lora), 'Newsreader', Georgia, serif",
    h1: {
      fontFamily: "var(--font-cinzel), var(--font-playfair), var(--font-lora), Georgia, serif",
      color: "#241812",
      letterSpacing: "-0.02em",
    },
    h2: {
      fontFamily: "var(--font-cinzel), var(--font-playfair), var(--font-lora), Georgia, serif",
      color: "#241812",
      letterSpacing: "-0.01em",
    },
    h3: {
      fontFamily: "var(--font-playfair), var(--font-lora), Georgia, serif",
      color: "#241812",
    },
    h4: {
      fontFamily: "var(--font-playfair), var(--font-lora), Georgia, serif",
      color: "#241812",
    },
    h5: {
      fontFamily: "var(--font-playfair), var(--font-lora), Georgia, serif",
      color: "#241812",
    },
    h6: {
      fontFamily: "var(--font-playfair), var(--font-lora), Georgia, serif",
      color: "#241812",
    },
    body1: {
      fontFamily: "var(--font-lora), Georgia, serif",
      color: "#241812",
      lineHeight: 1.8,
    },
    body2: {
      fontFamily: "var(--font-lora), Georgia, serif",
      color: "#5e4a3e",
      lineHeight: 1.7,
    },
    button: {
      fontFamily: "var(--font-inter), sans-serif",
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.02em",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 4,
          fontWeight: 600,
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(107, 29, 34, 0.15)",
          },
        },
        contained: {
          // En MUI v9 no hay clave "containedPrimary": hay que anidar bajo el
          // slot "contained" y filtrar por la clase de color.
          "&.MuiButton-colorPrimary": {
            backgroundColor: "#6b1d22",
            color: "#fcf8f2",
            border: "1px solid #551518",
            "&:hover": {
              backgroundColor: "#551518",
            },
          },
        },
        outlined: {
          "&.MuiButton-colorPrimary": {
            borderColor: "#6b1d22",
            color: "#6b1d22",
            "&:hover": {
              backgroundColor: "rgba(107, 29, 34, 0.05)",
              borderColor: "#551518",
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: "#fcf8f2",
          border: "1px solid #d8c8b4",
          boxShadow: "0 3px 12px rgba(60, 40, 25, 0.06)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#d8c8b4",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#faf4ec",
          borderRadius: 4,
          "& fieldset": {
            borderColor: "#d8c8b4",
          },
          "&:hover fieldset": {
            borderColor: "#b88228",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#6b1d22",
            borderWidth: 1.5,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-playfair), var(--font-lora), Georgia, serif",
          fontWeight: 600,
          color: "#5e4a3e",
          "&.Mui-selected": {
            color: "#6b1d22",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "var(--font-inter), sans-serif",
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;
