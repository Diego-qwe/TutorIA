import Link from "next/link";

export default function Biblioteca() {
  const materias = [
    {
      titulo: "🔢 Matemática",
      descripcion:
        "Álgebra, geometría, porcentajes, funciones y preparación PAES.",
      ruta: "/panel/biblioteca/matematica",
    },
    {
      titulo: "📖 Lenguaje",
      descripcion:
        "Comprensión lectora, gramática, escritura y preparación PAES.",
      ruta: "/panel/biblioteca/lenguaje",
    },
    {
      titulo: "🌎 Historia",
      descripcion:
        "Historia de Chile, historia universal, ciudadanía y preparación PAES.",
      ruta: "/panel/biblioteca/historia",
    },
    {
      titulo: "🧬 Ciencias",
      descripcion:
        "Biología, Física, Química y contenidos de preparación PAES.",
      ruta: "/panel/biblioteca/ciencias",
    },
    {
      titulo: "🇬🇧 Inglés",
      descripcion:
        "Vocabulario, gramática, comprensión lectora, escritura y conversación.",
      ruta: "/panel/biblioteca/ingles",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-3">
              📚 Biblioteca
            </h1>

            <p className="text-lg text-gray-600">
              Explora contenidos y materiales de estudio disponibles
              en TutorIA.
            </p>
          </div>

          <Link
            href="/panel"
            className="self-start px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 transition"
          >
            ← Volver al panel
          </Link>
        </div>

        {/* MATERIAS */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

          {materias.map((materia) => (
            <div
              key={materia.titulo}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition flex flex-col"
            >
              <h2 className="text-2xl font-bold mb-3">
                {materia.titulo}
              </h2>

              <p className="text-gray-600 flex-1">
                {materia.descripcion}
              </p>

              <Link
                href={materia.ruta}
                className="mt-6 inline-block text-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Ver contenido →
              </Link>
            </div>
          ))}

        </div>

        {/* TUTOR IA */}
        <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl p-6">

          <h2 className="text-xl font-bold mb-2">
            🤖 ¿No encuentras lo que necesitas?
          </h2>

          <p className="text-gray-600 mb-4">
            Pregúntale directamente a TutorIA y recibe una
            explicación personalizada.
          </p>

          <Link
            href="/panel/chat"
            className="inline-block bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Preguntar a TutorIA
          </Link>

        </div>

      </div>
    </main>
  );
}