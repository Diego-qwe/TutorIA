import Link from "next/link";

export default function InglesPage() {
  const temas = [
    {
      emoji: "📖",
      titulo: "Vocabulario",
      descripcion:
        "Aprende palabras y expresiones en inglés para situaciones cotidianas.",
    },
    {
      emoji: "📝",
      titulo: "Gramática",
      descripcion:
        "Practica tiempos verbales, pronombres, preposiciones y estructuras gramaticales.",
    },
    {
      emoji: "💬",
      titulo: "Conversación",
      descripcion:
        "Practica conversaciones y aprende a comunicarte de manera natural en inglés.",
    },
    {
      emoji: "📚",
      titulo: "Comprensión lectora",
      descripcion:
        "Lee textos en inglés y desarrolla estrategias para comprender su significado.",
    },
    {
      emoji: "✍️",
      titulo: "Escritura",
      descripcion:
        "Aprende a escribir oraciones, párrafos y textos correctamente en inglés.",
    },
    {
      emoji: "🎓",
      titulo: "Inglés escolar",
      descripcion:
        "Repasa contenidos de inglés de enseñanza básica y enseñanza media.",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <Link
            href="/panel/biblioteca"
            className="text-blue-600 hover:underline"
          >
            ← Volver a Biblioteca
          </Link>

          <h1 className="text-4xl font-bold mt-5">
            🇬🇧 Inglés
          </h1>

          <p className="text-lg text-gray-600 mt-3">
            Aprende vocabulario, gramática, lectura y conversación con TutorIA.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {temas.map((tema) => (
            <div
              key={tema.titulo}
              className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
            >
              <div className="text-4xl mb-4">
                {tema.emoji}
              </div>

              <h2 className="text-xl font-bold mb-3">
                {tema.titulo}
              </h2>

              <p className="text-gray-600">
                {tema.descripcion}
              </p>

              <Link
                href={`/panel/chat?materia=Inglés&tema=${encodeURIComponent(
                  tema.titulo
                )}`}
                className="mt-6 inline-block bg-indigo-600 text-white px-5 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                🤖 Estudiar con TutorIA
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-2">
            🎯 Practica Inglés
          </h2>

          <p className="text-gray-600 mb-5">
            Practica inglés con ejercicios y recibe ayuda personalizada de
            TutorIA.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/panel/ejercicios"
              className="px-5 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              📝 Practicar ejercicios
            </Link>

            <Link
              href="/panel/chat?materia=Inglés"
              className="px-5 py-3 bg-white border border-indigo-200 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition"
            >
              🤖 Estudiar con TutorIA
            </Link>

            <Link
              href="/panel/progreso"
              className="px-5 py-3 bg-white border rounded-xl hover:bg-gray-100 transition"
            >
              📊 Ver mi progreso
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}