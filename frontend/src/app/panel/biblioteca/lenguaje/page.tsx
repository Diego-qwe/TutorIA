import Link from "next/link";

export default function LenguajePage() {
  const temas = [
    {
      emoji: "📖",
      titulo: "Comprensión lectora",
      descripcion:
        "Aprende a identificar información explícita e implícita y comprender distintos tipos de textos.",
    },
    {
      emoji: "💡",
      titulo: "Idea principal",
      descripcion:
        "Practica cómo reconocer la idea principal, ideas secundarias y propósito de un texto.",
    },
    {
      emoji: "🧠",
      titulo: "Inferencias",
      descripcion:
        "Aprende a obtener conclusiones utilizando información que no aparece directamente en el texto.",
    },
    {
      emoji: "📝",
      titulo: "Tipos de texto",
      descripcion:
        "Estudia textos narrativos, expositivos, argumentativos e informativos.",
    },
    {
      emoji: "🔍",
      titulo: "Vocabulario en contexto",
      descripcion:
        "Descubre el significado de palabras y expresiones utilizando las pistas del texto.",
    },
    {
      emoji: "🎓",
      titulo: "Preparación PAES",
      descripcion:
        "Practica habilidades de Competencia Lectora con ejercicios similares a la PAES.",
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
            📚 Lenguaje
          </h1>

          <p className="text-lg text-gray-600 mt-3">
            Mejora tu comprensión lectora y prepárate junto a TutorIA.
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
                href={`/panel/chat?materia=Lenguaje&tema=${encodeURIComponent(
                  tema.titulo
                )}`}
                className="mt-6 inline-block bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 transition"
              >
                🤖 Estudiar con TutorIA
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-purple-50 border border-purple-100 rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-2">
            🎯 Practica Lenguaje
          </h2>

          <p className="text-gray-600 mb-5">
            Practica comprensión lectora y otros contenidos con ejercicios
            generados automáticamente por TutorIA.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/panel/ejercicios"
              className="px-5 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition"
            >
              📝 Practicar ejercicios
            </Link>

            <Link
              href="/panel/chat"
              className="px-5 py-3 bg-white border border-purple-200 text-purple-700 font-semibold rounded-xl hover:bg-purple-50 transition"
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