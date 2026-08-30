import Link from "next/link";

export default function Panel() {
  const opciones = [
    {
      titulo: "🤖 Preguntar a TutorIA",
      descripcion:
        "Resuelve tus dudas y recibe explicaciones personalizadas.",
      ruta: "/panel/chat",
    },
    {
      titulo: "📚 Biblioteca",
      descripcion:
        "Encuentra contenidos y recursos educativos.",
      ruta: "/panel/biblioteca",
    },
    {
      titulo: "📝 Ejercicios",
      descripcion:
        "Practica con actividades creadas para ti.",
      ruta: "/panel/ejercicios",
    },
    {
      titulo: "📊 Mi progreso",
      descripcion:
        "Revisa tus avances y tus logros.",
      ruta: "/panel/progreso",
    },
    {
      titulo: "⚙️ Configuración",
      descripcion:
        "Personaliza tu experiencia dentro de TutorIA.",
      ruta: "/panel/configuracion",
    },
    {
      titulo: "👤 Mi perfil",
      descripcion:
        "Revisa los datos de tu cuenta.",
      ruta: "/panel/perfil",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          👋 Bienvenido a TutorIA
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          Tu asistente inteligente para aprender, practicar y mejorar.
        </p>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {opciones.map((opcion) => (
            <Link
              key={opcion.titulo}
              href={opcion.ruta}
              className="p-6 rounded-2xl shadow bg-white hover:shadow-lg hover:-translate-y-1 transition"
            >
              <h2 className="text-2xl font-bold mb-2">
                {opcion.titulo}
              </h2>

              <p className="text-gray-600">
                {opcion.descripcion}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}