import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Sin esto, cada `import { X } from "@mui/material"` arrastra el barril
    // completo al grafo de modulos: el homepage solo compilaba 1664 modulos
    // y ~12s en dev. Con esto se reescribe a rutas directas.
    optimizePackageImports: ["@mui/material", "@mui/icons-material"],
  },
};

export default nextConfig;
