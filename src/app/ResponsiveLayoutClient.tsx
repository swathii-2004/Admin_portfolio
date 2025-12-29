"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";

export default function ResponsiveLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Don't show sidebar on login page
  const isLoginPage = pathname === "/login";

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
    { href: "/projects", label: "Projects" },
    { href: "/skills", label: "Skills" },
    { href: "/messages", label: "Messages" },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // If on login page, just show children without sidebar
  if (isLoginPage) {
    return children;
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B1220] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-cyan-400">Admin Panel</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded hover:bg-cyan-500/10 text-cyan-400 transition"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-[#0B1220] text-gray-200 border-r border-gray-800 p-4
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          flex flex-col
        `}
      >
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-cyan-400 mb-8 text-center hidden md:block">
            Admin Panel
          </h1>

          <nav className="space-y-2 mt-16 md:mt-0">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className="block px-3 py-2 rounded hover:bg-cyan-500/10 hover:text-cyan-400 transition"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold mt-4"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 pt-20 md:pt-6 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}