import "./globals.css";

export const metadata = {
  title: "Portfolio Admin Dashboard",
  description: "Manage your portfolio content locally",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-200 font-sans">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-[#0B1220] text-gray-200 border-r border-gray-800 p-4 hidden md:block">
  <h1 className="text-2xl font-bold text-cyan-400 mb-8 text-center">
    Admin Panel
  </h1>
  <nav className="space-y-2">
    <a
      href="/"
      className="block px-3 py-2 rounded hover:bg-cyan-500/10 hover:text-cyan-400 transition"
    >
      Dashboard
    </a>
    <a
      href="/profile"
      className="block px-3 py-2 rounded hover:bg-cyan-500/10 hover:text-cyan-400 transition"
    >
      Profile
    </a>
    <a
      href="/projects"
      className="block px-3 py-2 rounded hover:bg-cyan-500/10 hover:text-cyan-400 transition"
    >
      Projects
    </a>
    <a
      href="/skills"
      className="block px-3 py-2 rounded hover:bg-cyan-500/10 hover:text-cyan-400 transition"
    >
      Skills
    </a>

    <a
      href="/messages"
      className="block px-3 py-2 rounded hover:bg-cyan-500/10 hover:text-cyan-400 transition"
    >
      Messages
    </a>
  </nav>
</aside>


          {/* Main Content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
