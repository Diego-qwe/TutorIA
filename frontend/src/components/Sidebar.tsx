import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-white p-6">

      <h1 className="text-2xl font-bold mb-8">
        🤖 TutorIA
      </h1>

      <nav className="flex flex-col gap-3">

        <Link href="/panel" className="hover:text-blue-400">
          🏠 Inicio
        </Link>

        <Link href="/panel/chat" className="hover:text-blue-400">
          💬 Chat
        </Link>

        <Link href="/panel/progreso" className="hover:text-blue-400">
          📊 Mi progreso
        </Link>

        <Link href="/panel/biblioteca" className="hover:text-blue-400">
          📚 Biblioteca
        </Link>

        <Link href="/panel/ejercicios" className="hover:text-blue-400">
          📝 Ejercicios
        </Link>

        <Link href="/panel/perfil" className="hover:text-blue-400">
          👤 Mi perfil
        </Link>

        <Link href="/panel/configuracion" className="hover:text-blue-400">
          ⚙ Configuración
        </Link>

      </nav>

    </aside>
  );
}