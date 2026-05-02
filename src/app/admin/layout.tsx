"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/admin" },
  { name: "Usuarios", href: "/admin/usuarios" },
  { name: "Posts", href: "/admin/posts" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="admin-layout">
      <header className="topbar">
        <h1 className="topbar-title">Literudo</h1>
      </header>
      <div className="admin-container">
        <aside className="sidebar">
          <nav>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? "active" : ""}`} 
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
