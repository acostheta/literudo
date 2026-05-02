export default function PostsPage() {
  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem" }}>Gestión de Posts</h2>
      <p style={{ color: "#666" }}>
        Aquí podrás crear, editar y eliminar las entradas del blog.
      </p>
      <div style={{ 
        marginTop: "2rem", 
        padding: "2rem", 
        border: "1px dashed #ccc", 
        borderRadius: "8px",
        textAlign: "center",
        color: "#999"
      }}>
        Lista de posts vacía.
      </div>
    </div>
  );
}
