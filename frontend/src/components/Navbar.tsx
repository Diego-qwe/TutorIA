export default function Navbar() {
  return (
    <nav className="p-5 flex justify-between items-center">
      <h1 className="text-2xl font-bold">
        🤖 TutorIA
      </h1>

      <div>
        <button className="px-4 py-2 rounded-lg border">
          Iniciar sesión
        </button>
      </div>
    </nav>
  );
}