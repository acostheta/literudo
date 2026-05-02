"use client";

import { useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "Admin Literudo", email: "admin@literudo.com", role: "Administrator" },
    { id: 2, name: "Juan Perez", email: "juan@example.com", role: "Editor" },
  ]);

  const [newUser, setNewUser] = useState({ name: "", email: "", role: "Editor" });
  const [isAdding, setIsAdding] = useState(false);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const user: User = {
      id: Date.now(),
      ...newUser
    };

    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "Editor" });
    setIsAdding(false);
  };

  const deleteUser = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h2 style={{ margin: 0 }}>User Management</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#1a1a2e",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {isAdding ? "Cancel" : "Add New User"}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddUser} style={{ 
          background: "white", 
          padding: "1.5rem", 
          borderRadius: "8px", 
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          marginBottom: "2rem",
          display: "grid",
          gap: "1rem",
          gridTemplateColumns: "1fr 1fr 1fr auto"
        }}>
          <input 
            type="text" 
            placeholder="Name" 
            value={newUser.name}
            onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
            required
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
            required
          />
          <select 
            value={newUser.role}
            onChange={(e) => setNewUser({...newUser, role: e.target.value})}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="Administrator">Administrator</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
          <button type="submit" style={{ 
            padding: "0.5rem 1rem", 
            backgroundColor: "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer" 
          }}>
            Save
          </button>
        </form>
      )}

      <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Name</th>
              <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Email</th>
              <th style={{ padding: "1rem", borderBottom: "1px solid #eee" }}>Role</th>
              <th style={{ padding: "1rem", borderBottom: "1px solid #eee", textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "1rem" }}>{user.name}</td>
                <td style={{ padding: "1rem" }}>{user.email}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ 
                    padding: "0.25rem 0.5rem", 
                    backgroundColor: user.role === "Administrator" ? "#e3f2fd" : "#f1f3f5",
                    color: user.role === "Administrator" ? "#0d47a1" : "#495057",
                    borderRadius: "4px",
                    fontSize: "0.85rem"
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <button 
                    onClick={() => deleteUser(user.id)}
                    style={{ 
                      padding: "0.25rem 0.5rem", 
                      backgroundColor: "#dc3545", 
                      color: "white", 
                      border: "none", 
                      borderRadius: "4px", 
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
