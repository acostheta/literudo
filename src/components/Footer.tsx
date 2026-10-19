import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#2c1e18",
        color: "#f5eee6",
        borderTop: "3px double #d49b38",
        marginTop: "auto",
        position: "relative",
      }}
    >
      {/* Sello superior */}
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "4rem 1.5rem 2.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2.5rem",
            marginBottom: "3rem",
          }}
        >
          {/* Columna 1: Masthead */}
          <div style={{ maxWidth: "320px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#fcf8f2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #d49b38",
                }}
              >
                <img src="/logo_literudo.png" alt="Literudo" style={{ width: "24px", height: "24px" }} />
              </div>
              <div>
                <span
                  style={{
                    fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#fcf8f2",
                    display: "block",
                    lineHeight: 1.1,
                  }}
                >
                  LITERUDO
                </span>
                <span
                  style={{
                    fontSize: "0.68rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "#d49b38",
                    display: "block",
                  }}
                >
                  Online
                </span>
              </div>
            </div>
            <p
              style={{
                color: "#c7b7a8",
                fontSize: "0.88rem",
                lineHeight: "1.7",
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
              }}
            >
              Blog de la comunidad estudiantil de la Universidad de Oriente: artículos, ensayos, poesía y galería visual.
            </p>
          </div>

          {/* Columna 2: Navegación */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
                fontSize: "0.82rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#d49b38",
                marginBottom: "1.2rem",
                fontWeight: 700,
              }}
            >
              Navegación
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
                padding: 0,
                margin: 0,
              }}
            >
              <li>
                <Link
                  href="/"
                  style={{
                    color: "#e2d5c7",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link
                  href="/posts"
                  style={{
                    color: "#e2d5c7",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  Artículos
                </Link>
              </li>
              <li>
                <Link
                  href="/gallery"
                  style={{
                    color: "#e2d5c7",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  Galería
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Salón & Cuenta */}
          <div>
            <h4
              style={{
                fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
                fontSize: "0.82rem",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#d49b38",
                marginBottom: "1.2rem",
                fontWeight: 700,
              }}
            >
              Cuenta
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "0.65rem",
                padding: 0,
                margin: 0,
              }}
            >
              <li>
                <Link
                  href="/login"
                  style={{
                    color: "#e2d5c7",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  style={{
                    color: "#e2d5c7",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                >
                  Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Ex-Libris y Lema */}
          <div
            style={{
              padding: "1.2rem",
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(212, 155, 56, 0.25)",
              borderRadius: "4px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-cinzel), var(--font-playfair), Georgia, serif",
                fontSize: "0.78rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#d49b38",
                marginBottom: "0.5rem",
                fontWeight: 700,
              }}
            >
              Lema
            </p>
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "0.88rem",
                color: "#f5eee6",
                fontStyle: "italic",
                lineHeight: "1.6",
                marginBottom: "0.75rem",
              }}
            >
              «Del pueblo venimos, hacia el pueblo vamos.»
            </p>
            <span
              style={{
                fontSize: "0.72rem",
                color: "#a49182",
                display: "block",
                fontFamily: "var(--font-sans)",
              }}
            >
              Universidad de Oriente · Venezuela
            </span>
          </div>
        </div>

        {/* Separador ornamental */}
        <div
          style={{
            borderTop: "1px solid rgba(212, 155, 56, 0.2)",
            paddingTop: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.8rem",
            color: "#9e8d7f",
            fontFamily: "var(--font-sans)",
          }}
        >
          <span>
            © {new Date().getFullYear()} Agrupación Estudiantil Literudo. Todos los derechos reservados.
          </span>
          <span style={{ fontStyle: "italic", fontFamily: "var(--font-serif)" }}>
            Agrupación Estudiantil Literudo
          </span>
        </div>
      </div>
    </footer>
  );
}
