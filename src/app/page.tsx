import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>Literudo</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Blog para Agrupación Estudiantil Literudo
      </p>
      <div style={{ marginBottom: "2rem" }}>
        <Link 
          href="/admin" 
          className="admin-button"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#1a1a2e",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "500",
          }}
        >
          Ir a Admin
        </Link>
      </div>
      <p>Próximamente...</p>
    </main>
  );
}