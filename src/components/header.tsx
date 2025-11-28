"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Verifica o localStorage apenas no cliente para evitar erros de Hidratação
    const role = localStorage.getItem("role");
    setIsLoggedIn(!!role);
  }, []);

  return (
    <header className="mt-2 w-full max-w-7xl mx-auto bg-white border-2 shadow-md m-2 rounded-2xl p-2">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <GraduationCap className="w-8 h-8 text-blue-600" />
          EduBlog
        </Link>

        {/* Menu desktop */}
        <ul className="hidden md:flex gap-6 font-medium text-gray-600 items-center">
          <li><Link href="/" className="hover:text-blue-600 transition">Inicio</Link></li>
          {isLoggedIn ? (
            <>
              <li><Link href="/post/my-post" className="hover:text-blue-600 transition">Publicações</Link></li>
              <li><Link href="/post/criar" className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">Criar post</Link></li>
            </>
          ) : (
            <li><Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">Login</Link></li>
          )}
        </ul>

        {/* Botão do menu mobile */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </nav>

      {/* Menu mobile */}
      {open && (
        <ul className="md:hidden bg-gray-50 border-t flex flex-col p-4 gap-3 text-gray-700 font-medium">
          <li><Link href="/">Inicio</Link></li>
          {isLoggedIn ? (
            <>
              <li><Link href="/post/my-post">Publicações</Link></li>
              <li><Link href="/post/criar" className="bg-blue-600 text-white px-4 py-2 rounded-xl">Criar post</Link></li>
            </>
          ) : (
            <li><Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-xl">Login</Link></li>
          )}
        </ul>
      )}
    </header>
  );
}